'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/i18n';
import { PORTAL_NAV_ITEMS } from '@/config/portal-nav';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { IconRegistry } from '@/components/common/IconRegistry';
import { Logo } from '@/components/common/Logo';

export function PortalNavbar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-[var(--border)] bg-[#000000]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center gap-6">
          <Logo
            href="/"
            title={t('common.appName')}
            subtitle="PORTAL // v0.1.0"
          />

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {PORTAL_NAV_ITEMS.map((item) => {
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`px-3 py-1.5 text-xs font-mono transition-colors ${isActive
                    ? 'text-[#FFFFFF] bg-[var(--muted)] font-medium'
                    : 'text-[#999999] hover:text-[#FFFFFF] hover:bg-white/5'
                    }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section: LanguageSwitcher & CTA */}
        <div className="hidden md:flex items-center gap-4">
          <LanguageSwitcher />

          <Link
            href="/admin"
            className="btn-square text-xs px-3.5 py-1.5 gap-1.5"
          >
            <span>{t('portal.cta.admin')}</span>
            <span className="text-[11px]">↗</span>
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-1.5 text-[#999999] hover:text-[#FFFFFF] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileOpen}
          >
            <IconRegistry name={isMobileOpen ? 'close' : 'menu'} size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="md:hidden border-b border-[var(--border)] bg-[#0a0a0a] px-6 py-4 space-y-4">
          <nav className="flex flex-col space-y-1">
            {PORTAL_NAV_ITEMS.map((item) => {
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`px-3 py-2 text-xs font-mono transition-colors ${isActive
                    ? 'text-[#FFFFFF] bg-[var(--muted)] font-medium'
                    : 'text-[#999999] hover:text-[#FFFFFF]'
                    }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
            <LanguageSwitcher />
            <Link
              href="/admin"
              onClick={() => setIsMobileOpen(false)}
              className="btn-square text-xs px-3.5 py-1.5 gap-1.5"
            >
              <span>{t('portal.cta.admin')}</span>
              <span className="text-[11px]">↗</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default PortalNavbar;
