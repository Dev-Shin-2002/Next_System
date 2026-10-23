import { Inter, JetBrains_Mono } from 'next/font/google';

// Font chính cho giao diện: rõ nét, chuẩn dashboard hiện đại
export const fontSans = Inter({
    subsets: ['latin', 'vietnamese'],
    variable: '--font-sans',
    display: 'swap',
});

// Font Monospace chuẩn cho Terminal, Logs, Config, Port, IP Address
export const fontMono = JetBrains_Mono({
    subsets: ['latin', 'vietnamese'],
    variable: '--font-mono',
    display: 'swap',
});

export const FONTS = {
    sans: 'var(--font-sans)',
    mono: 'var(--font-mono)',
} as const;

export type FontType = typeof FONTS;
