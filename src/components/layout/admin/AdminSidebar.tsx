'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/i18n';
import { ADMIN_NAV_ITEMS, ADMIN_NAV_GROUPS, NavItem } from '@/config/admin-nav';
import { IconRegistry } from '@/components/common/IconRegistry';
import { useAdminTelemetry } from '@/providers/AdminTelemetryProvider';

export interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export function AdminSidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}: AdminSidebarProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const telemetry = useAdminTelemetry();

  // Auto-close mobile drawer on route change
  useEffect(() => {
    onCloseMobile();
  }, [pathname, onCloseMobile]);

  const renderNavGroup = (groupKey: string) => {
    const items = ADMIN_NAV_ITEMS.filter((item) => item.groupKey === groupKey);
    if (!items.length) return null;

    return (
      <div key={groupKey} className="space-y-1">
        {!isCollapsed && (
          <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[#999999]/60 select-none">
            {t(groupKey)}
          </div>
        )}
        <div className="space-y-0.5">
          {items.map((item: NavItem) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + '/');

            let badgeCount: number | undefined;
            if (item.badgeKey && telemetry[item.badgeKey] !== undefined) {
              badgeCount = telemetry[item.badgeKey];
            }

            const formattedBadge = badgeCount && badgeCount > 99 ? '99+' : badgeCount;

            return (
              <div key={item.id} className="relative group">
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 text-xs font-mono transition-colors border-l-2 ${isActive
                      ? 'border-[var(--color-primary)] bg-[var(--muted)] text-white font-medium'
                      : 'border-transparent text-[#999999] hover:text-white hover:bg-white/5'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={t(item.labelKey)}
                >
                  <IconRegistry
                    name={item.icon}
                    size={16}
                    className={isActive ? 'text-[var(--color-primary)]' : 'text-[#999999]'}
                  />

                  {!isCollapsed && (
                    <span className="truncate flex-1">{t(item.labelKey)}</span>
                  )}

                  {!isCollapsed && formattedBadge ? (
                    <span className="v-chip !px-1.5 !py-0.2 text-[10px] !bg-black border border-white/10">
                      {formattedBadge}
                    </span>
                  ) : null}
                </Link>

                {/* Floating tooltip on collapsed desktop */}
                {isCollapsed && (
                  <div className="hidden md:group-hover:flex absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-[#1f1f1f] border border-[var(--border)] text-white text-xs font-mono whitespace-nowrap z-50 pointer-events-none shadow-lg">
                    <span>{t(item.labelKey)}</span>
                    {formattedBadge ? (
                      <span className="ml-1.5 px-1 py-0.2 bg-[#000000] text-[#52a8ff] text-[10px]">
                        {formattedBadge}
                      </span>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#000000] border-r border-[var(--border)] select-none">
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between px-3.5 border-b border-[var(--border)]">
        <Link href="/admin" className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#FFFFFF] text-[#121212] font-mono font-bold text-xs">
            SM
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <span className="text-sm font-semibold tracking-tight leading-none text-white block truncate">
                {t('common.appName')}
              </span>
              <span className="text-[10px] text-[#999999] font-mono tracking-wider">
                ADMIN CONSOLE
              </span>
            </div>
          )}
        </Link>

        {/* Mobile close button */}
        <button
          type="button"
          onClick={onCloseMobile}
          className="md:hidden p-1.5 text-[#999999] hover:text-white"
          aria-label="Close navigation drawer"
        >
          <IconRegistry name="close" size={18} />
        </button>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4">
        {ADMIN_NAV_GROUPS.map((group) => renderNavGroup(group.key))}
      </nav>

      {/* Sidebar Footer with Collapse Toggle */}
      <div className="p-3 border-t border-[var(--border)] flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2 truncate">
            <div className="w-2 h-2 rounded-full bg-[var(--color-status-pass)]" />
            <span className="text-[11px] font-mono text-[#999999] truncate">NODE // ONLINE</span>
          </div>
        )}

        {/* Desktop Collapse Toggle */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className={`hidden md:inline-flex p-1.5 text-[#999999] hover:text-white hover:bg-[var(--muted)] border border-transparent hover:border-[var(--border)] transition-colors ${isCollapsed ? 'mx-auto' : ''
            }`}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!isCollapsed}
        >
          <IconRegistry name={isCollapsed ? 'chevron-right' : 'chevron-left'} size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside
        className={`hidden md:block fixed top-0 bottom-0 left-0 z-20 transition-[width] duration-200 ease-in-out ${isCollapsed ? 'w-[var(--sidebar-width-collapsed)]' : 'w-[var(--sidebar-width)]'
          }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Backdrop Scrim */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Mobile Off-canvas Drawer */}
      <aside
        className={`md:hidden fixed top-0 bottom-0 left-0 z-50 w-[var(--sidebar-width)] transition-transform duration-200 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        aria-modal="true"
        role="dialog"
      >
        {sidebarContent}
      </aside>
    </>
  );
}

export default AdminSidebar;
