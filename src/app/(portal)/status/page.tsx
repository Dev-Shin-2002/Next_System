'use client';

import React from 'react';
import { getPublicStatus } from '@/lib/public-status';

export default function StatusPage() {
  const statusData = getPublicStatus();

  const services = [
    { name: 'Public API Gateway', status: 'PASS', latency: '12ms' },
    { name: 'Static Edge CDN', status: 'PASS', latency: '4ms' },
    { name: 'Telemetry Aggregator', status: 'PASS', latency: '24ms' },
    { name: 'Authentication Sentinel', status: 'PASS', latency: '8ms' },
  ];

  return (
    <div className="space-y-6 max-w-4xl py-6 font-sans">
      <div className="pb-4 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#52a8ff] mb-1 block">
            Public Status // System Health
          </span>
          <h1 className="text-3xl font-medium tracking-tight text-[#FFFFFF]">
            System Operational Status
          </h1>
          <p className="text-sm text-[#999999] mt-1">
            Global network telemetry and service availability.
          </p>
        </div>

        <div className="v-chip !px-3 !py-1 text-xs" role="status" aria-live="polite">
          <span className="v-chip-dot bg-[var(--color-status-pass)]" />
          <span className="text-white font-medium uppercase">{statusData.status}</span>
        </div>
      </div>

      <div className="p-6 bg-[#0a0a0a] border border-[var(--border)] flex items-center justify-between">
        <div>
          <span className="text-xs font-mono text-[#999999] uppercase">30-Day Rolling Uptime</span>
          <div className="text-3xl font-mono text-white mt-1">{statusData.uptime}%</div>
        </div>
        <div className="text-right text-xs font-mono text-[#999999]">
          <div>VERSION: {statusData.version}</div>
          <div className="text-[11px] text-white/40 mt-1">Updated at {new Date(statusData.updatedAt).toLocaleTimeString()}</div>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xs font-mono text-[#999999] uppercase tracking-wider">Services Breakdown</h2>
        <div className="divide-y divide-white/[0.08] bg-[#0a0a0a] border border-[var(--border)]">
          {services.map((svc, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between font-mono text-xs">
              <span className="text-white">{svc.name}</span>
              <div className="flex items-center gap-4">
                <span className="text-[#999999]">{svc.latency}</span>
                <span className="v-chip !py-0.5 !px-2 text-[10px]">
                  <span className="v-chip-dot bg-[var(--color-status-pass)]" />
                  {svc.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
