'use client';

import React from 'react';
import { useTranslation } from '@/i18n';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function Home() {
    const { t, locale } = useTranslation();

    const metrics = [
        {
            label: t('dashboard.activeServices'),
            value: '18',
            unit: '/ 20',
            subtext: t('system.status.running'),
            status: 'pass',
        },
        {
            label: t('dashboard.cpuUsage'),
            value: '28.4',
            unit: '%',
            subtext: '4 Cores @ 3.6GHz',
            status: 'active',
        },
        {
            label: t('dashboard.ramUsage'),
            value: '10.2',
            unit: 'GB',
            subtext: t('system.status.healthy'),
            status: 'pass',
        },
        {
            label: t('dashboard.diskUsage'),
            value: '245',
            unit: 'GB',
            subtext: t('system.status.pending'),
            status: 'warn',
        },
    ];

    const timelineEvents = [
        { span: 'API Gateway Ingress', start: '12%', duration: '45%', status: 'PASS', time: '12ms' },
        { span: 'Auth Middleware Session', start: '25%', duration: '30%', status: 'PASS', time: '8ms' },
        { span: 'Database Connection Pool', start: '40%', duration: '55%', status: 'ACTIVE', time: '24ms' },
        { span: 'Cluster Health Sentinel', start: '10%', duration: '20%', status: 'WARN', time: '5ms' },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-[#000000] text-[#FFFFFF] font-sans selection:bg-[#52a8ff] selection:text-[#000000] relative overflow-hidden">
            {/* Subtle Radial Glow in background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-[radial-gradient(ellipse_at_top,rgba(82,168,255,0.12)_0%,transparent_70%)] pointer-events-none" />

            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/[0.145] bg-[#000000]/80 px-6 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center bg-[#FFFFFF] text-[#121212] font-mono font-bold text-xs">
                        SM
                    </div>
                    <div>
                        <h1 className="text-sm font-semibold tracking-tight leading-none text-[#FFFFFF]">
                            {t('common.appName')}
                        </h1>
                        <span className="text-[11px] text-[#999999] font-mono">DARK TECH // ENTERPRISE</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Status Chip (Pill, 100px radius per /style-md) */}
                    <div className="v-chip">
                        <span className="v-chip-dot bg-[#62c073]" />
                        <span>{t('system.status.healthy')}</span>
                    </div>

                    {/* Language Switcher */}
                    <LanguageSwitcher />

                    {/* Header CTA: btn-square 0px radius */}
                    <button
                        type="button"
                        className="btn-square text-xs px-3 py-1.5 hidden sm:inline-flex gap-1.5"
                    >
                        <span>Book Demo</span>
                        <span className="text-[10px]">↗</span>
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8 relative z-10">
                {/* Hero / Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-4 border-b border-white/[0.145]">
                    <div>
                        <span className="text-[11px] font-mono uppercase tracking-widest text-[#52a8ff] mb-1 block">
                            System Telemetry & Controls
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-medium tracking-[-1.5px] text-[#FFFFFF] font-sans">
                            {t('dashboard.title')}
                        </h2>
                        <p className="text-sm text-[#e7e7e7] mt-1 max-w-xl">
                            {t('dashboard.subtitle')}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Secondary Button */}
                        <button
                            type="button"
                            className="btn-square px-3.5 py-2 text-xs bg-[#1f1f1f] text-[#FFFFFF] border border-white/[0.145] hover:bg-[#2a2a2a] gap-2"
                        >
                            <svg className="w-3.5 h-3.5 text-[#999999]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {t('common.refresh')}
                        </button>

                        {/* Primary CTA: 0px border-radius, #FFFFFF bg, #121212 text */}
                        <button
                            type="button"
                            className="btn-square px-4 py-2 text-xs gap-2"
                        >
                            <span>{t('dashboard.quickActions')}</span>
                            <span className="text-xs">↗</span>
                        </button>
                    </div>
                </div>

                {/* Metrics Grid: 4-column border-connected style with Geist Mono values */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {metrics.map((item, idx) => (
                        <div
                            key={idx}
                            className="p-5 bg-[#0a0a0a] border border-white/[0.145] transition-all hover:border-[#52a8ff]/40"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-mono uppercase tracking-wider text-[#999999]">{item.label}</span>
                                <div className="v-chip !px-2 !py-0.5 !gap-1.5 text-[11px]">
                                    <span
                                        className={`v-chip-dot ${item.status === 'pass'
                                            ? 'bg-[#62c073]'
                                            : item.status === 'warn'
                                                ? 'bg-[#999999]'
                                                : 'bg-[#52a8ff]'
                                            }`}
                                    />
                                    <span>{item.status.toUpperCase()}</span>
                                </div>
                            </div>

                            <div className="mt-5 flex items-baseline gap-1.5">
                                <span className="text-4xl font-mono tracking-[-2px] text-[#FFFFFF]">
                                    {item.value}
                                </span>
                                <span className="text-sm font-mono text-[#999999]">
                                    {item.unit}
                                </span>
                            </div>

                            <div className="text-xs font-mono text-[#999999] mt-2 flex items-center gap-1.5">
                                <span>{item.subtext}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Event Stream / Timeline Progress Section (Style-MD signature) */}
                <div className="bg-[#0a0a0a] border border-white/[0.145] p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.08]">
                        <div className="flex items-center gap-2.5">
                            <span className="w-2 h-2 bg-[#52a8ff] inline-block" />
                            <h3 className="text-sm font-semibold tracking-wide text-[#FFFFFF] uppercase font-mono">
                                Event Stream // Trace [0x88F-2A]
                            </h3>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-mono text-[#999999]">
                            <span className="v-chip !py-0.5 !px-2 text-[11px]">
                                <span className="v-chip-dot bg-[#62c073]" />
                                PASS: 100%
                            </span>
                            <span>SPAN COUNT: 4</span>
                        </div>
                    </div>

                    <div className="space-y-3 font-mono text-xs">
                        {timelineEvents.map((event, idx) => (
                            <div
                                key={idx}
                                className="grid grid-cols-12 items-center gap-3 py-2 px-3 bg-[#000000]/60 border border-white/[0.06] hover:border-white/[0.15] transition-colors"
                            >
                                <span className="col-span-4 sm:col-span-3 text-[#FFFFFF] truncate">
                                    {event.span}
                                </span>

                                {/* Progress Bar column (1.5h relative bg, rounded-sm 2px) */}
                                <div className="col-span-6 sm:col-span-7 relative h-1.5 bg-transparent">
                                    <div
                                        className={`absolute top-0 bottom-0 rounded-[2px] ${event.status === 'ACTIVE'
                                            ? 'bg-[#52a8ff]'
                                            : 'bg-white/[0.18]'
                                            }`}
                                        style={{ left: event.start, width: event.duration }}
                                    />
                                </div>

                                <div className="col-span-2 text-right text-[#999999] text-[11px]">
                                    {event.time}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Monospace System Logs Card */}
                <div className="bg-[#0a0a0a] border border-white/[0.145] p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-[#62c073] rounded-full inline-block" />
                            <h3 className="text-xs font-mono uppercase tracking-wider text-[#FFFFFF]">
                                {t('nav.logs')}
                            </h3>
                        </div>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-[100px] bg-[#1f1f1f] text-[#999999]">
                            LOCALE: {locale.toUpperCase()}
                        </span>
                    </div>

                    <div className="bg-[#000000] p-4 font-mono text-xs text-[#e7e7e7] space-y-2 border border-white/[0.08] overflow-x-auto">
                        <div className="flex flex-wrap gap-4 text-xs">
                            <span className="text-[#999999]">HOST:</span>
                            <span className="text-[#62c073]">127.0.0.1</span>
                            <span className="text-[#999999]">PORT:</span>
                            <span className="text-[#52a8ff] font-bold">8888</span>
                            <span className="text-[#999999]">THEME:</span>
                            <span className="text-[#FFFFFF]">Dark Tech (/style-md)</span>
                            <span className="text-[#999999]">FONTS:</span>
                            <span>Inter Display / Geist Mono</span>
                        </div>
                        <div className="text-[#999999] border-t border-white/[0.08] pt-2 text-[11px]">
                            [System-Log] 2026-10-23T17:15:00Z - /style-md active: 0px square buttons, 100px pill status chips, #0a0a0a cards with 1px border rgba(255,255,255,0.145).
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
