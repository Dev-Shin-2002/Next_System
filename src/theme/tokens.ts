export const TOKENS = {
    spacing: {
        0: '0',
        1: '0.25rem',
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        8: '2rem',
        10: '2.5rem',
        12: '3rem',
        16: '4rem',
        20: '5rem',
        24: '6rem',
    },
    typography: {
        xs: { fontSize: '0.75rem', lineHeight: '1rem' },
        sm: { fontSize: '0.875rem', lineHeight: '1.25rem' },
        base: { fontSize: '1rem', lineHeight: '1.5rem' },
        lg: { fontSize: '1.125rem', lineHeight: '1.75rem' },
        xl: { fontSize: '1.25rem', lineHeight: '1.75rem' },
        '2xl': { fontSize: '1.5rem', lineHeight: '2rem' },
        '3xl': { fontSize: '1.875rem', lineHeight: '2.25rem' },
        '4xl': { fontSize: '2.25rem', lineHeight: '2.5rem' },
    },
    controlSize: {
        sm: '2rem',
        md: '2.5rem',
        lg: '3rem',
    },
    radius: {
        none: '0',
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        full: '9999px',
    },
    borderWidth: {
        default: '1px',
        thick: '2px',
    },
    shadow: {
        none: 'none',
        sm: '0 1px 2px 0 rgb(15 23 42 / 0.05)',
        md: '0 4px 6px -1px rgb(15 23 42 / 0.1), 0 2px 4px -2px rgb(15 23 42 / 0.1)',
        lg: '0 10px 15px -3px rgb(15 23 42 / 0.1), 0 4px 6px -4px rgb(15 23 42 / 0.1)',
        focus: '0 0 0 3px rgb(37 99 235 / 0.25)',
    },
    motion: {
        duration: {
            fast: '120ms',
            normal: '200ms',
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
        overlay: 30,
        modal: 40,
        toast: 50,
    },
    layout: {
        sidebarWidth: '16rem',        // 256px
        sidebarCollapsedWidth: '4rem',// 64px
        headerHeight: '3.5rem',       // 56px
        contentMaxWidth: '80rem',     // 1280px
    },
} as const;

export type TokenType = typeof TOKENS;
