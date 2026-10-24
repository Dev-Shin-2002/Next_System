export interface PortalNavItem {
  id: string;
  labelKey: string;
  href: string;
  exact?: boolean;
}

export const PORTAL_NAV_ITEMS: PortalNavItem[] = [
  { id: 'home', labelKey: 'portal.nav.overview', href: '/', exact: true },
  { id: 'docs', labelKey: 'portal.nav.docs', href: '/docs' },
  { id: 'status', labelKey: 'portal.nav.status', href: '/status' },
];
