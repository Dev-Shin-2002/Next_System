import * as React from 'react';
import Link from 'next/link';
import { FONTS, TOKENS } from '@/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    href?: string;
    children?: React.ReactNode;
}

const SIZE_STYLES: Record<ButtonSize, { height: string; padding: string; fontSize: string }> = {
    sm: {
        height: TOKENS.controlSize.sm, // 32px
        padding: '0 12px',
        fontSize: TOKENS.typography.xs.fontSize,
    },
    md: {
        height: TOKENS.controlSize.md, // 40px
        padding: '0 16px',
        fontSize: TOKENS.typography.sm.fontSize,
    },
    lg: {
        height: TOKENS.controlSize.lg, // 48px
        padding: '0 24px',
        fontSize: TOKENS.typography.base.fontSize,
    },
};

const Spinner = () => (
    <svg
        className="animate-spin"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
    >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
        <path
            d="M12 2a10 10 0 0 1 10 10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
        />
    </svg>
);

const cx = (...parts: Array<string | false | null | undefined>) =>
    parts.filter(Boolean).join(' ') || undefined;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    {
        variant = 'primary',
        size = 'md',
        fullWidth = false,
        isLoading = false,
        leftIcon,
        rightIcon,
        href,
        disabled,
        className,
        style,
        children,
        type = 'button',
        ...rest
    },
    ref,
) {
    const s = SIZE_STYLES[size];
    const isDisabled = disabled || isLoading;

    const combinedStyle: React.CSSProperties = {
        height: s.height,
        padding: s.padding,
        fontSize: s.fontSize,
        fontFamily: FONTS.sans,
        width: fullWidth ? '100%' : undefined,
        ...style,
    };

    const variantClass = `dt-btn--${variant}`;
    const classes = cx('dt-btn', variantClass, className);

    const innerContent = (
        <>
            {isLoading ? <Spinner /> : leftIcon ? <span aria-hidden="true" className="flex shrink-0 items-center">{leftIcon}</span> : null}
            <span>{children}</span>
            {!isLoading && rightIcon ? <span aria-hidden="true" className="flex shrink-0 items-center">{rightIcon}</span> : null}
        </>
    );

    if (href) {
        return (
            <Link
                href={href}
                className={classes}
                style={combinedStyle}
                data-disabled={isDisabled ? 'true' : undefined}
                aria-disabled={isDisabled ? 'true' : undefined}
            >
                {innerContent}
            </Link>
        );
    }

    return (
        <button
            ref={ref}
            type={type}
            disabled={isDisabled}
            aria-busy={isLoading ? 'true' : undefined}
            className={classes}
            style={combinedStyle}
            {...rest}
        >
            {innerContent}
        </button>
    );
});

Button.displayName = 'Button';

export default Button;
