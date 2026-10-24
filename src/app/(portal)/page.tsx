'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/i18n';

export default function PortalPage() {
  const { t } = useTranslation();

  const capabilities = [
    {
      title: 'Real-time Telemetry',
      code: 'TELEMETRY // LIVE',
      description: 'Continuous monitoring of CPU cores, memory utilization, disk volumes, and network ingress.',
      status: 'pass',
    },
    {
      title: 'Event Stream & Tracing',
      code: 'TRACING // 0x88F',
      description: 'Granular distributed span breakdown across API gateways, session auth, and connection pools.',
      status: 'active',
    },
    {
      title: 'Edge Route Sentinel',
      code: 'MIDDLEWARE // AUTH',
      description: 'Centralized edge guard verifying operator privileges, rate limiting, and administrative access.',
      status: 'pass',
    },
    {
      title: 'Monospace Diagnostic Logs',
      code: 'LOGS // AUDIT',
      description: 'High-density, structured audit trails and live kernel streams with locale synchronization.',
      status: 'warn',
    },
  ];

  return (
    <div className="space-y-12 py-6">
      {/* Hero Section */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[var(--muted)] border border-[var(--border)] rounded-[100px] text-xs font-mono text-[#999999]">
          <span className="w-2 h-2 rounded-full bg-[var(--color-status-pass)] inline-block" />
          <span>PORTAL // READY FOR DEPLOYMENT</span>
        </div>

        <h1 className="headline-fluid text-4xl sm:text-5xl font-medium tracking-[-2px] text-[#FFFFFF]">
          {t('portal.title')}
        </h1>

        <p className="text-base text-[#e7e7e7] leading-relaxed">
          {t('portal.subtitle')}
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <Link
            href="/admin"
            className="btn-square text-sm px-5 py-2.5 gap-2"
          >
            <span>{t('portal.cta.admin')}</span>
            <span className="text-xs">↗</span>
          </Link>

          <Link
            href="/docs"
            className="btn-square text-sm px-5 py-2.5 bg-[#1f1f1f] text-[#FFFFFF] border border-[var(--border)] hover:bg-[#2a2a2a] gap-2"
          >
            <span>{t('portal.nav.docs')}</span>
          </Link>
        </div>
      </div>

      {/* Grid of Core Capabilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {capabilities.map((cap, idx) => (
          <div
            key={idx}
            className="p-6 bg-[#0a0a0a] border border-[var(--border)] hover:border-[#52a8ff]/40 transition-colors space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#52a8ff]">{cap.code}</span>
              <div className="v-chip !px-2 !py-0.5 text-[10px]">
                <span
                  className={`v-chip-dot ${cap.status === 'pass'
                    ? 'bg-[var(--color-status-pass)]'
                    : cap.status === 'warn'
                      ? 'bg-[var(--color-status-warn)]'
                      : 'bg-[var(--color-primary)]'
                    }`}
                />
                <span>{cap.status.toUpperCase()}</span>
              </div>
            </div>

            <h3 className="text-lg font-medium text-[#FFFFFF] font-sans">
              {cap.title}
            </h3>

            <p className="text-xs text-[#999999] leading-relaxed">
              {cap.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
