'use client';

import React, { useEffect } from 'react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to diagnostic stream
    console.error('[AdminError]', error);
  }, [error]);

  return (
    <div className="py-12 flex flex-col items-center justify-center text-center font-mono space-y-4">
      <div className="v-chip !px-3 !py-1 text-xs">
        <span className="v-chip-dot bg-[var(--color-status-fail)]" />
        <span className="text-[#ef4444] font-semibold">KERNEL FAULT // 0x500</span>
      </div>

      <h2 className="text-xl font-medium text-white font-sans">
        Admin Workspace Encountered an Error
      </h2>

      <p className="text-xs text-[#999999] max-w-md">
        {error.message || 'An unexpected runtime error occurred within the administrative scope.'}
      </p>

      <button
        type="button"
        onClick={() => reset()}
        className="btn-square text-xs px-4 py-2 gap-2 mt-2"
      >
        <span>RESTART CONSOLE</span>
        <span>⟳</span>
      </button>
    </div>
  );
}
