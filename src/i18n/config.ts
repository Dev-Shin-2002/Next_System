export const SUPPORTED_LOCALES = ['vi', 'en'] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'vi';

export const LOCALE_CONFIG: Record<
    Locale,
    {
        name: string;
        label: string;
        code: string;
        flag: string;
    }
> = {
    vi: {
        name: 'Tiếng Việt',
        label: 'Tiếng Việt (VI)',
        code: 'VI',
        flag: '🇻🇳',
    },
    en: {
        name: 'English',
        label: 'English (EN)',
        code: 'EN',
        flag: '🇬🇧',
    },
};

export const LOCALE_STORAGE_KEY = 'system_manager_locale';
export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';
