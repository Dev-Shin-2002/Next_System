'use client';

import React from 'react';
import { useTranslation } from '@/i18n';
import { IconRegistry } from '@/components/common/IconRegistry';
import { TOKENS } from '@/theme';

interface OAuthButtonsProps {
  onGithubClick?: () => void;
  onGoogleClick?: () => void;
  isLoading?: boolean;
}

export function OAuthButtons({ onGithubClick, onGoogleClick, isLoading }: OAuthButtonsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2.5 w-full">
      <button
        type="button"
        onClick={onGithubClick}
        disabled={isLoading}
        className="w-full h-10 px-4 flex items-center justify-center gap-3 bg-[#0a0a0a] hover:bg-[#151515] text-[#ffffff] border border-white/15 hover:border-white/30 font-mono text-xs transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none"
        style={{ borderRadius: TOKENS.radius.button }}
      >
        <IconRegistry name="github" size={16} className="text-[#ffffff]" />
        <span>{t('auth.oauthGithub')}</span>
      </button>

      <button
        type="button"
        onClick={onGoogleClick}
        disabled={isLoading}
        className="w-full h-10 px-4 flex items-center justify-center gap-3 bg-[#0a0a0a] hover:bg-[#151515] text-[#ffffff] border border-white/15 hover:border-white/30 font-mono text-xs transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none"
        style={{ borderRadius: TOKENS.radius.button }}
      >
        <IconRegistry name="google" size={16} className="text-[#ffffff]" />
        <span>{t('auth.oauthGoogle')}</span>
      </button>
    </div>
  );
}

export default OAuthButtons;
