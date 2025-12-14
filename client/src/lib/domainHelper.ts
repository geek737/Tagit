export function isAdminSubdomain(): boolean {
  if (typeof window === 'undefined') return false;

  const hostname = window.location.hostname;
  const pathname = window.location.pathname;

  const adminDomain = import.meta.env.VITE_ADMIN_SUBDOMAIN || 'admin.tagit.ma';

  if (hostname === adminDomain) {
    return true;
  }

  if (hostname.startsWith('admin.')) {
    return true;
  }

  const isDev = hostname === 'localhost' ||
                hostname.includes('.replit.dev') ||
                hostname.includes('.bolt.') ||
                hostname.includes('.webcontainer.') ||
                import.meta.env.DEV;

  if (isDev && pathname.startsWith('/admin')) {
    return true;
  }

  return false;
}

export function getAdminPath(path: string): string {
  const isAdmin = isAdminSubdomain();

  if (isAdmin) {
    return path.replace(/^\/admin/, '');
  }

  return path;
}

export function getAdminUrl(path: string = ''): string {
  const adminDomain = import.meta.env.VITE_ADMIN_SUBDOMAIN || 'admin.tagit.ma';
  const protocol = window.location.protocol;

  const cleanPath = path.replace(/^\/admin/, '').replace(/^\//, '');

  return `${protocol}//${adminDomain}/${cleanPath}`;
}

export function getPublicUrl(path: string = ''): string {
  const publicDomain = import.meta.env.VITE_PUBLIC_DOMAIN || 'tagit.ma';
  const protocol = window.location.protocol;

  const cleanPath = path.replace(/^\//, '');

  return `${protocol}//${publicDomain}/${cleanPath}`;
}
