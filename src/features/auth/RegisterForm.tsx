'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/i18n';
import { TextField } from '@/components/common/TextField';
import { Button } from '@/components/common/Button';
import { Checkbox } from '@/components/common/Checkbox';
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
        onChange={(e) => {
          setName(e.target.value);
          if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
        }}
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
        onChange={(e) => {
          setEmail(e.target.value);
          if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
        }}
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
        onChange={(e) => {
          setPassword(e.target.value);
          if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
        }}
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
        onChange={(e) => {
          setConfirmPassword(e.target.value);
          if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
        }}
        error={errors.confirmPassword}
        required
        autoComplete="new-password"
        disabled={isSubmitting}
      />

      <Checkbox
        checked={agreeTerms}
        onChange={(e) => {
          setAgreeTerms(e.target.checked);
          if (errors.terms) setErrors((prev) => ({ ...prev, terms: undefined }));
        }}
        error={errors.terms}
        disabled={isSubmitting}
        required
        label={t('auth.termsAgree')}
        style={{ marginTop: '0.25rem' }}
      />

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
