'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/i18n';
import { TextField } from '@/components/common/TextField';
import { Button } from '@/components/common/Button';
import { TOKENS } from '@/theme';

export function EmailForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      newErrors.email = t('auth.errors.emailRequired');
    }
    if (!password) {
      newErrors.password = t('auth.errors.passwordRequired');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate authentication / setting session cookie
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Set cookie for middleware guard
      document.cookie = 'sm_session=auth_token_mock; path=/; max-age=86400; SameSite=Lax';

      router.push(from);
      router.refresh();
    } catch {
      setErrors({ general: t('auth.errors.invalidCredentials') });
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full" noValidate>
      {errors.general ? (
        <div
          role="alert"
          className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 text-xs font-sans"
          style={{ borderRadius: TOKENS.radius.button }}
        >
          {errors.general}
        </div>
      ) : null}

      <TextField
        label={t('auth.emailLabel')}
        type="email"
        placeholder={t('auth.emailPlaceholder')}
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
        }}
        error={errors.email}
        required
        autoComplete="email"
        disabled={isSubmitting}
      />

      <div className="flex flex-col gap-1.5">
        <TextField
          label={t('auth.passwordLabel')}
          type="password"
          placeholder={t('auth.passwordPlaceholder')}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
          }}
          error={errors.password}
          required
          autoComplete="current-password"
          disabled={isSubmitting}
        />
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-xs font-sans text-[#999999] hover:text-[#52a8ff] transition-colors"
          >
            {t('auth.forgotPassword')}
          </Link>
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        fullWidth
        isLoading={isSubmitting}
        style={{ marginTop: '0.25rem' }}
      >
        {t('auth.signInButton')}
      </Button>
    </form>
  );
}

export default EmailForm;
