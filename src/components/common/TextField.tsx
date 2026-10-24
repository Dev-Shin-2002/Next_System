import * as React from 'react';
import { COLORS } from '@/theme';
import { Input, type InputProps } from './Input';
import { Typography } from './Typography';

/**
 * This file exports two things:
 *
 * - FormField: wraps ANY control with label + hint + error and wires up id / aria.
 *   Reusable later for Select, Textarea, Checkbox (move it to its own file when that happens).
 * - TextField: FormField + Input. This is what forms use day to day.
 *   With type="password" it shows a show/hide button automatically.
 */

/* ------------------------------------------------------------------ */
/* FormField                                                           */
/* ------------------------------------------------------------------ */

/** Spread these onto the control inside FormField. */
export type FieldA11yProps = {
    id: string;
    'aria-describedby'?: string;
    'aria-required'?: true;
};

export interface FormFieldProps {
    label: React.ReactNode;
    /** Helper text under the control. Replaced by `error` while an error is shown. */
    hint?: React.ReactNode;
    error?: React.ReactNode;
    required?: boolean;
    /** Hide the label visually but keep it for screen readers (e.g. search boxes). */
    hideLabel?: boolean;
    id?: string;
    className?: string;
    children: (a11y: FieldA11yProps) => React.ReactNode;
}

const VISUALLY_HIDDEN: React.CSSProperties = {
    position: 'absolute',
    width: 1,
    height: 1,
    margin: -1,
    padding: 0,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
    border: 0,
};

export function FormField({ label, hint, error, required, hideLabel, id, className, children }: FormFieldProps) {
    const autoId = React.useId();
    const fieldId = id ?? autoId;
    const hintId = `${fieldId}-hint`;
    const errorId = `${fieldId}-error`;

    const hasError = Boolean(error);
    const describedBy = hasError ? errorId : hint ? hintId : undefined;

    return (
        <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <Typography
                as="label"
                variant="label"
                htmlFor={fieldId}
                style={hideLabel ? VISUALLY_HIDDEN : undefined}
            >
                {label}
                {required ? (
                    <span aria-hidden="true" style={{ marginLeft: 4, color: COLORS.brand.error }}>
                        *
                    </span>
                ) : null}
            </Typography>

            {children({
                id: fieldId,
                'aria-describedby': describedBy,
                'aria-required': required ? true : undefined,
            })}

            {hasError ? (
                <Typography id={errorId} variant="body-sm" color="danger" role="alert">
                    {error}
                </Typography>
            ) : hint ? (
                <Typography id={hintId} variant="body-sm" color="muted">
                    {hint}
                </Typography>
            ) : null}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* TextField                                                           */
/* ------------------------------------------------------------------ */

export interface TextFieldProps extends Omit<InputProps, 'invalid' | 'id'> {
    label: React.ReactNode;
    hint?: React.ReactNode;
    /** A value here turns the field red and shows the message. */
    error?: React.ReactNode;
    hideLabel?: boolean;
    id?: string;
    /** Class for the whole field (label + input + message). `className` styles the input box only. */
    containerClassName?: string;
}

const EyeIcon = ({ off }: { off?: boolean }) => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
        {off ? <path d="M4 4l16 16" /> : null}
    </svg>
);

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
    { label, hint, error, hideLabel, id, containerClassName, type = 'text', required, rightSlot, ...rest },
    ref,
) {
    const [visible, setVisible] = React.useState(false);
    const isPassword = type === 'password';

    const toggle = isPassword ? (
        <button
            type="button"
            className="dt-input__action"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            aria-pressed={visible}
            disabled={rest.disabled}
        >
            <EyeIcon off={visible} />
        </button>
    ) : null;

    return (
        <FormField
            label={label}
            hint={hint}
            error={error}
            required={required}
            hideLabel={hideLabel}
            id={id}
            className={containerClassName}
        >
            {(a11y) => (
                <Input
                    {...rest}
                    {...a11y}
                    ref={ref}
                    type={isPassword && visible ? 'text' : type}
                    required={required}
                    invalid={Boolean(error)}
                    rightSlot={toggle ?? rightSlot}
                />
            )}
        </FormField>
    );
});

TextField.displayName = 'TextField';

export default TextField;
