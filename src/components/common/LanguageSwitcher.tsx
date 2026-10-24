'use client';

import React from 'react';
import { useTranslation, SUPPORTED_LOCALES, LOCALE_CONFIG, Locale } from '@/i18n';

interface LanguageSwitcherProps {
    className?: string;
    variant?: 'pill' | 'select';
}

export function LanguageSwitcher({ className = '', variant = 'pill' }: LanguageSwitcherProps) {
    const { locale, setLocale, t } = useTranslation();

    if (variant === 'select') {
        return (
            <div className={`relative inline-flex items-center ${className}`}>
                <label htmlFor="language-select" className="sr-only">
                    {t('common.language')}
                </label>
                <select
                    id="language-select"
                    value={locale}
                    onChange={(e) => setLocale(e.target.value as Locale)}
                    className="appearance-none bg-card text-foreground border border-border py-1.5 pl-3 pr-8 text-xs font-mono font-medium focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] cursor-pointer transition-colors rounded-none"
                >
                    {SUPPORTED_LOCALES.map((loc) => (
                        <option key={loc} value={loc} className="bg-card text-foreground">
                            {LOCALE_CONFIG[loc].flag} {LOCALE_CONFIG[loc].name}
                        </option>
                    ))}
                </select>
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                    ▼
                </span>
            </div>
        );
    }

    return (
        <div
            className={`inline-flex items-center p-0.5 rounded-[100px] bg-[#1f1f1f] border border-[var(--border)] ${className}`}
            role="group"
            aria-label={t('common.language')}
        >
            {SUPPORTED_LOCALES.map((loc) => {
                const isActive = locale === loc;
                const config = LOCALE_CONFIG[loc];

                return (
                    <button
                        key={loc}
                        type="button"
                        onClick={() => setLocale(loc)}
                        className={`flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-mono rounded-[100px] transition-all duration-150 ${isActive
                            ? 'bg-white text-[#121212] font-semibold'
                            : 'text-[#999999] hover:text-white hover:bg-white/5'
                            }`}
                        aria-pressed={isActive}
                        aria-label={`Switch to ${config.name}`}
                        title={config.name}
                    >
                        <span>{config.flag}</span>
                        <span>{config.code}</span>
                    </button>
                );
            })}
        </div>
    );
}

export default LanguageSwitcher;
