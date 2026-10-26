'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/i18n';
import { Logo } from '@/components/common/Logo';
import { IconRegistry } from '@/components/common/IconRegistry';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { githubCallback, getGithubMe, type UserProfile } from '@/app/api/github';

function CallbackHandler() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get('token');
  const code = searchParams.get('code');
  const stateParam = searchParams.get('state');
  const error = searchParams.get('error');

  const [state, setState] = useState<'processing' | 'success' | 'error'>(() => {
    if (error || (!token && !code)) return 'error';
    return 'processing';
  });
  const [errorMessage, setErrorMessage] = useState<string>(() => {
    if (error) return error;
    if (!token && !code) {
      return (
        t('auth.errors.invalidCredentials') || 'Mã xác thực không hợp lệ hoặc đã hết hạn.'
      );
    }
    return '';
  });
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (error || (!token && !code)) return;

    let isCancelled = false;

    const completeAuth = async () => {
      try {
        // 1. Xử lý token hoặc trao đổi code + state
        const result = await githubCallback({ token, code, state: stateParam });

        // 2. Lấy thông tin User profile
        if (result.user) {
          if (!isCancelled) setProfile(result.user as UserProfile);
        } else {
          const fetchedProfile = await getGithubMe(result.token);
          if (!isCancelled && fetchedProfile) {
            setProfile(fetchedProfile);
          }
        }

        if (!isCancelled) {
          setState('success');
        }

        // Chuyển hướng sau 700ms để hiệu ứng mượt mà
        setTimeout(() => {
          router.replace('/admin');
          router.refresh();
        }, 700);
      } catch (err: unknown) {
        if (!isCancelled) {
          setState('error');
          setErrorMessage(
            err instanceof Error ? err.message : 'Đã có lỗi xảy ra trong quá trình xác thực.'
          );
        }
      }
    };

    completeAuth();

    return () => {
      isCancelled = true;
    };
  }, [token, code, stateParam, error, router, t]);

  return (
    <div className="dt-auth-card w-full max-w-[460px] p-6 sm:p-8 relative">
      {/* Laser line gradient */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#52a8ff] to-transparent opacity-80" />

      {/* Header */}
      <div className="flex flex-col items-center text-center mb-6">
        <Logo layout="vertical" size="lg" href="/" hideSubtitle />
      </div>

      {/* State 1: Processing */}
      {state === 'processing' && (
        <div className="flex flex-col items-center text-center space-y-5 py-4">
          <div className="relative flex items-center justify-center">
            {/* Pulsing ring */}
            <div className="w-16 h-16 rounded-full border border-[#52a8ff]/30 animate-ping absolute" />
            <div className="w-16 h-16 rounded-full bg-[#52a8ff]/10 border border-[#52a8ff]/40 flex items-center justify-center text-[#52a8ff]">
              <IconRegistry name="github" size={28} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Typography variant="h3" align="center" className="text-white">
              {t('auth.authenticating')}
            </Typography>
            <p className="font-mono text-xs text-[#999999] uppercase tracking-wider">
              PROTOCOL // GITHUB_OAUTH2_HANDSHAKE
            </p>
          </div>

          {/* Scanning Progress bar */}
          <div className="w-full bg-white/5 h-1.5 overflow-hidden border border-white/10 mt-2">
            <div className="h-full bg-gradient-to-r from-transparent via-[#52a8ff] to-transparent animate-[shimmer_1.5s_infinite] w-full" />
          </div>
        </div>
      )}

      {/* State 2: Success */}
      {state === 'success' && (
        <div className="flex flex-col items-center text-center space-y-5 py-4">
          <div className="relative flex items-center justify-center">
            {profile?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt={profile.displayName || 'GitHub User'}
                className="w-16 h-16 rounded-full border-2 border-[#52a8ff] shadow-[0_0_15px_rgba(82,168,255,0.4)] object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-emerald-950/40 border border-emerald-500/60 flex items-center justify-center text-emerald-400">
                <IconRegistry name="check-circle" size={28} />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <Typography variant="h3" align="center" className="text-white">
              {profile?.displayName
                ? t('common.welcome', { name: profile.displayName })
                : t('auth.authSuccess')}
            </Typography>
            <p className="text-xs text-emerald-400 font-mono tracking-wide">
              IDENTITY VERIFIED // SESSION ACTIVE
            </p>
            {profile?.primaryEmail && (
              <p className="text-xs text-[#999999]">{profile.primaryEmail}</p>
            )}
          </div>

          <div className="pt-2 text-xs text-[#999999] font-mono flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{t('auth.authRedirecting')}</span>
          </div>
        </div>
      )}

      {/* State 3: Error */}
      {state === 'error' && (
        <div className="flex flex-col items-center text-center space-y-5 py-4">
          <div className="w-16 h-16 rounded-full bg-red-950/40 border border-red-500/60 flex items-center justify-center text-red-400">
            <IconRegistry name="alert-triangle" size={28} />
          </div>

          <div className="space-y-2">
            <Typography variant="h3" align="center" className="text-red-400">
              {t('auth.authFailed')}
            </Typography>
            <div className="p-3 bg-red-950/30 border border-red-500/30 text-red-300 text-xs font-mono text-left max-w-sm break-words">
              {errorMessage}
            </div>
          </div>

          <div className="w-full pt-2 flex flex-col gap-2">
            <Link href="/login" className="w-full">
              <Button variant="primary" fullWidth>
                {t('auth.backToLogin')}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function CallbackLoading() {
  return (
    <div className="w-full max-w-[460px] h-[340px] bg-[#0a0a0a] border border-white/10 animate-pulse flex items-center justify-center font-mono text-xs text-[#999999]">
      PROCESSING GITHUB CREDENTIALS...
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<CallbackLoading />}>
      <CallbackHandler />
    </Suspense>
  );
}
