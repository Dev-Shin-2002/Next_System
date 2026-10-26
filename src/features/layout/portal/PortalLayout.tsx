import React from 'react';
import { PortalNavbar } from './PortalNavbar';
import { PortalFooter } from './PortalFooter';

interface PortalLayoutProps {
  children: React.ReactNode;
}

export function PortalLayout({ children }: PortalLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#000000] text-[#FFFFFF] font-sans selection:bg-[#52a8ff] selection:text-[#000000] relative">
      {/* Background Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-[radial-gradient(ellipse_at_top,rgba(82,168,255,0.1)_0%,transparent_70%)] pointer-events-none" />

      {/* Top Navbar */}
      <PortalNavbar />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 relative z-10">
        {children}
      </main>

      {/* Sticky Bottom Footer */}
      <PortalFooter />
    </div>
  );
}

export default PortalLayout;
