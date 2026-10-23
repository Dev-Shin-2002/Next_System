'use client';

import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useCallback,
    useSyncExternalStore,
} from 'react';
import {
    Locale,
    DEFAULT_LOCALE,
    SUPPORTED_LOCALES,
    LOCALE_STORAGE_KEY,
    LOCALE_COOKIE_NAME,
} from './config';
import vi from './locales/vi.json';
import en from './locales/en.json';

type TranslationValue = string | { [key: string]: TranslationValue };
type TranslationDictionary = Record<string, TranslationValue>;

const DICTIONARIES: Record<Locale, TranslationDictionary> = {
    vi: vi as unknown as TranslationDictionary,
    en: en as unknown as TranslationDictionary,
};

interface I18nContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

function resolveKey(dict: TranslationDictionary, key: string): string | undefined {
    const segments = key.split('.');
    let current: unknown = dict;

    for (const segment of segments) {
        if (current && typeof current === 'object' && segment in current) {
            current = (current as Record<string, unknown>)[segment];
        } else {
            return undefined;
        }
    }

    return typeof current === 'string' ? current : undefined;
}

function interpolate(text: string, params?: Record<string, string | number>): string {
    if (!params) return text;
    return text.replace(/\{(\w+)\}/g, (_, match) => {
        return params[match] !== undefined ? String(params[match]) : `{${match}}`;
    });
}

function getStoredLocale(): Locale {
    if (typeof window === 'undefined') return DEFAULT_LOCALE;

    try {
        const fromStorage = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
        if (fromStorage && SUPPORTED_LOCALES.includes(fromStorage)) {
            return fromStorage;
        }

        const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE_NAME}=([^;]*)`));
        if (match) {
            const fromCookie = decodeURIComponent(match[1]) as Locale;
            if (SUPPORTED_LOCALES.includes(fromCookie)) {
                return fromCookie;
            }
        }
    } catch {
        // Fallback silently if storage/cookie blocked
    }

    return DEFAULT_LOCALE;
}

const listeners = new Set<() => void>();

function subscribeLocale(callback: () => void) {
    listeners.add(callback);
    const onStorage = (e: StorageEvent) => {
        if (e.key === LOCALE_STORAGE_KEY) {
            callback();
        }
    };
    window.addEventListener('storage', onStorage);
    return () => {
        listeners.delete(callback);
        window.removeEventListener('storage', onStorage);
    };
}

function emitLocaleChange() {
    for (const listener of listeners) {
        listener();
    }
}

export function I18nProvider({
    children,
    initialLocale = DEFAULT_LOCALE,
}: {
    children: React.ReactNode;
    initialLocale?: Locale;
}) {
    const locale = useSyncExternalStore<Locale>(
        subscribeLocale,
        getStoredLocale,
        () => initialLocale
    );

    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.documentElement.lang = locale;
        }
    }, [locale]);

    const setLocale = useCallback((newLocale: Locale) => {
        if (!SUPPORTED_LOCALES.includes(newLocale)) return;

        try {
            localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
            document.cookie = `${LOCALE_COOKIE_NAME}=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
        } catch {
            // Ignore storage errors in restricted contexts
        }

        emitLocaleChange();
    }, []);

    const t = useCallback(
        (key: string, params?: Record<string, string | number>): string => {
            const currentDict = DICTIONARIES[locale] || DICTIONARIES[DEFAULT_LOCALE];
            let raw = resolveKey(currentDict, key);

            // Fallback to default dictionary if missing in current locale
            if (!raw && locale !== DEFAULT_LOCALE) {
                raw = resolveKey(DICTIONARIES[DEFAULT_LOCALE], key);
            }

            if (!raw) {
                return key;
            }

            return interpolate(raw, params);
        },
        [locale]
    );

    const value = useMemo(
        () => ({
            locale,
            setLocale,
            t,
        }),
        [locale, setLocale, t]
    );

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useTranslation must be used within an I18nProvider');
    }
    return context;
}
