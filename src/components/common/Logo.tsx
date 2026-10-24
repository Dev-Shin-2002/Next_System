import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { COLORS, FONTS, TOKENS } from '@/theme';

export type LogoSize = 'sm' | 'md' | 'lg' | 'xl';
export type LogoLayout = 'horizontal' | 'vertical' | 'mark-only';

export interface LogoProps {
    /** Layout orientation: horizontal (default in nav), vertical (stacked for login/card), or mark-only (icon box only) */
    layout?: LogoLayout;
    /** Size scale */
    size?: LogoSize;
    /** Optional link destination, e.g. "/" or "/admin". If provided, renders an accessible Next.js Link */
    href?: string;
    /** Custom title / app name. Defaults to "System Manager" */
    title?: React.ReactNode;
    /** Optional subtitle / tag line, e.g. "ADMIN CONSOLE", "PORTAL // v0.1.0", "SECURITY SUITE" */
    subtitle?: React.ReactNode;
    /** Hide the subtitle */
    hideSubtitle?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

const SIZES: Record<LogoSize, { box: number; fontSize: string; titleSize: string; subtitleSize: string; gap: string }> = {
    sm: { box: 24, fontSize: '10px', titleSize: '12px', subtitleSize: '9px', gap: '8px' },
    md: { box: 32, fontSize: '12px', titleSize: '14px', subtitleSize: '10px', gap: '12px' },
    lg: { box: 40, fontSize: '14px', titleSize: '16px', subtitleSize: '11px', gap: '14px' },
    xl: { box: 48, fontSize: '18px', titleSize: '20px', subtitleSize: '12px', gap: '16px' },
};

/**
 * ------------------------------------------------------------------
 * Centralized Logo Graphic (Change here to update everywhere)
 * ------------------------------------------------------------------
 * Single Source of Truth for the brand visual asset.
 * If you replace this with an SVG, image, or new icon, it updates
 * across the entire application simultaneously.
 */
export function LogoMark({
    size = 'md',
    className,
    style,
}: {
    size?: LogoSize;
    className?: string;
    style?: React.CSSProperties;
}) {
    const s = SIZES[size];
    return (
        <div
            className={className}
            aria-hidden="true"
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: s.box,
                height: s.box,
                flexShrink: 0,
                background: '#FFFFFF',
                borderRadius: TOKENS.radius.none, // 0px brutalist contrast 
                userSelect: 'none',
                padding: size === 'sm' ? '3px 4px' : '4px 6px',
                boxSizing: 'border-box',
                boxShadow: '0 0 12px rgba(255, 255, 255, 0.08)',
                ...style,
            }}
        >
            <Image
                src="/next.svg"
                alt="Brand Logo"
                width={394}
                height={80}
                unoptimized
                priority
                style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    display: 'block',
                }}
            />
        </div>
    );
}

/**
 * Polymorphic Logo component for Dark Tech Aesthetic (/style-md).
 */
export function Logo({
    layout = 'horizontal',
    size = 'md',
    href,
    title = 'System Manager',
    subtitle,
    hideSubtitle = false,
    className,
    style,
}: LogoProps) {
    const s = SIZES[size];
    const isVertical = layout === 'vertical';
    const isMarkOnly = layout === 'mark-only';

    const content = (
        <div
            className={className}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                flexDirection: isVertical ? 'column' : 'row',
                gap: s.gap,
                textDecoration: 'none',
                textAlign: isVertical ? 'center' : 'left',
                ...style,
            }}
        >
            <LogoMark size={size} />

            {!isMarkOnly && (
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, justifyContent: 'center' }}>
                    <span
                        style={{
                            display: 'block',
                            fontFamily: FONTS.display,
                            fontWeight: 600,
                            fontSize: s.titleSize,
                            lineHeight: 1.15,
                            letterSpacing: '-0.03em',
                            color: COLORS.surface.headline,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {title}
                    </span>

                    {!hideSubtitle && subtitle ? (
                        <span
                            style={{
                                display: 'block',
                                fontFamily: FONTS.mono,
                                fontSize: s.subtitleSize,
                                lineHeight: 1.3,
                                letterSpacing: '0.06em',
                                color: COLORS.surface.muted,
                                textTransform: 'uppercase',
                                whiteSpace: 'nowrap',
                                marginTop: 2,
                            }}
                        >
                            {subtitle}
                        </span>
                    ) : null}
                </div>
            )}
        </div>
    );

    if (href) {
        return (
            <Link
                href={href}
                style={{
                    display: 'inline-flex',
                    textDecoration: 'none',
                    color: 'inherit',
                }}
                className="group transition-opacity hover:opacity-90"
            >
                {content}
            </Link>
        );
    }

    return content;
}

export default Logo;
