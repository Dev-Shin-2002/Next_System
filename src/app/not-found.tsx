'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/i18n';
import { Logo } from '@/components/common/Logo';
import { Typography } from '@/components/common/Typography';
import { IconRegistry } from '@/components/common/IconRegistry';
import { TOKENS } from '@/theme';

export default function GlobalNotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#000000] text-[#ffffff] flex flex-col relative overflow-hidden select-none">
      {/* Background radial accent glow & grid pattern */}
      <div className="absolute inset-0 pointer-events-none radial-glow opacity-80" />
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Top Header */}
      <header className="relative z-10 h-14 px-6 flex items-center justify-between border-b border-white/10 backdrop-blur-sm">
        <Logo href="/" subtitle="STATUS // 404" />

        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-mono text-[#999999] hover:text-[#ffffff] transition-colors"
        >
          <IconRegistry name="chevron-left" size={14} />
          <span>{t('portal.nav.overview')}</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-xl flex flex-col items-center gap-6">
          {/* Status Chip */}
          <div className="v-chip !px-3.5 !py-1.5 text-xs">
            <span className="v-chip-dot bg-[var(--color-status-warn)]" />
            <span className="text-[#f59e0b] font-semibold tracking-wider font-mono">
              ERROR CODE // 0x404
            </span>
          </div>

          {/* Huge 404 Metric */}
          <div className="flex flex-col items-center">
            <Typography
              variant="metric"
              style={{
                fontSize: 'clamp(5rem, 12vw, 8rem)',
                lineHeight: '1',
                color: '#ffffff',
                letterSpacing: '-0.06em',
              }}
            >
              404
            </Typography>

            <Typography variant="h2" align="center" style={{ marginTop: '0.75rem' }}>
              {t('errors.notFound')}
            </Typography>

            <Typography
              variant="body"
              color="muted"
              align="center"
              style={{ maxWidth: '480px', marginTop: '0.5rem' }}
            >
              The requested resource or endpoint is not registered in the system routing table. It may have been moved, decommissioned, or never existed.
            </Typography>
          </div>

          {/* Diagnostic Info Terminal Card */}
          <div
            className="w-full max-w-md bg-[#0a0a0a] border border-white/10 p-4 text-left font-mono text-xs text-[#999999] flex flex-col gap-1.5 shadow-xl"
            style={{ borderRadius: TOKENS.radius.card }}
          >
            <div className="flex items-center justify-between text-[11px] text-[#999999]/60 border-b border-white/5 pb-2 mb-1">
              <span>SYSTEM DIAGNOSTIC</span>
              <span>PROTOCOL v2.4</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#999999]">STATUS:</span>
              <span className="text-[#f59e0b]">404 NOT_FOUND</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#999999]">ROUTER:</span>
              <span className="text-white">EDGE_DISPATCHER</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#999999]">ACTION:</span>
              <span className="text-[#52a8ff]">REROUTE_RECOMMENDED</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            <Link
              href="/"
              className="btn-square h-10 px-6 flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider bg-white text-[#121212] hover:bg-[#e7e7e7] transition-colors"
              style={{ borderRadius: TOKENS.radius.button }}
            >
              <IconRegistry name="chevron-left" size={14} />
              <span>RETURN TO PORTAL</span>
            </Link>

            <Link
              href="/admin"
              className="h-10 px-6 flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider bg-[#0a0a0a] text-white border border-white/15 hover:border-white/30 transition-colors"
              style={{ borderRadius: TOKENS.radius.button }}
            >
              <span>ADMIN CONSOLE</span>
              <IconRegistry name="chevron-right" size={14} />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 h-12 px-6 flex items-center justify-center border-t border-white/5 text-[10px] font-mono text-[#999999]/60">
        SYSTEM RECOVERY RUNTIME // 404 HANDLER // DARK TECH AESTHETIC
      </footer>
    </div>
  );
}
