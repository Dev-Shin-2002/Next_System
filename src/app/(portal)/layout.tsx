import React from 'react';
import { PortalLayout } from '@/components/layout/portal/PortalLayout';

export default function PortalRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalLayout>{children}</PortalLayout>;
}
