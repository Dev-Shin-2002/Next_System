'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

export interface AdminLayoutProps {
  initialCollapsed?: boolean;
  children: React.ReactNode;
}

export function AdminLayout({ initialCollapsed = false, children }: AdminLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Toggle collapse and persist to cookie with SameSite=Lax
  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      const val = next ? 'collapsed' : 'expanded';
      document.cookie = `sm_sidebar_state=${val}; path=/; max-age=31536000; SameSite=Lax`;
      return next;
    });
  }, []);

  const handleToggleMobile = useCallback(() => {
    setIsMobileOpen((prev) => !prev);
  }, []);

  const handleCloseMobile = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  // Keyboard navigation: Escape key closes mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen]);

  // Body scroll lock on mobile drawer open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  const currentSidebarWidth = isCollapsed
    ? 'var(--sidebar-width-collapsed)'
    : 'var(--sidebar-width)';

  return (
    <div
      data-collapsed={isCollapsed}
      style={{ '--sidebar-current-width': currentSidebarWidth } as React.CSSProperties}
      className="min-h-screen flex flex-col bg-[#000000] text-[#FFFFFF] font-sans selection:bg-[#52a8ff] selection:text-[#000000] relative"
    >
      {/* Background Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-[radial-gradient(ellipse_at_top,rgba(82,168,255,0.08)_0%,transparent_70%)] pointer-events-none" />

      {/* Admin Sidebar (Desktop fixed + Mobile drawer) */}
      <AdminSidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        isMobileOpen={isMobileOpen}
        onCloseMobile={handleCloseMobile}
      />

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col ml-0 md:ml-[var(--sidebar-current-width)] transition-[margin] duration-200 ease-in-out min-w-0">
        {/* Sticky Header with React 19 inert support when mobile drawer is open */}
        <div className="relative z-30" inert={isMobileOpen}>
          <AdminHeader
            onToggleMobile={handleToggleMobile}
            isMobileOpen={isMobileOpen}
          />
        </div>

        {/* Content Viewport with React 19 inert support */}
        <main
          id="main-content"
          inert={isMobileOpen}
          className="flex-1 p-6 md:p-8 relative z-10 max-w-7xl w-full"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
