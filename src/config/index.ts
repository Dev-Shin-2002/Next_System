export const CONFIG = {
    port: Number(process.env.PORT) || 8888,
    app: {
        name: 'System Manager',
        description: 'Enterprise System Management Dashboard',
        defaultLocale: 'vi',
    },
    dashboard: {
        refreshIntervalMs: 30_000,
        defaultPageSize: 10,
        pageSizeOptions: [10, 25, 50],
    },
} as const;