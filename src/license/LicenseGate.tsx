import { useEffect, useState, type ReactNode } from 'react';
import i18n from '../i18n/config';
import { domainMatches, lockApplies, verifyLicenseToken, verifyLockDoc } from './verify';

/**
 * Second, independent license layer in the browser. It reads the license from
 * the backend and re-verifies the vendor's signature, the licensed hosts, the
 * expiry and any vendor lock itself, so a modified backend cannot unlock the
 * UI. When the license is not valid it shows a neutral "system unavailable"
 * screen that still lets an admin export their data. It never deletes anything.
 *
 * The whole app (public marketing site + patient portal + admin) is wrapped by
 * this gate, so the status endpoint is read anonymously — it is public on the
 * backend and returns only the signed, verify-only license token, never a
 * secret.
 *
 * Production builds always enforce (the backend's `enforced` flag is ignored);
 * a development server follows the backend. A build can opt out only at build
 * time with VITE_LICENSE_REQUIRED=0, which is under the vendor's control.
 */
const REQUIRED = import.meta.env.PROD && import.meta.env.VITE_LICENSE_REQUIRED !== '0';

// The data export is admin-only.
const EXPORT_ENABLED = true;

// API base (includes the /api prefix), mirroring the app's apiClient.
const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'http://localhost:8000/api';

// Last license this browser verified, used if the license request fails.
const CACHE_KEY = 'hospital_sys_cache';
const AUTH_TOKEN_KEY = 'auth_token';

type GateState = 'checking' | 'ok' | 'grace' | 'locked';

interface LicenseResponse {
  state: string;
  allowed: boolean;
  enforced: boolean;
  token?: string | null;
  lockDoc?: unknown;
}

function evaluate(token: string | null | undefined, lockDoc: unknown, now = Date.now()): { state: GateState; reason: string } {
  const verified = token ? verifyLicenseToken(token) : { valid: false, payload: null };
  if (!verified.valid || !verified.payload) return { state: 'locked', reason: token ? 'signature' : 'missing' };

  const license = verified.payload;
  if (!domainMatches(license)) return { state: 'locked', reason: 'domain' };

  if (lockDoc) {
    const lock = verifyLockDoc(lockDoc);
    if (lock.valid && lock.payload && lockApplies(lock.payload, license.license_id ?? '')) {
      return { state: 'locked', reason: 'revoked' };
    }
  }

  if (license.expires_at) {
    const expires = new Date(license.expires_at).getTime();
    const graceMs = (license.grace_days ?? 7) * 86_400_000;
    if (now > expires + graceMs) return { state: 'locked', reason: 'expired' };
    if (now > expires) return { state: 'grace', reason: 'grace' };
  }

  return { state: 'ok', reason: '' };
}

function readCache(): { token: string; lockDoc: unknown } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(token: string, lockDoc: unknown) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ token, lockDoc: lockDoc ?? null }));
  } catch {
    // Storage unavailable (private mode): the live check still applies.
  }
}

function authToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function LicenseGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GateState>('checking');

  useEffect(() => {
    let active = true;
    const apply = (r: { state: GateState; reason: string }) => {
      if (active) setState(r.state);
    };

    const token = authToken();
    fetch(`${API_BASE}/system/status`, {
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      })
      .then((body: { data: LicenseResponse }) => {
        const data = body.data;
        if (!REQUIRED && !data.enforced) return apply({ state: 'ok', reason: '' });

        const result = evaluate(data.token, data.lockDoc);
        // Remember a license that verified, for the offline fallback below.
        if (data.token && result.reason !== 'signature') writeCache(data.token, data.lockDoc);
        // Either layer saying "not allowed" locks the UI.
        if (result.state !== 'locked' && !data.allowed) return apply({ state: 'locked', reason: data.state });
        apply(result);
      })
      .catch(() => {
        if (!REQUIRED) return apply({ state: 'ok', reason: '' });
        // License endpoint unreachable: a license this browser already verified
        // keeps working (so a network blip never locks a paying client); with
        // nothing verified, stay locked.
        const cached = readCache();
        apply(cached ? evaluate(cached.token, cached.lockDoc) : { state: 'locked', reason: 'unverified' });
      });

    return () => {
      active = false;
    };
  }, []);

  if (state === 'checking') return null;
  // Whatever the cause (expiry, suspension, wrong host...), users only see a
  // neutral "unavailable" screen. The cause is visible to the vendor through
  // `php artisan license:status` on the server.
  if (state === 'locked') return <LockScreen />;

  return <>{children}</>;
}

const TEXT = {
  en: {
    title: 'System unavailable',
    message: 'This system is currently unavailable.',
    contact: 'Please contact the system administrator.',
    export: 'Export my data',
    exporting: 'Preparing export…',
    exportFailed: 'The export could not be downloaded. Please sign in as an administrator and try again.',
  },
  ar: {
    title: 'النظام غير متاح',
    message: 'النظام غير متاح حاليًا.',
    contact: 'يرجى التواصل مع مسؤول النظام.',
    export: 'تصدير بياناتي',
    exporting: 'جارٍ تجهيز التصدير…',
    exportFailed: 'تعذّر تنزيل التصدير. يرجى تسجيل الدخول بحساب مسؤول والمحاولة مرة أخرى.',
  },
};

function strings() {
  return i18n.language?.startsWith('ar') ? TEXT.ar : TEXT.en;
}

function LockScreen() {
  const t = strings();
  const [exporting, setExporting] = useState(false);
  const [failed, setFailed] = useState(false);

  async function exportData() {
    setExporting(true);
    setFailed(false);
    try {
      const token = authToken();
      const res = await fetch(`${API_BASE}/system/export`, {
        headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (!res.ok) throw new Error(String(res.status));

      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement('a');
      a.href = url;
      a.download = `appointments-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setFailed(true);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div role="alert" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#e2e8f0', padding: 24 }}>
      <div style={{ maxWidth: 460, textAlign: 'center' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>{t.title}</h1>
        <p style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 8 }}>{t.message}</p>
        <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 24 }}>{t.contact}</p>
        {EXPORT_ENABLED && <button
          onClick={exportData}
          disabled={exporting}
          style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, cursor: 'pointer', opacity: exporting ? 0.6 : 1 }}
        >
          {exporting ? t.exporting : t.export}
        </button>}
        {failed && <p style={{ fontSize: 13, color: '#fca5a5', marginTop: 12 }}>{t.exportFailed}</p>}
      </div>
    </div>
  );
}
