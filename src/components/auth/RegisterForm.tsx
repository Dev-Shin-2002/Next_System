'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/i18n';
import { TextField } from '@/components/common/TextField';
import { Button } from '@/components/common/Button';
import { TOKENS } from '@/theme';

export function RegisterForm() {
  const { t } = useTranslation();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
    general?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = t('auth.errors.nameRequired');
    }
    if (!email.trim()) {
      newErrors.email = t('auth.errors.emailRequired');
    }
    if (!password) {
      newErrors.password = t('auth.errors.passwordRequired');
    } else if (password.length < 8) {
      newErrors.password = t('auth.errors.passwordTooShort');
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = t('auth.errors.passwordRequired');
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t('auth.errors.passwordMismatch');
    }
    if (!agreeTerms) {
      newErrors.terms = t('auth.errors.termsRequired');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate account registration
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Set cookie for middleware guard
      document.cookie = 'sm_session=auth_token_mock_registered; path=/; max-age=86400; SameSite=Lax';

      router.push('/admin');
      router.refresh();
    } catch {
      setErrors({ general: t('errors.tryAgain') });
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 w-full" noValidate>
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
        label={t('auth.nameLabel')}
        type="text"
        placeholder={t('auth.namePlaceholder')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        required
        autoComplete="name"
        disabled={isSubmitting}
      />

      <TextField
        label={t('auth.emailLabel')}
        type="email"
        placeholder={t('auth.emailPlaceholder')}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        required
        autoComplete="email"
        disabled={isSubmitting}
      />

      <TextField
        label={t('auth.passwordLabel')}
        type="password"
        placeholder={t('auth.passwordPlaceholder')}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        required
        autoComplete="new-password"
        disabled={isSubmitting}
      />

      <TextField
        label={t('auth.confirmPasswordLabel')}
        type="password"
        placeholder={t('auth.confirmPasswordPlaceholder')}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={errors.confirmPassword}
        required
        autoComplete="new-password"
        disabled={isSubmitting}
      />

      {/* Terms and conditions checkbox */}
      <div className="flex flex-col gap-1 mt-1">
        <label className="flex items-start gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            disabled={isSubmitting}
            className="mt-0.5 accent-[#52a8ff] rounded-none cursor-pointer"
            style={{ width: 14, height: 14 }}
          />
          <span className="text-xs font-sans text-[#999999] leading-tight">
            {t('auth.termsAgree')}
          </span>
        </label>
        {errors.terms ? (
          <span className="text-xs text-[#ef4444] font-sans" role="alert">
            {errors.terms}
          </span>
        ) : null}
      </div>

      <Button
        type="submit"
        variant="primary"
        fullWidth
        isLoading={isSubmitting}
        style={{ marginTop: '0.5rem' }}
      >
        {t('auth.registerButton')}
      </Button>
    </form>
  );
}

export default RegisterForm;
