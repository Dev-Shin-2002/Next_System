/**
 * Dark Tech Aesthetic Design Tokens (/style-md)
 * 
 * Strict specifications:
 * - Brutalist vs Pill contrast: MUST use 0px border-radius for buttons and 100px for status chips.
 * - Cards: #0a0a0a with 1px ring border rgba(255, 255, 255, 0.145).
 * - Timeline: 1.5h container, rounded-sm (2px) inner bar.
 * - Split view: 240px sidebar for event stream.
 */

export const TOKENS = {
    // Spacing scale
    spacing: {
        0: '0',
        1: '0.25rem',   // 4px
        1.5: '0.375rem',// 6px (timeline height)
        2: '0.5rem',     // 8px
        2.5: '0.625rem',// 10px (chip padding x)
        3: '0.75rem',    // 12px
        4: '1rem',       // 16px
        5: '1.25rem',    // 20px
        6: '1.5rem',     // 24px
        8: '2rem',       // 32px
        10: '2.5rem',    // 40px
        12: '3rem',      // 48px
        14: '3.5rem',    // 56px (header padding)
        16: '4rem',      // 64px
        20: '5rem',      // 80px
        24: '6rem',      // 96px
    },

    // Brutalist (0px) vs Pill (100px) Radius Contrast
    radius: {
        none: '0px',
        square: '0px',
        button: '0px',   // MUST be 0px for brutalist CTAs
        card: '0px',     // Sharp tech card border
        progress: '2px', // 2px for timeline progress bar (rounded-sm)
        sm: '2px',
        md: '4px',
        lg: '8px',
        chip: '100px',   // MUST be 100px for pill status chips
        pill: '100px',
        full: '9999px',
    },

    // Typography presets
    typography: {
        xs: { fontSize: '0.75rem', lineHeight: '1rem' },
        sm: { fontSize: '0.875rem', lineHeight: '1.25rem' },
        base: { fontSize: '1rem', lineHeight: '1.5rem' },
        lg: { fontSize: '1.125rem', lineHeight: '1.75rem' },
        xl: { fontSize: '1.25rem', lineHeight: '1.75rem' },
        '2xl': { fontSize: '1.5rem', lineHeight: '2rem' },
        '3xl': { fontSize: '1.875rem', lineHeight: '2.25rem' },
        '4xl': { fontSize: '2.25rem', lineHeight: '2.5rem' },
        // Style-MD specific sizes
        headlineFluid: {
            fontSize: 'clamp(2rem, 5vw, 3.75rem)',
            letterSpacing: '-3.36px',
            lineHeight: '1.1',
            fontWeight: '500',
            maxWidth: '752px',
        },
        metricLarge: {
            fontSize: '3.5rem', // 56px
            letterSpacing: '-3.36px',
            lineHeight: '1',
            fontFamily: 'var(--font-mono)',
        },
        statusText: {
            fontSize: '0.75rem', // 12px
            lineHeight: '1rem',
            fontFamily: 'var(--font-mono)',
            textTransform: 'uppercase' as const,
        },
        subtext: {
            fontSize: '1rem', // 16px
            lineHeight: '1.5rem',
            color: '#e7e7e7',
        },
    },

    // Component-level specs (/style-md)
    components: {
        // Primary square CTA
        btnSquare: {
            borderRadius: '0px',
            background: '#FFFFFF',
            color: '#121212',
            paddingSm: '8px 12px',
            fontSizeLg: '20px',
            iconSize: '12px',
            fontWeight: '600',
        },
        // Standardized pill status chip (v-chip)
        statusChip: {
            background: '#1f1f1f',
            borderRadius: '100px',
            padding: '4px 10px',
            gap: '6px',
            fontSize: '12px',
            textColor: '#999999',
            fontFamily: 'var(--font-mono)',
            dotSize: '6px',
            dotColors: {
                pass: '#62c073',
                warn: '#999999',
                fail: '#ededed',
                active: '#52a8ff',
            },
        },
        // Dark Tech Card (#0a0a0a with 1px ring rgba(255,255,255,0.145))
        card: {
            background: '#0a0a0a',
            border: '1px solid rgba(255, 255, 255, 0.145)',
            ring: '0 0 0 1px rgba(255, 255, 255, 0.145)',
        },
        // Event stream timeline progress bar
        timeline: {
            containerHeight: '0.375rem', // 6px (h-1.5)
            innerRadius: '2px',
            defaultColor: 'rgba(255, 255, 255, 0.18)',
            activeColor: '#52a8ff',
        },
        // Scrim gradient for hero sections
        scrim: {
            gradient: 'linear-gradient(to top, rgba(0,0,0,0.76) 0%, rgba(0,0,0,0) 93.785%)',
        },
        // Radial background accent glow
        radialGlow: {
            glow: 'radial-gradient(circle at 50% 0%, rgba(82, 168, 255, 0.15) 0%, transparent 70%)',
        },
    },

    controlSize: {
        sm: '2rem',
        md: '2.5rem',
        lg: '3rem',
    },

    borderWidth: {
        default: '1px',
        thick: '2px',
    },

    borders: {
        cardRing: '1px solid rgba(255, 255, 255, 0.145)',
        ringRgba: 'rgba(255, 255, 255, 0.145)',
    },

    shadow: {
        none: 'none',
        card: '0 0 0 1px rgba(255, 255, 255, 0.145)',
        ringAccent: '0 0 0 1px #52a8ff, 0 0 16px -2px rgba(82, 168, 255, 0.4)',
        focus: '0 0 0 2px #52a8ff',
        glow: '0 0 24px -4px rgba(82, 168, 255, 0.3)',
    },

    motion: {
        duration: {
            fast: '100ms',
            normal: '180ms',
            slow: '300ms',
        },
        easing: {
            standard: 'cubic-bezier(0.2, 0, 0, 1)',
            emphasized: 'cubic-bezier(0.2, 0, 0, 1.2)',
        },
    },

    zIndex: {
        base: 0,
        dropdown: 10,
        sticky: 20,
        header: 30,
        overlay: 40,
        modal: 50,
        toast: 60,
    },

    // Layout specifications (/style-md)
    layout: {
        headerTop: '38px',
        headerPaddingX: '56px',
        sidebarWidth: '240px',          // Style-MD Event Stream left sidebar
        sidebarCollapsedWidth: '64px',
        heroHeight: '100svh',
        headlineMaxWidth: '752px',
        contentMaxWidth: '80rem',       // 1280px
    },
} as const;

export type TokenType = typeof TOKENS;
