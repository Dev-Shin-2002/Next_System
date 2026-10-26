import React from 'react';
import { PortalLayout } from '@/features/layout';

export default function PortalRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalLayout>{children}</PortalLayout>;
}
