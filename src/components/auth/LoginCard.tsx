'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/i18n';
import { Logo } from '@/components/common/Logo';
import { Typography } from '@/components/common/Typography';
import { EmailForm } from './EmailForm';
import { OAuthButtons } from './OAuthButtons';
import { githubLogin } from '@/app/api/github';

export function LoginCard() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');

  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);

  const handleGithubLogin = async () => {
    setIsGithubLoading(true);
    setOauthError(null);
    try {
      await githubLogin();
    } catch (err: unknown) {
      console.error('GitHub login error:', err);
      setIsGithubLoading(false);
      setOauthError(
        err instanceof Error
          ? err.message
          : 'Không thể kết nối đến máy chủ xác thực. Vui lòng thử lại.'
      );
    }
  };

  const handleOAuth = (provider: string) => {
    if (provider === 'github') {
      handleGithubLogin();
      return;
    }
    document.cookie = `sm_session=auth_token_${provider}; path=/; max-age=86400; SameSite=Lax`;
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
            {t('auth.loginTitle')}
          </Typography>
          <Typography variant="body-sm" color="muted" align="center" style={{ marginTop: '0.35rem' }}>
            {t('auth.loginSubtitle')}
          </Typography>
        </div>
      </div>

      {/* OAuth Error Alert Banner */}
      {(oauthError || errorParam) && (
        <div
          role="alert"
          className="p-3 bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-sans flex items-start gap-2.5"
        >
          <span className="text-red-400 font-bold">⚠</span>
          <div className="flex-1">
            <span className="font-semibold block">{t('auth.authFailed')}</span>
            <span className="text-red-400/80 text-[11px] break-words">
              {oauthError || errorParam}
            </span>
          </div>
        </div>
      )}

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
        isGithubLoading={isGithubLoading}
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
