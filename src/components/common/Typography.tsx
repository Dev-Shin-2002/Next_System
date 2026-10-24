import * as React from 'react';
import { COLORS, FONTS, TOKENS } from '@/theme';

/**
 * Typography: polymorphic text component for the Dark Tech Aesthetic (/style-md).
 *
 * - `variant` decides how it looks, `as` decides which HTML tag is rendered.
 * - Every style value is read from src/theme, so there is no hard-coded hex here
 *   and no dependency on the Tailwind config.
 * - letter-spacing uses `em` so tracking scales with font size (required for clamp()).
 */

/* ------------------------------------------------------------------ */
/* Colors                                                              */
/* ------------------------------------------------------------------ */

const COLOR_MAP = {
    primary: COLORS.surface.headline, // #ffffff
    subtext: COLORS.surface.subtext, // #e7e7e7
    muted: COLORS.surface.muted, // #999999
    accent: COLORS.brand.accent, // #52a8ff
    success: COLORS.brand.success, // #62c073
    warning: COLORS.brand.warning, // #f59e0b
    danger: COLORS.brand.error, // #ef4444
} as const;

export type TypographyColor = keyof typeof COLOR_MAP;

/* ------------------------------------------------------------------ */
/* Variants                                                            */
/* ------------------------------------------------------------------ */

type VariantSpec = {
    tag: React.ElementType;
    style: React.CSSProperties;
    color: TypographyColor; // default color, overridden by the `color` prop
};

const T = TOKENS.typography;

const VARIANTS = {
    'headline-fluid': {
        tag: 'h1',
        color: 'primary',
        style: {
            fontFamily: FONTS.display,
            fontWeight: 500,
            fontSize: T.headlineFluid.fontSize,
            lineHeight: T.headlineFluid.lineHeight,
            letterSpacing: '-0.056em', // -3.36px at 60px
            maxWidth: TOKENS.layout.headlineMaxWidth,
        },
    },
    h1: {
        tag: 'h1',
        color: 'primary',
        style: {
            fontFamily: FONTS.display,
            fontWeight: 500,
            fontSize: T['4xl'].fontSize,
            lineHeight: T['4xl'].lineHeight,
            letterSpacing: '-0.056em', // -2px at 36px
        },
    },
    h2: {
        tag: 'h2',
        color: 'primary',
        style: {
            fontFamily: FONTS.display,
            fontWeight: 500,
            fontSize: T['3xl'].fontSize,
            lineHeight: T['3xl'].lineHeight,
            letterSpacing: '-0.05em', // -1.5px at 30px
        },
    },
    h3: {
        tag: 'h3',
        color: 'primary',
        style: {
            fontFamily: FONTS.display,
            fontWeight: 500,
            fontSize: T['2xl'].fontSize,
            lineHeight: T['2xl'].lineHeight,
            letterSpacing: '-0.042em', // -1px at 24px
        },
    },
    // h4 intentionally uses the sans family: at 20px the display optical size loses legibility.
    h4: {
        tag: 'h4',
        color: 'primary',
        style: {
            fontFamily: FONTS.sans,
            fontWeight: 600,
            fontSize: T.xl.fontSize,
            lineHeight: T.xl.lineHeight,
            letterSpacing: '-0.025em', // tracking-tight
        },
    },
    metric: {
        tag: 'span',
        color: 'muted', // follows TYPOGRAPHY_SPECS.metric (#999999)
        style: {
            display: 'block',
            fontFamily: FONTS.mono,
            fontSize: T.metricLarge.fontSize,
            lineHeight: T.metricLarge.lineHeight,
            letterSpacing: '-0.06em', // -3.36px at 56px
            fontVariantNumeric: 'tabular-nums',
        },
    },
    body: {
        tag: 'p',
        color: 'subtext',
        style: {
            fontFamily: FONTS.sans,
            fontSize: T.base.fontSize,
            lineHeight: 1.625, // leading-relaxed
        },
    },
    'body-sm': {
        tag: 'p',
        color: 'muted',
        style: {
            fontFamily: FONTS.sans,
            fontSize: T.sm.fontSize,
            lineHeight: T.sm.lineHeight,
        },
    },
    // Form labels (FormField), not part of the original proposal
    label: {
        tag: 'span',
        color: 'subtext',
        style: {
            fontFamily: FONTS.sans,
            fontWeight: 500,
            fontSize: T.sm.fontSize,
            lineHeight: T.sm.lineHeight,
        },
    },
    mono: {
        tag: 'code',
        color: 'subtext',
        style: {
            fontFamily: FONTS.mono,
            fontSize: T.xs.fontSize,
            lineHeight: T.xs.lineHeight,
            fontVariantNumeric: 'tabular-nums',
        },
    },
    status: {
        tag: 'span',
        color: 'muted',
        style: {
            fontFamily: FONTS.mono,
            fontSize: '11px',
            lineHeight: '1rem',
            textTransform: 'uppercase',
            fontVariantNumeric: 'tabular-nums',
        },
    },
    caption: {
        tag: 'span',
        color: 'muted',
        style: {
            fontFamily: FONTS.mono,
            fontSize: '10px',
            lineHeight: '1rem',
            fontVariantNumeric: 'tabular-nums',
        },
    },
} as const satisfies Record<string, VariantSpec>;

