import React from 'react';
import Link from 'next/link';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { IconRegistry } from '@/components/common/IconRegistry';

export const metadata = {
  title: 'Authentication | System Manager',
  description: 'Sign in to access System Manager Console',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#000000] text-[#ffffff] flex flex-col relative overflow-hidden select-none">
      {/* Background radial accent glow & grid */}
      <div className="absolute inset-0 pointer-events-none radial-glow opacity-80" />
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Auth Top Header */}
      <header className="relative z-10 h-14 px-6 flex items-center justify-between border-b border-white/10 backdrop-blur-sm">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-mono text-[#999999] hover:text-[#ffffff] transition-colors"
        >
          <IconRegistry name="chevron-left" size={14} />
          <span>PORTAL // SYSTEM</span>
        </Link>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />
        </div>
      </header>

      {/* Main Center Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6 sm:p-10">
        {children}
      </main>

      {/* Bottom status line */}
      <footer className="relative z-10 h-10 px-6 flex items-center justify-center text-[10px] font-mono text-[#999999]/60 border-t border-white/5">
        SECURE GATEWAY // PROTOCOL v2.4 // DARK TECH AESTHETIC
      </footer>
    </div>
  );
}
