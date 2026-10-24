'use client';

import React from 'react';
import { useTranslation } from '@/i18n';
import { IconRegistry } from '@/components/common/IconRegistry';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { AdminBreadcrumb } from './AdminBreadcrumb';
import { useAdminTelemetry } from '@/providers/AdminTelemetryProvider';

export interface AdminHeaderProps {
  onToggleMobile: () => void;
  isMobileOpen: boolean;
}

export function AdminHeader({ onToggleMobile, isMobileOpen }: AdminHeaderProps) {
  const { t } = useTranslation();
  const telemetry = useAdminTelemetry();

  const getStatusDisplay = () => {
    switch (telemetry.status) {
      case 'pass':
        return {
          dotClass: 'bg-[var(--color-status-pass)]',
          label: 'PASS: HEALTHY',
          icon: null,
        };
      case 'warn':
        return {
          dotClass: 'bg-[var(--color-status-warn)]',
          label: 'WARN: DEGRADED',
          icon: 'alert-triangle',
        };
      case 'fail':
        return {
          dotClass: 'bg-[var(--color-status-fail)]',
          label: 'FAIL: DOWN',
          icon: 'alert-triangle',
        };
      case 'offline':
        return {
          dotClass: 'bg-[var(--color-status-offline)]',
          label: 'OFFLINE: UNREACHABLE',
          icon: null,
        };
      case 'loading':
      default:
        return {
          dotClass: 'bg-[var(--color-status-loading)] animate-pulse',
          label: 'CONNECTING...',
          icon: null,
        };
    }
  };

  const statusConfig = getStatusDisplay();

  return (
    <header
      id="admin-header"
      className="sticky top-0 z-10 h-14 border-b border-[var(--border)] bg-[#000000]/80 backdrop-blur-md px-6 flex items-center justify-between"
    >
      {/* Left: Mobile hamburger & Dynamic Breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={onToggleMobile}
          className="md:hidden p-1.5 text-[#999999] hover:text-white focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          aria-label="Toggle Navigation"
          aria-expanded={isMobileOpen}
        >
          <IconRegistry name={isMobileOpen ? 'close' : 'menu'} size={18} />
        </button>

        {/* Dynamic Breadcrumbs */}
        <AdminBreadcrumb />
      </div>

      {/* Right: Telemetry status chip, LanguageSwitcher, CTA */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Real-time Status Chip */}
        <div
          className="v-chip !px-2.5 !py-1 text-[11px]"
          role="status"
          aria-live="polite"
        >
          <span className={`v-chip-dot ${statusConfig.dotClass}`} />
          {statusConfig.icon && (
            <IconRegistry name={statusConfig.icon} size={11} className="text-[#999999]" />
          )}
          <span>{statusConfig.label}</span>
        </div>

        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Action Button: 0px square brutalist CTA */}
        <button
          type="button"
          onClick={() => telemetry.refresh()}
          className="btn-square text-xs px-3 py-1.5 hidden sm:inline-flex gap-1.5"
          title="Trigger instant telemetry sync"
        >
          <span>{t('common.refresh')}</span>
          <span className="text-[10px]">⟳</span>
        </button>
      </div>
    </header>
  );
}

export default AdminHeader;
