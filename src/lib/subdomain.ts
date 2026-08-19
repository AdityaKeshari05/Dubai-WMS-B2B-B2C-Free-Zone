/**
 * Extracts the workspace subdomain slug from a hostname.
 */
export function extractSubdomain(hostname?: string): string | null {
  const host = (
    hostname || (typeof window !== 'undefined' ? window.location.hostname : '')
  ).toLowerCase().split(':')[0]; // strip port if present

  if (!host) return null;

  // Handle localhost subdomains (e.g. mrftyre.localhost)
  if (host.includes('localhost')) {
    const parts = host.split('.');
    if (parts.length > 1 && parts[0] !== 'localhost' && parts[0] !== 'www') {
      return parts[0];
    }
    return null;
  }

  // Handle IP addresses (127.0.0.1, etc.)
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) {
    return null;
  }

  const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'erp.com').toLowerCase();

  // If host is exactly the root domain or www
  if (host === rootDomain || host === `www.${rootDomain}`) {
    return null;
  }

  // If host ends with the root domain (e.g. mrftyre.erp.com)
  if (host.endsWith(`.${rootDomain}`)) {
    const sub = host.slice(0, -(rootDomain.length + 1));
    if (sub && sub !== 'www') {
      return sub;
    }
  }

  // General fallback for multi-part hostnames (e.g. mrftyre.domain.com)
  const parts = host.split('.');
  if (parts.length >= 3 && parts[0] !== 'www') {
    return parts[0];
  }

  return null;
}
