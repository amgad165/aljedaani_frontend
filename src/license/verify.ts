// Independent, in-browser verification of the vendor's signed license. This is
// the second protection layer: even if the backend is patched to claim the app
// is licensed, the frontend re-checks the Ed25519 signature with its own
// embedded public key, so a forged or edited license is still rejected here.
import nacl from 'tweetnacl';
import { LICENSE_PUBLIC_KEY_B64 } from './publicKey';

export interface LicensePayload {
  license_id?: string;
  customer?: string;
  product?: string;
  domain?: string;
  domains?: string[];
  features?: string[];
  issued_at?: string;
  expires_at?: string | null;
  grace_days?: number;
}

export interface LockPayload {
  action?: 'lock' | 'unlock';
  license_id?: string;
  updated_at?: string;
  licenses?: Record<string, string>;
}

function b64ToBytes(value: string): Uint8Array | null {
  try {
    const norm = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = norm + '='.repeat((4 - (norm.length % 4)) % 4);
    const bin = atob(padded);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}

const PUBLIC_KEY = b64ToBytes(LICENSE_PUBLIC_KEY_B64);

/**
 * Verify a license key string: base64url(payload).base64url(signature).
 * The signature covers the exact payload bytes, so we verify those bytes
 * directly rather than re-serializing (no cross-language JSON ambiguity).
 */
export function verifyLicenseToken(token: string): { valid: boolean; payload: LicensePayload | null } {
  if (!PUBLIC_KEY || !token || !token.includes('.')) return { valid: false, payload: null };

  const [payloadPart, sigPart] = token.split('.', 2);
  const payloadBytes = b64ToBytes(payloadPart);
  const sigBytes = b64ToBytes(sigPart);
  if (!payloadBytes || !sigBytes) return { valid: false, payload: null };

  let payload: LicensePayload | null = null;
  try {
    payload = JSON.parse(new TextDecoder().decode(payloadBytes));
  } catch {
    return { valid: false, payload: null };
  }

  const valid = nacl.sign.detached.verify(payloadBytes, sigBytes, PUBLIC_KEY);
  return { valid, payload: valid ? payload : null };
}

/** Recursively key-sorted JSON that matches the vendor tool's canonical form. */
function canonical(value: unknown): string {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value && typeof value === 'object') {
    const keys = Object.keys(value as Record<string, unknown>).sort();
    return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonical((value as Record<string, unknown>)[k])).join(',') + '}';
  }
  return JSON.stringify(value ?? null);
}

/**
 * Does a verified lock document actually lock THIS license? A push command
 * must name it with action "lock"; a status file must list it as "locked".
 */
export function lockApplies(payload: LockPayload, licenseId: string): boolean {
  if (payload.action) return payload.action === 'lock' && payload.license_id === licenseId;
  return payload.licenses?.[licenseId] === 'locked';
}

/** Verify a signed lock document { payload, signature }. Accepts an object or its JSON string. */
export function verifyLockDoc(doc: unknown): { valid: boolean; payload: LockPayload | null } {
  if (typeof doc === 'string') {
    try {
      doc = JSON.parse(doc);
    } catch {
      return { valid: false, payload: null };
    }
  }
  if (!PUBLIC_KEY || !doc || typeof doc !== 'object') return { valid: false, payload: null };
  const d = doc as { payload?: unknown; signature?: unknown };
  if (!d.payload || typeof d.signature !== 'string') return { valid: false, payload: null };

  const msgBytes = new TextEncoder().encode(canonical(d.payload));
  const sigBytes = b64ToBytes(d.signature);
  if (!sigBytes) return { valid: false, payload: null };

  const valid = nacl.sign.detached.verify(msgBytes, sigBytes, PUBLIC_KEY);
  return { valid, payload: valid ? (d.payload as LockPayload) : null };
}

function normalizeHost(host: string): string {
  return host.toLowerCase().replace(/^https?:\/\//, '').split('/')[0].split(':')[0].replace(/^www\./, '');
}

/** Hosts a license covers (the `domains` list, or the older single `domain`). */
export function licensedHosts(payload: LicensePayload): string[] {
  const list = payload.domains ?? (payload.domain ? [payload.domain] : []);
  return list.map(normalizeHost).filter(Boolean);
}

/** Does the license cover the page we are running on? */
export function domainMatches(payload: LicensePayload): boolean {
  const hosts = licensedHosts(payload);
  if (hosts.length === 0) return true; // unbound license
  const here = normalizeHost(window.location.hostname);
  if (hosts.includes(here)) return true;
  // Local development server only; production builds must be licensed for the host.
  return import.meta.env.DEV && (here === 'localhost' || here === '127.0.0.1');
}
