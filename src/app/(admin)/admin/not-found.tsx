import React from 'react';
import Link from 'next/link';

export default function AdminNotFound() {
  return (
    <div className="py-16 flex flex-col items-center justify-center text-center font-mono space-y-4">
      <div className="v-chip !px-3 !py-1 text-xs">
        <span className="v-chip-dot bg-[var(--color-status-warn)]" />
        <span className="text-[#f59e0b] font-semibold">SEGMENT NOT FOUND // 0x404</span>
      </div>

      <h2 className="text-xl font-medium text-white font-sans">
        Requested Administrative Route Does Not Exist
      </h2>

      <p className="text-xs text-[#999999] max-w-md">
        The requested admin path was not located within the current routing table.
      </p>

      <Link
        href="/admin"
        className="btn-square text-xs px-4 py-2 gap-2 mt-2"
      >
        <span>RETURN TO OVERVIEW</span>
        <span>←</span>
      </Link>
    </div>
  );
}
