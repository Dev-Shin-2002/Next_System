import { Inter, Geist_Mono } from 'next/font/google';

/**
 * Dark Tech Aesthetic Typography System (/style-md)
 * 
 * Strict specifications:
 * - Headlines: 'Inter Display' (font-weight: 500, letter-spacing: -1px to -3.36px)
 * - Data, metrics, IDs, logs: 'Geist Mono' (#999999)
 * - Body: 'Inter'
 */

// Body / Sans font (Inter)
export const fontSans = Inter({
    subsets: ['latin', 'vietnamese'],
    variable: '--font-sans',
    display: 'swap',
});

// Editorial Headlines ('Inter Display' with optical sizing)
export const fontDisplay = Inter({
    subsets: ['latin', 'vietnamese'],
    variable: '--font-display',
    display: 'swap',
    axes: ['opsz'],
});

// Rigorous Monospace for data integrity, metrics, and IDs ('Geist Mono')
export const fontMono = Geist_Mono({
    subsets: ['latin', 'vietnamese'],
    variable: '--font-mono',
    display: 'swap',
});

export const FONTS = {
    sans: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    display: 'var(--font-display), "Inter Display", var(--font-sans), sans-serif',
    mono: 'var(--font-mono), "Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
} as const;

export const TYPOGRAPHY_SPECS = {
    // Editorial headlines
    headline: {
        fontFamily: FONTS.display,
        fontWeight: '500',
        letterSpacing: '-1px',
    },
    // Fluid hero headline (32px to 60px, max-width 752px)
    headlineFluid: {
        fontFamily: FONTS.display,
        fontWeight: '500',
        fontSize: 'clamp(2rem, 5vw, 3.75rem)',
        letterSpacing: '-3.36px',
        lineHeight: '1.1',
        maxWidth: '752px',
    },
    // Data & KPI Metric values (56px, tracking -3.36px)
    metric: {
        fontFamily: FONTS.mono,
        fontSize: '3.5rem', // 56px
        letterSpacing: '-3.36px',
        lineHeight: '1',
        color: '#999999',
    },
    // Monospace status chip label
    statusChip: {
        fontFamily: FONTS.mono,
        fontSize: '0.75rem', // 12px
        lineHeight: '1rem',
        textTransform: 'uppercase' as const,
        color: '#999999',
    },
    // Subtext / descriptive copy
    subtext: {
        fontFamily: FONTS.sans,
        fontSize: '1rem', // 16px
        lineHeight: '1.5rem',
        color: '#e7e7e7',
    },
} as const;

export type FontType = typeof FONTS;