export type TypographyVariant = keyof typeof VARIANTS;
export type TypographyAlign = 'left' | 'center' | 'right';

/* ------------------------------------------------------------------ */
/* Polymorphic typing                                                  */
/* ------------------------------------------------------------------ */

type OwnProps<T extends React.ElementType> = {
    /** Visual style. Also decides the default tag. */
    variant?: TypographyVariant;
    /** Override the rendered tag, e.g. <Typography variant="h2" as="h1" />. */
    as?: T;
    /** Semantic color. Defaults per variant. */
    color?: TypographyColor;
    /** Single line with an ellipsis. Needs a width-limited parent. */
    truncate?: boolean;
    align?: TypographyAlign;
    uppercase?: boolean;
    /** Override the variant's font-weight. Use sparingly. */
    weight?: React.CSSProperties['fontWeight'];
    children?: React.ReactNode;
};

export type TypographyProps<T extends React.ElementType = 'span'> = OwnProps<T> &
    Omit<React.ComponentPropsWithoutRef<T>, keyof OwnProps<T>>;

type TypographyComponent = <T extends React.ElementType = 'span'>(
    props: TypographyProps<T> & { ref?: React.ComponentPropsWithRef<T>['ref'] },
) => React.ReactElement | null;

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const cx = (...parts: Array<string | false | null | undefined>) =>
    parts.filter(Boolean).join(' ') || undefined;

const TRUNCATE_STYLE: React.CSSProperties = {
    display: 'block',
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
};

function TypographyInner<T extends React.ElementType = 'span'>(
    {
        variant = 'body',
        as,
        color,
        truncate,
        align,
        uppercase,
        weight,
        className,
        style,
        ...rest
    }: TypographyProps<T> & { className?: string; style?: React.CSSProperties },
    ref: React.Ref<unknown>,
) {
    const spec: VariantSpec = VARIANTS[variant];
    const Tag = (as ?? spec.tag) as React.ElementType;

    const merged: React.CSSProperties = {
        margin: 0,
        ...spec.style,
        color: COLOR_MAP[color ?? spec.color],
        ...(truncate ? TRUNCATE_STYLE : null),
        ...(align ? { textAlign: align } : null),
        ...(uppercase ? { textTransform: 'uppercase' } : null),
        ...(weight !== undefined ? { fontWeight: weight } : null),
        ...style, // the caller's inline style always wins
    };

    return <Tag ref={ref} className={cx(className)} style={merged} {...rest} />;
}

export const Typography = React.forwardRef(TypographyInner) as TypographyComponent & {
    displayName?: string;
};
Typography.displayName = 'Typography';

export default Typography;
