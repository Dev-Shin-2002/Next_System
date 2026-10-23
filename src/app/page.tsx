'use client';

import React from 'react';
import { useTranslation } from '@/i18n';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function Home() {
    const { t, locale } = useTranslation();

    const metrics = [
        {
            label: t('dashboard.activeServices'),
            value: '18 / 20',
            subtext: t('system.status.running'),
            status: 'success',
            icon: (
                <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            ),
        },
        {
            label: t('dashboard.cpuUsage'),
            value: '28.4%',
            subtext: '4 Cores @ 3.6GHz',
            status: 'info',
            icon: (
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
        },
        {
            label: t('dashboard.ramUsage'),
            value: '10.2 / 16 GB',
            subtext: t('system.status.healthy'),
            status: 'success',
            icon: (
                <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
        },
        {
            label: t('dashboard.diskUsage'),
            value: '245 / 512 GB',
            subtext: t('system.status.pending'),
            status: 'warning',
            icon: (
                <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
            ),
        },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-primary selection:text-white">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-bold shadow-sm">
                        SM
                    </div>
                    <div>
                        <h1 className="text-sm font-semibold tracking-tight leading-none text-foreground">
                            {t('common.appName')}
                        </h1>
                        <span className="text-[11px] text-muted-foreground font-medium">Enterprise Edition</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 border border-success/20 text-xs font-medium text-success">
                        <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                        {t('system.status.healthy')}
                    </div>

                    {/* Language Switcher */}
                    <LanguageSwitcher />
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
                {/* Hero / Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">
                            {t('dashboard.title')}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            {t('dashboard.subtitle')}
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors shadow-sm"
                        >
                            <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {t('common.refresh')}
                        </button>
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-primary hover:bg-primary/90 text-white transition-colors shadow-sm"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {t('dashboard.quickActions')}
                        </button>
                    </div>
                </div>

                {/* KPI Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {metrics.map((item, idx) => (
                        <div
                            key={idx}
                            className="p-5 rounded-xl border border-border bg-card shadow-sm hover:border-primary/40 transition-all duration-200"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                                <div className="p-2 rounded-lg bg-muted">{item.icon}</div>
                            </div>
                            <div className="mt-4">
                                <div className="text-2xl font-bold tracking-tight text-foreground">{item.value}</div>
                                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                                        item.status === 'success' ? 'bg-success' : item.status === 'warning' ? 'bg-warning' : 'bg-primary'
                                    }`} />
                                    {item.subtext}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* System Specs & Terminal Info (Monospace test) */}
                <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <span className="p-1.5 rounded bg-primary/10 text-primary">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </span>
                            <h3 className="text-base font-semibold text-foreground">
                                {t('nav.logs')} & {t('system.status.running')} Details
                            </h3>
                        </div>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
                            Locale: {locale.toUpperCase()}
                        </span>
                    </div>

                    <div className="rounded-lg bg-sidebar p-4 font-mono text-xs text-sidebar-foreground space-y-2 border border-border/40 overflow-x-auto">
                        <div className="flex gap-4">
                            <span className="text-muted-foreground select-none">HOST:</span>
                            <span className="text-success">127.0.0.1</span>
                            <span className="text-muted-foreground select-none">PORT:</span>
                            <span className="text-primary font-bold">8888</span>
                            <span className="text-muted-foreground select-none">RUNTIME:</span>
                            <span>Next.js 16.4.2 (React 19)</span>
                        </div>
                        <div className="text-muted-foreground border-t border-white/10 pt-2">
                            [System-Log] 2026-10-23T16:53:00Z - i18n initialized with locale: <span className="text-warning font-bold">{locale}</span>. Theme tokens synchronized with Tailwind v4 inline specs.
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
