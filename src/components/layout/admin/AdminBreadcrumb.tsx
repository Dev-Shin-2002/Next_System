'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/i18n';
import { ADMIN_NAV_ITEMS } from '@/config/admin-nav';

export function AdminBreadcrumb() {
  const { t } = useTranslation();
  const pathname = usePathname();

  // Find exact matching nav item
  const matchedItem = ADMIN_NAV_ITEMS.find((item) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + '/')
  );

  let currentTitle = '';
  if (matchedItem) {
    currentTitle = t(matchedItem.labelKey);
  } else {
    // Dynamic segment fallback
    const segments = pathname.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1] || 'ADMIN';
    currentTitle = lastSegment.replace(/-/g, ' ').toUpperCase();
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono">
      <Link href="/admin" className="text-[#999999] hover:text-white transition-colors">
        SYSTEM
      </Link>
      <span className="text-white/20 select-none">//</span>
      <span className="text-white font-medium uppercase truncate max-w-[200px] sm:max-w-none">
        {currentTitle}
      </span>
    </nav>
  );
}

export default AdminBreadcrumb;
