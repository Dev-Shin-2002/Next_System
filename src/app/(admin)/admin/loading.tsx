import React from 'react';

export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse py-6 font-mono">
      <div className="h-8 bg-[#1f1f1f] w-1/3 rounded-none" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-[#0a0a0a] border border-[var(--border)] p-4" />
        ))}
      </div>
      <div className="h-64 bg-[#0a0a0a] border border-[var(--border)] p-6" />
    </div>
  );
}
