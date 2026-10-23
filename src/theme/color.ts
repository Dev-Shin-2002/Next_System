export const COLORS = {
    // Thương hiệu / Điểm nhấn chính (Tech Blue/Indigo)
    primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        500: '#3b82f6',
        600: '#2563eb', // Màu chính light mode
        700: '#1d4ed8',
        DEFAULT: '#2563eb',
    },

    // Trạng thái hệ thống (Services, Tasks, Alerts)
    success: {
        light: '#dcfce7',
        DEFAULT: '#16a34a', // Online / Running / Healthy
        dark: '#15803d',
    },
    warning: {
        light: '#fef9c3',
        DEFAULT: '#ca8a04', // Degraded / High Memory / Pending
        dark: '#a16207',
    },
    danger: {
        light: '#fee2e2',
        DEFAULT: '#dc2626', // Stopped / Crash / Error
        dark: '#b91c1c',
    },
    info: {
        light: '#e0f2fe',
        DEFAULT: '#0284c7', // Logs / Updates / Notifications
        dark: '#0369a1',
    },

    // Giao diện (Neutral / Surface)
    surface: {
        light: {
            bg: '#f8fafc',        // Nền trang
            card: '#ffffff',      // Nền card/bảng
            sidebar: '#0f172a',   // Nền sidebar đậm
            border: '#e2e8f0',    // Viền phân cách
            text: '#0f172a',      // Chữ chính
            textMuted: '#64748b', // Chữ phụ / mô tả
        },
        dark: {
            bg: '#090d16',
            card: '#111827',
            sidebar: '#030712',
            border: '#1f2937',
            text: '#f9fafb',
            textMuted: '#9ca3af',
        },
    },
} as const;

export type ColorType = typeof COLORS;
