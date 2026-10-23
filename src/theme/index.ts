import { COLORS } from './color';
import { FONTS, TYPOGRAPHY_SPECS } from './font';
import { TOKENS } from './tokens';

export * from './color';
export * from './font';
export * from './tokens';

/**
 * Unified Dark Tech Theme according to /style-md
 */
export const theme = {
    colors: COLORS,
    fonts: FONTS,
    tokens: TOKENS,
    typography: TYPOGRAPHY_SPECS,
    styleMd: {
        colors: {
            bg: COLORS.background,
            card: COLORS.surface.card,
            cardBorder: COLORS.surface.cardBorder,
            chipBg: COLORS.surface.chipBg,
            accent: COLORS.brand.accent,
            success: COLORS.brand.success,
            warning: COLORS.brand.warning,
            error: COLORS.brand.error,
            ctaBg: COLORS.brand.cta.bg,
            ctaText: COLORS.brand.cta.text,
            subtext: COLORS.surface.subtext,
            dataText: COLORS.surface.data,
            timelineDefault: COLORS.timeline.default,
            timelineActive: COLORS.timeline.active,
        },
        components: TOKENS.components,
        radius: {
            button: TOKENS.radius.button, // 0px
            chip: TOKENS.radius.chip,     // 100px
            card: TOKENS.radius.card,     // 0px
            progress: TOKENS.radius.progress, // 2px
        },
    },
} as const;

export default theme;
