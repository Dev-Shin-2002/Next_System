'use client';

import React from 'react';
import Link from 'next/link';
import { getPublicStatus } from '@/lib/public-status';

export function PortalFooter() {
  const statusData = getPublicStatus();

  return (
    <footer className="border-t border-[var(--border)] bg-[#000000] py-8 text-xs font-mono text-[#999999]">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Operational status indicator */}
        <div className="flex items-center gap-3">
          <div className="v-chip !px-2.5 !py-1 text-[11px]" role="status" aria-live="polite">
            <span className="v-chip-dot bg-[var(--color-status-pass)]" />
            <span className="text-[#FFFFFF]">OPERATIONAL</span>
          </div>
          <span className="text-[11px]">
            UPTIME: {statusData.uptime}%
          </span>
        </div>

        {/* Center: System Version & Docs */}
        <div className="flex items-center gap-4 text-[11px]">
          <Link href="/docs" className="hover:text-[#FFFFFF] transition-colors">
            DOCS
          </Link>
          <span className="text-white/20">//</span>
          <Link href="/status" className="hover:text-[#FFFFFF] transition-colors">
            TELEMETRY STATUS
          </Link>
          <span className="text-white/20">//</span>
          <span>VERSION {statusData.version}</span>
        </div>

        {/* Right: Copyright */}
        <div className="text-[11px] text-right">
          © 2026 System Manager // Dark Tech Architecture
        </div>
      </div>
    </footer>
  );
}

export default PortalFooter;
