/**
 * Dark Tech Aesthetic Color System (/style-md)
 * 
 * Strict specifications:
 * - Deep #000000 background
 * - Cards: #0a0a0a with 1px border / ring of rgba(255, 255, 255, 0.145)
 * - Brand accents: ONLY #52a8ff (Active/Focus), #62c073 (PASS/Positive), #ededed (FAIL/Error), #999999 (WARN/Metrics/Data)
 * - Primary CTAs (btn-square): #FFFFFF (bg), #121212 (text), 0px radius
 * - Status Chip (v-chip): #1f1f1f (bg), 100px radius (pill), 12px text in #999999
 * - Timeline: rgba(255, 255, 255, 0.18) (default), #52a8ff (active)
 * - Scrim gradient: linear-gradient(to top, rgba(0,0,0,0.76) 0%, rgba(0,0,0,0) 93.785%)
 */

export const COLORS = {
    // Deep black base
    background: '#000000',

    // Strict Style-MD Hex Codes
    brand: {
        accent: '#52a8ff',      // Active states, timeline active, focus
        success: '#62c073',     // Positive indicator / PASS status
        warning: '#f59e0b',     // WARN status / data / metrics
        error: '#ef4444',       // ERROR / FAIL status
        cta: {
            bg: '#FFFFFF',
            text: '#121212',
            hover: '#e7e7e7',
        },
    },

    // Primary & CTAs
    primary: {
        DEFAULT: '#52a8ff',     // Tech accent
        active: '#52a8ff',
        ctaBg: '#FFFFFF',       // Primary CTA btn-square background
        ctaText: '#121212',     // Primary CTA text
        glow: 'rgba(82, 168, 255, 0.15)',
        ring: 'rgba(82, 168, 255, 0.35)',
    },

    // Status System (Strictly mapped to style-md) 
    status: {
        pass: {
            dot: '#62c073',
            text: '#999999',
            bg: '#1f1f1f',
        },
        warn: {
            dot: '#f59e0b',
            text: '#999999',
            bg: '#1f1f1f',
        },
        fail: {
            dot: '#ef4444',
            text: '#999999',
            bg: '#1f1f1f',
        },
        offline: {
            dot: '#9ca3af',
            text: '#999999',
            bg: '#1f1f1f',
        },
        active: {
            dot: '#52a8ff',
            text: '#52a8ff',
            bg: '#1f1f1f',
        },
    },

    // System Status indicators (backward-compatible)
    success: {
        light: '#1f1f1f',
        DEFAULT: '#62c073',
        dark: '#489656',
    },
    warning: {
        light: '#1f1f1f',
        DEFAULT: '#999999',
        dark: '#777777',
    },
    danger: {
        light: '#1f1f1f',
        DEFAULT: '#ededed',
        dark: '#cccccc',
    },
    info: {
        light: '#1f1f1f',
        DEFAULT: '#52a8ff',
        dark: '#3b82f6',
    },

    // Cards, Chips & Surface Tokens
    surface: {
        bg: '#000000',
        card: '#0a0a0a',
        cardBorder: 'rgba(255, 255, 255, 0.145)',
        chipBg: '#1f1f1f',
        sidebar: '#000000',
        border: 'rgba(255, 255, 255, 0.145)',
        text: '#ffffff',
        headline: '#ffffff',
        subtext: '#e7e7e7',
        muted: '#999999',
        data: '#999999',

        // Theme modes (Dark Tech is default)
        dark: {
            bg: '#000000',
            card: '#0a0a0a',
            sidebar: '#000000',
            border: 'rgba(255, 255, 255, 0.145)',
            text: '#ffffff',
            textMuted: '#999999',
        },
        light: {
            bg: '#000000',
            card: '#0a0a0a',
            sidebar: '#000000',
            border: 'rgba(255, 255, 255, 0.145)',
            text: '#ffffff',
            textMuted: '#999999',
        },
    },

    // Timeline Progress Bar (Event Stream)
    timeline: {
        track: 'transparent',
        default: 'rgba(255, 255, 255, 0.18)',
        active: '#52a8ff',
    },

    // Gradients & Scrim
    gradients: {
        scrim: 'linear-gradient(to top, rgba(0,0,0,0.76) 0%, rgba(0,0,0,0) 93.785%)',
        radialAccentGlow: 'radial-gradient(circle at 50% 0%, rgba(82, 168, 255, 0.15) 0%, transparent 70%)',
        radialSubtle: 'radial-gradient(ellipse at top, rgba(82, 168, 255, 0.08) 0%, transparent 50%)',
    },
} as const;

export type ColorType = typeof COLORS;
