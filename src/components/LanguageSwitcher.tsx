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
                    className="appearance-none bg-card text-foreground border border-border rounded-lg py-1.5 pl-3 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer transition-colors"
                >
                    {SUPPORTED_LOCALES.map((loc) => (
                        <option key={loc} value={loc} className="bg-card text-foreground">
                            {LOCALE_CONFIG[loc].flag} {LOCALE_CONFIG[loc].name}
                        </option>
                    ))}
                </select>
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    ▼
                </span>
            </div>
        );
    }

    return (
        <div
            className={`inline-flex items-center p-1 rounded-lg bg-muted border border-border ${className}`}
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
                        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-200 ${isActive
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                            }`}
                        aria-pressed={isActive}
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
