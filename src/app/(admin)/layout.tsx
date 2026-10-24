import React, { Suspense } from 'react';
import { cookies } from 'next/headers';
import { AdminTelemetryProvider } from '@/providers/AdminTelemetryProvider';
import { AdminLayout } from '@/components/layout/admin/AdminLayout';
import AdminLoading from './admin/loading';

async function AdminShell({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const initialCollapsed = cookieStore.get('sm_sidebar_state')?.value === 'collapsed';

  return (
    <AdminLayout initialCollapsed={initialCollapsed}>
      {children}
    </AdminLayout>
  );
}

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminTelemetryProvider>
      <Suspense fallback={<AdminLoading />}>
        <AdminShell>{children}</AdminShell>
      </Suspense>
    </AdminTelemetryProvider>
  );
}
