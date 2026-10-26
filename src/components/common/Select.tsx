import * as React from 'react';
import { COLORS, FONTS, TOKENS } from '@/theme';

export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  size?: SelectSize;
  invalid?: boolean;
  options?: SelectOption[];
  children?: React.ReactNode;
}

const SIZE: Record<SelectSize, { height: string; fontSize: string; padX: string }> = {
  sm: { height: TOKENS.controlSize.sm, fontSize: TOKENS.typography.xs.fontSize, padX: TOKENS.spacing[2] },
  md: { height: TOKENS.controlSize.md, fontSize: TOKENS.typography.sm.fontSize, padX: TOKENS.spacing[3] },
  lg: { height: TOKENS.controlSize.lg, fontSize: TOKENS.typography.base.fontSize, padX: TOKENS.spacing[3] },
};

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(' ') || undefined;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { size = 'md', invalid, options, children, className, style, disabled, ...rest },
  ref
) {
  const s = SIZE[size];

  return (
    <div
      className={cx('dt-select relative flex items-center transition-colors', className)}
      data-invalid={invalid ? 'true' : undefined}
      data-disabled={disabled ? 'true' : undefined}
      style={
        {
          width: '100%',
          height: s.height,
          background: COLORS.surface.card,
          border: invalid ? '1px solid #ef4444' : TOKENS.borders.cardRing,
          borderRadius: TOKENS.radius.button,
          boxSizing: 'border-box',
          opacity: disabled ? 0.5 : 1,
          ...style,
        } as React.CSSProperties
      }
    >
      <select
        ref={ref}
        disabled={disabled}
        className="w-full h-full bg-transparent text-white font-mono appearance-none outline-none cursor-pointer disabled:cursor-not-allowed pl-2.5 pr-8 focus:border-[#52a8ff]"
        style={{
          fontFamily: FONTS.mono,
          fontSize: s.fontSize,
          backgroundColor: 'transparent',
          color: '#ffffff',
        }}
        {...rest}
      >
        {options
          ? options.map((opt) => (
            <option
              key={String(opt.value)}
              value={opt.value}
              disabled={opt.disabled}
              className="bg-[#121212] text-white py-1"
            >
              {opt.label}
            </option>
          ))
          : children}
      </select>

      {/* Custom Chevron Indicator */}
      <span className="pointer-events-none absolute right-2.5 text-[#999999] flex items-center">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </span>
    </div>
  );
});

Select.displayName = 'Select';
