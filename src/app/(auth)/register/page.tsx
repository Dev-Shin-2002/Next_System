import React, { Suspense } from 'react';
import { RegisterCard } from '@/features/auth';

export const metadata = {
  title: 'Create Account | System Manager',
  description: 'Initialize a new system administrator account',
};

function RegisterLoading() {
  return (
    <div className="w-full max-w-[440px] h-[640px] bg-[#0a0a0a] border border-white/10 animate-pulse flex items-center justify-center font-mono text-xs text-[#999999]">
      INITIALIZING ACCOUNT PROVISIONING...
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterLoading />}>
      <RegisterCard />
    </Suspense>
  );
} 