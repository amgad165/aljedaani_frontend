// Per-client build lock. VITE_LICENSE_DOMAINS (comma-separated) and
// VITE_CLIENT_WATERMARK are baked into the bundle at build time by the
// `build:client` script. The watermark is a hidden, unique per-client marker:
// if a build ever leaks, it identifies whose copy it was.

export const CLIENT_WATERMARK = (import.meta.env.VITE_CLIENT_WATERMARK as string) || 'dev';

function normalizeHost(host: string): string {
  return host.toLowerCase().replace(/^www\./, '');
}

/**
 * If the build was pinned to specific domains, refuse to run anywhere else.
 * Shows a blank page (disable, never destroy). Localhost is always allowed so
 * the build can be smoke-tested.
 */
export function enforceBuildDomain(): void {
  const raw = (import.meta.env.VITE_LICENSE_DOMAINS as string | undefined)?.trim();
  if (!raw) return;

  const here = normalizeHost(window.location.hostname);
  if (here === 'localhost' || here === '127.0.0.1') return;

  const allowed = raw.split(',').map((d) => normalizeHost(d.trim())).filter(Boolean);
  if (allowed.includes(here)) return;

  // Not an authorized domain for this build.
  document.documentElement.innerHTML = '';
  // Leave a trace of which build this was, for evidence.
  document.title = '';
  const marker = document.createComment(`build:${CLIENT_WATERMARK}`);
  document.documentElement.appendChild(marker);
  throw new Error('unavailable');
}
