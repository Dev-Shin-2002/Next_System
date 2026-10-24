import React from 'react';

export default function DocsPage() {
  return (
    <div className="space-y-6 max-w-4xl py-6 font-sans">
      <div className="pb-4 border-b border-[var(--border)]">
        <span className="text-xs font-mono uppercase tracking-widest text-[#52a8ff] mb-1 block">
          Knowledge Base // API & Guides
        </span>
        <h1 className="text-3xl font-medium tracking-tight text-[#FFFFFF]">
          System Manager Documentation
        </h1>
        <p className="text-sm text-[#999999] mt-1">
          Technical specifications, layout tokens, and telemetry architecture overview.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-[#0a0a0a] border border-[var(--border)] space-y-2">
          <span className="text-xs font-mono text-[#52a8ff]">SPEC // 01</span>
          <h2 className="text-base font-semibold text-white">Dark Tech Aesthetic (/style-md)</h2>
          <p className="text-xs text-[#999999]">
            Learn about brutalist 0px buttons, 100px status chips, and strict monochromatic surface tokens.
          </p>
        </div>

        <div className="p-6 bg-[#0a0a0a] border border-[var(--border)] space-y-2">
          <span className="text-xs font-mono text-[#52a8ff]">SPEC // 02</span>
          <h2 className="text-base font-semibold text-white">Telemetry & Event Stream</h2>
          <p className="text-xs text-[#999999]">
            Architecture for polling resilient system status, timeline progress bars, and localized logs.
          </p>
        </div>
      </div>
    </div>
  );
}
