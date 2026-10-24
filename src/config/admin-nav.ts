export interface NavItem {
  id: string;
  labelKey: string;
  href: string;
  icon: string;
  exact?: boolean;
  groupKey: string;
  badgeKey?: 'alertsCount' | 'activeTasks';
}

export const ADMIN_NAV_GROUPS = [
  { key: 'nav.groups.monitoring' },
  { key: 'nav.groups.observability' },
  { key: 'nav.groups.system' },
] as const;

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', labelKey: 'nav.dashboard', href: '/admin', icon: 'dashboard', exact: true, groupKey: 'nav.groups.monitoring' },
  { id: 'services', labelKey: 'nav.services', href: '/admin/services', icon: 'services', groupKey: 'nav.groups.monitoring' },
  { id: 'tasks', labelKey: 'nav.tasks', href: '/admin/tasks', icon: 'tasks', groupKey: 'nav.groups.monitoring', badgeKey: 'activeTasks' },
  { id: 'logs', labelKey: 'nav.logs', href: '/admin/logs', icon: 'logs', groupKey: 'nav.groups.observability' },
  { id: 'metrics', labelKey: 'nav.metrics', href: '/admin/metrics', icon: 'metrics', groupKey: 'nav.groups.observability' },
  { id: 'alerts', labelKey: 'nav.alerts', href: '/admin/alerts', icon: 'alerts', groupKey: 'nav.groups.observability', badgeKey: 'alertsCount' },
  { id: 'settings', labelKey: 'nav.settings', href: '/admin/settings', icon: 'settings', groupKey: 'nav.groups.system' },
];
