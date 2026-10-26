'use client';

import React from 'react';
import { useTranslation } from '@/i18n';
import { Button } from '@/components/common/Button';
import { IconRegistry } from '@/components/common/IconRegistry';

interface OAuthButtonsProps {
  onGithubClick?: () => void;
  onGoogleClick?: () => void;
  isLoading?: boolean;
  isGithubLoading?: boolean;
}

export function OAuthButtons({
  onGithubClick,
  onGoogleClick,
  isLoading,
  isGithubLoading,
}: OAuthButtonsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2.5 w-full">
      <Button
        variant="secondary"
        fullWidth
        onClick={onGithubClick}
        disabled={isLoading || isGithubLoading}
        isLoading={isGithubLoading}
        leftIcon={!isGithubLoading ? <IconRegistry name="github" size={16} /> : undefined}
      >
        {isGithubLoading
          ? t('auth.connectingGithub') || 'Đang kết nối GitHub...'
          : t('auth.oauthGithub')}
      </Button>

      <Button
        variant="secondary"
        fullWidth
        onClick={onGoogleClick}
        disabled={isLoading || isGithubLoading}
        leftIcon={<IconRegistry name="google" size={16} />}
      >
        {t('auth.oauthGoogle')}
      </Button>
    </div>
  );
}

export default OAuthButtons;
