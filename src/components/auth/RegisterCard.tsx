'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/i18n';
import { Logo } from '@/components/common/Logo';
import { Typography } from '@/components/common/Typography';
import { RegisterForm } from './RegisterForm';
import { OAuthButtons } from './OAuthButtons';

export function RegisterCard() {
  const { t } = useTranslation();
  const router = useRouter();

  const handleOAuth = (provider: string) => {
    document.cookie = `sm_session=auth_token_${provider}_registered; path=/; max-age=86400; SameSite=Lax`;
    router.push('/admin');
    router.refresh();
  };

  return (
    <div className="dt-auth-card">
      {/* Top subtle blue laser accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#52a8ff] to-transparent opacity-80" />

      {/* Header: Logo + Title */}
      <div className="flex flex-col items-center text-center">
        <Logo layout="vertical" size="xl" href="/" hideSubtitle />

        <div className="mt-4">
          <Typography variant="h2" align="center">
            {t('auth.registerTitle')}
          </Typography>
          <Typography variant="body-sm" color="muted" align="center" style={{ marginTop: '0.35rem' }}>
            {t('auth.registerSubtitle')}
          </Typography>
        </div>
      </div>

      {/* Main Register Form */}
      <RegisterForm />

      {/* Divider "hoặc" */}
      <div className="relative flex items-center justify-center my-1">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <span className="relative px-3 bg-[#0a0a0a] font-sans text-[11px] font-medium uppercase tracking-wider text-[#999999]">
          {t('auth.orDivider')}
        </span>
      </div>

      {/* OAuth Buttons (GitHub & Google) */}
      <OAuthButtons
        onGithubClick={() => handleOAuth('github')}
        onGoogleClick={() => handleOAuth('google')}
      />

      {/* Footer: Sign in prompt */}
      <div className="pt-2 text-center border-t border-white/5">
        <Typography variant="body-sm" color="muted" align="center">
          {t('auth.alreadyHaveAccount')}{' '}
          <Link
            href="/login"
            className="text-[#52a8ff] hover:text-[#52a8ff]/80 transition-colors font-medium ml-1"
          >
            {t('auth.signInLink')}
          </Link>
        </Typography>
      </div>
    </div>
  );
}

export default RegisterCard;
