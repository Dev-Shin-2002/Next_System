import * as React from 'react';
import { COLORS, FONTS, TOKENS } from '@/theme';

/**
 * Input: bare text input (no label, no error message) for the Dark Tech Aesthetic (/style-md).
 *
 * - 0px radius (same as btn-square), 1px border, #0a0a0a surface.
 * - `className` and `style` apply to the OUTER box (the visible border), not the <input>.
 *   Every other prop (type, value, onChange, autoComplete...) goes to the <input>.
 * - For a field with label and error text, use <TextField /> (TextField.tsx).
 * - Focus ring, placeholder, autofill and disabled cursor live in globals.css.
 */

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    size?: InputSize;
    /** Error state: red border and focus ring. Does NOT show a message. */
    invalid?: boolean;
    /** Decorative icon on the left (hidden from screen readers). */
    leftIcon?: React.ReactNode;
    /** Element on the right, e.g. an icon button. Rendered flush with the right edge. */
    rightSlot?: React.ReactNode;
}

const SIZE: Record<InputSize, { height: string; fontSize: string; padX: string }> = {
    sm: { height: TOKENS.controlSize.sm, fontSize: TOKENS.typography.sm.fontSize, padX: TOKENS.spacing[2] },
    md: { height: TOKENS.controlSize.md, fontSize: TOKENS.typography.sm.fontSize, padX: TOKENS.spacing[3] },
    lg: { height: TOKENS.controlSize.lg, fontSize: TOKENS.typography.base.fontSize, padX: TOKENS.spacing[3] },
};

const cx = (...parts: Array<string | false | null | undefined>) =>
    parts.filter(Boolean).join(' ') || undefined;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
    { size = 'md', invalid, leftIcon, rightSlot, className, style, disabled, ...rest },
    ref,
) {
    const s = SIZE[size];

    return (
        <div
            className={cx('dt-input', className)}
            data-invalid={invalid ? 'true' : undefined}
            data-disabled={disabled ? 'true' : undefined}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: TOKENS.spacing[2],
                width: '100%',
                height: s.height,
                paddingLeft: s.padX,
                background: COLORS.surface.card,
                border: TOKENS.borders.cardRing,
                borderRadius: TOKENS.radius.button, // 0px (brutalist, same as btn-square)
                boxSizing: 'border-box',
                ['--dt-input-pad' as string]: s.padX,
                ...style,
            } as React.CSSProperties}
        >
            {leftIcon ? (
                <span
                    aria-hidden="true"
                    style={{ display: 'flex', flexShrink: 0, color: COLORS.surface.muted }}
                >
                    {leftIcon}
                </span>
            ) : null}

            <input
                ref={ref}
                className="dt-input__control"
                disabled={disabled}
                aria-invalid={invalid ? true : undefined}
                style={{
                    flex: 1,
                    minWidth: 0,
                    height: '100%',
                    paddingRight: rightSlot ? 0 : s.padX,
                    background: 'transparent',
                    border: 0,
                    outline: 'none',
                    color: COLORS.surface.headline,
                    fontFamily: FONTS.sans,
                    fontSize: s.fontSize,
                }}
                {...rest}
            />

            {rightSlot ? (
                <span style={{ display: 'flex', alignSelf: 'stretch', flexShrink: 0 }}>{rightSlot}</span>
            ) : null}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
