/**
 * API configuration for the landing page (App Router).
 * Uses the same pattern as src/config/config.ts but works client-side.
 */

export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') return 'http://localhost:4000';

  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:4000';
  }
  return 'http://dashboard.cds.net.co';
}
