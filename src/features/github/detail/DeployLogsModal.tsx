'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Typography,
  Button,
  Input,
  IconRegistry,
} from '@/components/common';
import { fetchGithubDeploymentLogs } from '@/app/api/github/repos';
import type {
  LinkedDeployment,
  DeploymentLogsResponse,
  DeployHistoryItem,
  DeploymentLogEntry,
} from '@/app/api/github/repo-detail.types';

export interface DeployLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  repoId: number;
  deployment: LinkedDeployment;
}

export const DeployLogsModal: React.FC<DeployLogsModalProps> = ({
  isOpen,
  onClose,
  repoId,
  deployment,
}) => {
  const [activeTab, setActiveTab] = useState<'logs' | 'history'>('logs');
  const [logsData, setLogsData] = useState<DeploymentLogsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Bộ lọc tìm kiếm log
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const terminalRef = useRef<HTMLDivElement | null>(null);

  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const data = await fetchGithubDeploymentLogs(repoId, deployment.linkId);
      setLogsData(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải nhật ký triển khai từ máy chủ cloud.';
      setError(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    loadData();

    // Auto-poll mỗi 4 giây nếu dự án đang ở trạng thái building / queued
    const interval = setInterval(() => {
      if (logsData?.status === 'building' || logsData?.status === 'queued') {
        loadData(true);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isOpen, deployment.linkId, logsData?.status]);

  // Tự động cuộn xuống đáy terminal khi có log mới
  useEffect(() => {
    if (autoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logsData?.logs, autoScroll, activeTab]);

  if (!isOpen) return null;

  const currentStatus = logsData?.status || deployment.state;
  const deploys: DeployHistoryItem[] = logsData?.deploys || [];
  const latestDeploy = deploys[0];

  // Lọc log theo từ khóa tìm kiếm
  const filteredLogs: DeploymentLogEntry[] = (logsData?.logs || []).filter((l) =>
    searchFilter ? l.message.toLowerCase().includes(searchFilter.toLowerCase()) : true
  );

  const handleCopyLogs = () => {
    if (!logsData?.logs) return;
    const fullText = logsData.logs
      .map((l) => `[${l.timestamp}] ${l.message}`)
      .join('\n');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#0a0a0a] border border-[var(--border)] max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-3.5 border-b border-[var(--border)] flex items-center justify-between bg-[#111]">
          <div className="flex items-center gap-3">
            <span
              className={`w-2.5 h-2.5 rounded-full ${currentStatus === 'ready'
                ? 'bg-emerald-400'
                : currentStatus === 'building'
                  ? 'bg-amber-400 animate-pulse'
                  : currentStatus === 'error'
                    ? 'bg-red-400'
                    : 'bg-neutral-500'
                }`}
            />
            <div>
              <div className="flex items-center gap-2">
                <Typography variant="body-sm" className="font-semibold text-white tracking-wide">
                  Tiến trình Triển khai & Nhật ký Console
                </Typography>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-neutral-800 text-neutral-300 border border-neutral-700">
                  {deployment.provider}
                </span>
              </div>
              <Typography variant="caption" color="muted" className="font-mono text-[11px]">
                {deployment.projectName}
                {deployment.url && (
                  <>
                    {' · '}
                    <a
                      href={deployment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#52a8ff] hover:underline"
                    >
                      {deployment.url.replace(/^https?:\/\//, '')}
                    </a>
                  </>
                )}
              </Typography>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {deployment.dashboardUrl && (
              <a
                href={deployment.dashboardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 text-[11px] font-mono bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-neutral-300 hover:text-white inline-flex items-center gap-1.5 transition-colors"
                title="Mở Dashboard nhà cung cấp cloud"
              >
                <span>Mở Cloud Dashboard</span>
                <IconRegistry name="external-link" size={11} />
              </a>
            )}
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white p-1 transition-colors"
              aria-label="Đóng"
            >
              <IconRegistry name="close" size={16} />
            </button>
          </div>
        </div>

        {/* Status Highlight Banner */}
        <div className="px-6 py-2.5 bg-[#0f0f0f] border-b border-neutral-800 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-400">Trạng thái:</span>
              <span
                className={`font-semibold uppercase px-2 py-0.5 text-[10px] ${currentStatus === 'ready'
                  ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-400'
                  : currentStatus === 'building'
                    ? 'bg-amber-950/60 border border-amber-500/30 text-amber-300 animate-pulse'
                    : currentStatus === 'error'
                      ? 'bg-red-950/60 border border-red-500/30 text-red-400'
                      : 'bg-neutral-800 text-neutral-300'
                  }`}
              >
                {currentStatus}
              </span>
            </div>

            {latestDeploy && (
              <>
                <div className="flex items-center gap-1.5 text-neutral-400">
                  <span>Deploy ID:</span>
                  <span className="text-white">{latestDeploy.id}</span>
                </div>
                {latestDeploy.commitSha && (
                  <div className="flex items-center gap-1.5 text-neutral-400">
                    <span>Commit:</span>
                    <span className="text-[#52a8ff] bg-[#141414] px-1.5 py-0.5 border border-neutral-800">
                      {latestDeploy.commitSha}
                    </span>
                    {latestDeploy.commitMessage && (
                      <span className="truncate max-w-[180px] text-neutral-400">
                        ({latestDeploy.commitMessage})
                      </span>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-3 text-neutral-500 text-[11px]">
            {latestDeploy?.createdAt && (
              <span>Bắt đầu: {new Date(latestDeploy.createdAt).toLocaleTimeString('vi-VN')}</span>
            )}
            {latestDeploy?.finishedAt && (
              <span>Xong: {new Date(latestDeploy.finishedAt).toLocaleTimeString('vi-VN')}</span>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 bg-[#0a0a0a] border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('logs')}
              className={`py-2.5 text-xs font-mono font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'logs'
                ? 'border-[#52a8ff] text-white'
                : 'border-transparent text-neutral-400 hover:text-white'
                }`}
            >
              <IconRegistry name="logs" size={13} />
              <span>Nhật ký Console (Terminal Logs)</span>
              {currentStatus === 'building' && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`py-2.5 text-xs font-mono font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'history'
                ? 'border-[#52a8ff] text-white'
                : 'border-transparent text-neutral-400 hover:text-white'
                }`}
            >
              <IconRegistry name="tasks" size={13} />
              <span>Lịch sử Deploy ({deploys.length})</span>
            </button>
          </div>

          {/* Refresh & Copy Toolbar for Logs Tab */}
          {activeTab === 'logs' && (
            <div className="flex items-center gap-2 py-1.5">
              <div className="w-48">
                <Input
                  size="sm"
                  placeholder="Tìm kiếm log..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="h-7 text-[11px]"
                />
              </div>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setAutoScroll(!autoScroll)}
                className={`h-7 text-[11px] px-2 ${autoScroll ? 'text-[#52a8ff] border-[#52a8ff]/40' : 'text-neutral-400'}`}
                title="Tự động cuộn theo log mới nhất"
              >
                <span>Cuộn tự động</span>
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleCopyLogs}
                className="h-7 text-[11px] px-2 gap-1"
                title="Sao chép toàn bộ logs vào clipboard"
              >
                <span>{copied ? 'Đã copy!' : 'Copy'}</span>
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => loadData(false)}
                disabled={isRefreshing}
                className="h-7 text-[11px] px-2 gap-1"
                title="Làm mới log từ máy chủ"
              >
                <IconRegistry name="refresh" size={12} className={isRefreshing ? 'animate-spin' : ''} />
                <span>Làm mới</span>
              </Button>
            </div>
          )}
        </div>

        {/* Modal Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-950/40 border border-red-500/30 text-xs text-red-300 font-mono flex items-start gap-2">
              <IconRegistry name="alert-triangle" size={14} className="shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-neutral-700 border-t-[#52a8ff] rounded-full animate-spin mx-auto" />
              <Typography variant="caption" color="muted" className="font-mono text-xs">
                Đang nạp nhật ký trực tiếp từ máy chủ {deployment.provider.toUpperCase()}...
              </Typography>
            </div>
          ) : activeTab === 'logs' ? (
            /* TAB 1: TERMINAL LOGS VIEW */
            <div
              ref={terminalRef}
              className="bg-[#050505] border border-neutral-800 p-4 font-mono text-xs overflow-y-auto max-h-[50vh] space-y-1 select-text"
            >
              {filteredLogs.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 font-mono text-xs">
                  {searchFilter
                    ? `Không tìm thấy dòng log nào khớp với từ khóa "${searchFilter}".`
                    : 'Chưa có nhật ký ghi nhận từ cloud.'}
                </div>
              ) : (
                filteredLogs.map((entry, idx) => {
                  const isErr = entry.level === 'error' || entry.message.includes('❌') || entry.message.includes('Error') || entry.message.includes('failed');
                  const isSuccess = entry.message.includes('✓') || entry.message.includes('success') || entry.message.includes('Live');
                  const isHighlight = entry.message.startsWith('==>') || entry.message.startsWith('[');

                  return (
                    <div
                      key={idx}
                      className={`leading-relaxed flex items-start gap-3 hover:bg-neutral-900/50 py-0.5 px-1 ${isErr
                        ? 'text-red-400 bg-red-950/20'
                        : isSuccess
                          ? 'text-emerald-400'
                          : isHighlight
                            ? 'text-[#52a8ff]'
                            : 'text-neutral-300'
                        }`}
                    >
                      <span className="text-neutral-600 select-none shrink-0 text-[10px] w-20 pt-0.5">
                        {entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString('vi-VN') : ''}
                      </span>
                      <pre className="whitespace-pre-wrap break-all flex-1 font-mono text-[11px]">
                        {entry.message}
                      </pre>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* TAB 2: DEPLOYS HISTORY VIEW */
            <div className="space-y-3">
              {deploys.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 font-mono text-xs border border-dashed border-neutral-800">
                  Chưa có lịch sử deploy nào được ghi nhận.
                </div>
              ) : (
                <div className="divide-y divide-neutral-900 border border-neutral-800 bg-[#0c0c0c]">
                  {deploys.map((d) => (
                    <div key={d.id} className="p-3.5 flex items-center justify-between hover:bg-neutral-900/40 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-white text-xs font-semibold">{d.id}</span>
                          <span
                            className={`px-2 py-0.5 text-[10px] uppercase font-mono ${d.status === 'live' || d.status === 'succeeded' || d.status === 'ready'
                              ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-400'
                              : d.status === 'build_in_progress' || d.status === 'building'
                                ? 'bg-amber-950/60 border border-amber-500/30 text-amber-300 animate-pulse'
                                : d.status === 'build_failed' || d.status === 'error'
                                  ? 'bg-red-950/60 border border-red-500/30 text-red-400'
                                  : 'bg-neutral-800 text-neutral-400'
                              }`}
                          >
                            {d.status}
                          </span>
                          <span className="text-[10px] text-neutral-500 font-mono">({d.trigger || 'commit'})</span>
                        </div>

                        {d.commitSha && (
                          <div className="flex items-center gap-1.5 text-neutral-400 font-mono text-[11px]">
                            <span>Commit:</span>
                            <span className="text-[#52a8ff]">{d.commitSha}</span>
                            {d.commitMessage && <span className="truncate max-w-md">- {d.commitMessage}</span>}
                          </div>
                        )}
                      </div>

                      <div className="text-right text-[11px] font-mono text-neutral-500 space-y-0.5">
                        <div>Tạo lúc: {new Date(d.createdAt).toLocaleString('vi-VN')}</div>
                        {d.finishedAt && (
                          <div className="text-neutral-400">
                            Hoàn tất: {new Date(d.finishedAt).toLocaleTimeString('vi-VN')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[var(--border)] bg-[#111] flex items-center justify-between">
          <Typography variant="caption" color="muted" className="font-mono text-[11px]">
            Tự động làm mới khi đợt build đang diễn ra.
          </Typography>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};
