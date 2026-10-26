'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Button,
  Typography,
  IconRegistry,
  LanguageSwitcher,
} from '@/components/common';
import { AdminBreadcrumb } from './AdminBreadcrumb';
import { useGithubAuth } from '@/app/api/github';

export interface AdminHeaderProps {
  onToggleMobile: () => void;
  isMobileOpen: boolean;
}

export function AdminHeader({ onToggleMobile, isMobileOpen }: AdminHeaderProps) {
  const { user, logout } = useGithubAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Đóng menu khi nhấp chuột ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const avatar = user?.avatarUrl || user?.identities?.[0]?.avatarUrl;
  const displayName = user?.displayName || user?.identities?.[0]?.loginName || 'GitHub User';
  const email = user?.primaryEmail || user?.identities?.[0]?.email;
  const role = user?.role || 'MEMBER';

  return (
    <header
      id="admin-header"
      className="sticky top-0 z-30 h-14 border-b border-[var(--border)] bg-[#000000]/90 backdrop-blur-md px-6 flex items-center justify-between"
    >
      {/* Left: Mobile hamburger & Dynamic Breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button using Common Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleMobile}
          className="md:hidden !p-1.5 !h-8 text-[#999999] hover:text-white"
          aria-label="Toggle Navigation"
          aria-expanded={isMobileOpen}
        >
          <IconRegistry name={isMobileOpen ? 'close' : 'menu'} size={18} />
        </Button>

        {/* Dynamic Breadcrumbs */}
        <AdminBreadcrumb />
      </div>

      {/* Right: LanguageSwitcher & Round User Avatar */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Language Switcher from Common */}
        <LanguageSwitcher />

        {/* Round Avatar Icon with User Profile Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="flex items-center justify-center rounded-full p-0.5 border border-white/20 hover:border-[#52a8ff] transition-all focus:outline-none focus:ring-2 focus:ring-[#52a8ff]/40"
            title={displayName}
            aria-expanded={isMenuOpen}
            aria-haspopup="true"
          >
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatar}
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#111111] border border-white/10 flex items-center justify-center text-xs font-mono text-[#52a8ff]">
                {user?.displayName ? (
                  displayName.slice(0, 2).toUpperCase()
                ) : (
                  <IconRegistry name="github" size={16} />
                )}
              </div>
            )}
          </button>

          {/* User Profile & Logout Dropdown */}
          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-[#0a0a0a] border border-white/20 shadow-[0_16px_40px_rgba(0,0,0,0.95)] z-50 p-2.5 space-y-2.5 font-sans text-xs backdrop-blur-xl">
              <div className="px-2.5 py-2 border-b border-white/10 flex items-center gap-2.5">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatar}
                    alt={displayName}
                    className="w-9 h-9 rounded-full object-cover border border-white/20 shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#111111] border border-white/10 flex items-center justify-center text-xs font-mono text-[#52a8ff] shrink-0">
                    {displayName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <Typography variant="body-sm" color="primary" weight={600} className="truncate block">
                    {displayName}
                  </Typography>
                  {email && (
                    <Typography variant="caption" color="muted" className="truncate block text-[11px]">
                      {email}
                    </Typography>
                  )}
                  <span className="mt-1 inline-block text-[10px] font-mono px-1.5 py-0.5 bg-[#52a8ff]/10 text-[#52a8ff] border border-[#52a8ff]/20">
                    {role}
                  </span>
                </div>
              </div>

              {/* Logout Button using Common Button */}
              <Button
                variant="danger"
                size="sm"
                fullWidth
                onClick={() => logout()}
              >
                Đăng xuất
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
