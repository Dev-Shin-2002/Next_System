import * as React from 'react';

export interface CheckboxProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
    label?: React.ReactNode;
    error?: React.ReactNode;
    description?: React.ReactNode;
}

const CheckIcon = () => (
    <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const cx = (...parts: Array<string | false | null | undefined>) =>
    parts.filter(Boolean).join(' ') || undefined;

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
    {
        checked,
        defaultChecked,
        onChange,
        disabled,
        required,
        id,
        label,
        error,
        description,
        className,
        style,
        ...rest
    },
    ref,
) {
    const autoId = React.useId();
    const inputId = id ?? autoId;
    const errorId = `${inputId}-error`;

    const [internalChecked, setInternalChecked] = React.useState(Boolean(defaultChecked));
    const isControlled = checked !== undefined;
    const isChecked = isControlled ? Boolean(checked) : internalChecked;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isControlled) {
            setInternalChecked(e.target.checked);
        }
        onChange?.(e);
    };

    const hasError = Boolean(error);
    const showError = hasError && !isChecked;
    const hasDescription = Boolean(description);

    return (
        <div className={cx('flex flex-col gap-1', className)} style={style}>
            <label
                htmlFor={inputId}
                className={cx('dt-checkbox', hasDescription && 'dt-checkbox--with-desc')}
                data-checked={isChecked ? 'true' : undefined}
                data-disabled={disabled ? 'true' : undefined}
                data-invalid={showError ? 'true' : undefined}
            >
                <input
                    ref={ref}
                    id={inputId}
                    type="checkbox"
                    checked={isChecked}
                    onChange={handleChange}
                    disabled={disabled}
                    required={required}
                    aria-invalid={showError ? true : undefined}
                    aria-describedby={showError ? errorId : undefined}
                    className="dt-checkbox__input"
                    {...rest}
                />

                <span className="dt-checkbox__box" aria-hidden="true">
                    {isChecked ? <CheckIcon /> : null}
                </span>

                {label || description ? (
                    <span className="dt-checkbox__label">
                        {label ? (
                            <span className="inline-flex items-center">
                                {label}
                                {required ? (
                                    <span aria-hidden="true" style={{ marginLeft: 4, color: '#f87171' }}>
                                        *
                                    </span>
                                ) : null}
                            </span>
                        ) : null}
                        {description ? (
                            <span className="text-[11px] text-[#999999]/70 leading-normal">
                                {description}
                            </span>
                        ) : null}
                    </span>
                ) : null}
            </label>

            {showError ? (
                <span id={errorId} role="alert" className="text-xs text-[#f87171] font-sans pl-[26px]">
                    {error}
                </span>
            ) : null}
        </div>
    );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
