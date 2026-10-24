'use client';

import React from 'react';
import { useTranslation } from '@/i18n';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { IconRegistry } from '@/components/common/IconRegistry';

export default function AdminNotFound() {
  const { t } = useTranslation();

  return (
    <div className="py-20 flex flex-col items-center justify-center text-center select-none">
      <div className="w-full max-w-lg flex flex-col items-center gap-5">
        <div className="v-chip !px-3.5 !py-1 text-xs">
          <span className="v-chip-dot bg-[var(--color-status-warn)]" />
          <span className="text-[#f59e0b] font-semibold font-mono tracking-wider">
            ADMIN SEGMENT NOT FOUND // 0x404
          </span>
        </div>

        <Typography
          variant="metric"
          style={{
            fontSize: '4.5rem',
            lineHeight: '1',
            letterSpacing: '-0.06em',
            color: '#ffffff',
          }}
        >
          404
        </Typography>

        <Typography variant="h2" align="center">
          {t('errors.notFound')}
        </Typography>

        <Typography variant="body-sm" color="muted" align="center" style={{ maxWidth: '420px' }}>
          The requested admin path was not located within the current administration routing table.
        </Typography>

        <Button
          href="/admin"
          variant="primary"
          leftIcon={<IconRegistry name="chevron-left" size={14} />}
          style={{ marginTop: '0.75rem' }}
        >
          {t('nav.dashboard')}
        </Button>
      </div>
    </div>
  );
}
