'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/i18n';
import { Logo } from '@/components/common/Logo';
import { Typography } from '@/components/common/Typography';
import { EmailForm } from './EmailForm';
import { OAuthButtons } from './OAuthButtons';
import { TOKENS } from '@/theme';

export function LoginCard() {
  const { t } = useTranslation();
  const router = useRouter();

  const handleOAuth = (provider: string) => {
    document.cookie = `sm_session=auth_token_${provider}; path=/; max-age=86400; SameSite=Lax`;
    router.push('/admin');
    router.refresh();
  };

  return (
    <div
      className="w-full max-w-[420px] bg-[#0a0a0a] border border-white/15 p-8 flex flex-col gap-6 shadow-2xl relative"
      style={{
        borderRadius: TOKENS.radius.card, // 0px brutalist
      }}
    >
      {/* Top subtle blue laser accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#52a8ff] to-transparent opacity-80" />

      {/* Header: Logo + Title */}
      <div className="flex flex-col items-center text-center">
        <Logo layout="vertical" size="xl" href="/" hideSubtitle />

        <div className="mt-4">
          <Typography variant="h2" align="center">
            {t('auth.loginTitle')}
          </Typography>
          <Typography variant="body-sm" color="muted" align="center" style={{ marginTop: '0.35rem' }}>
            {t('auth.loginSubtitle')}
          </Typography>
        </div>
      </div>

      {/* Main Email Form */}
      <EmailForm />

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

      {/* Footer: Register prompt */}
      <div className="pt-2 text-center border-t border-white/5">
        <Typography variant="body-sm" color="muted" align="center">
          {t('auth.noAccount')}{' '}
          <Link
            href="/register"
            className="text-[#52a8ff] hover:text-[#52a8ff]/80 transition-colors font-medium ml-1"
          >
            {t('auth.signUpLink')}
          </Link>
        </Typography>
      </div>
    </div>
  );
}

export default LoginCard;
