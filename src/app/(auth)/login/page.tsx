import React, { Suspense } from 'react';
import { LoginCard } from '@/components/auth/LoginCard';

export const metadata = {
  title: 'Sign In | System Manager',
  description: 'Authenticate to access System Manager Console',
};

function LoginLoading() {
  return (
    <div className="w-full max-w-[440px] h-[520px] bg-[#0a0a0a] border border-white/10 animate-pulse flex items-center justify-center font-mono text-xs text-[#999999]">
      INITIALIZING AUTHENTICATION...
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginCard />
    </Suspense>
  );
}
