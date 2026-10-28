import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { IconRegistry } from '@/components/common/IconRegistry';
import { DeploySetupModal } from './DeploySetupModal';
import { DeployLogsModal } from './DeployLogsModal';
import {
  deleteGithubDeploymentLink,
  toggleGithubDeploymentSuspend,
  triggerGithubDeploymentDeploy,
  restartGithubDeploymentService,
} from '@/app/api/github/repos';
import type {
  ListBlock,
  LinkedDeployment,
  GithubDeployment,
  Repo,
} from '@/app/api/github/repo-detail.types';

export interface RepoDeploymentBlockProps {
  repo?: Repo;
  linkedDeployments: ListBlock<LinkedDeployment>;
  githubDeployments: ListBlock<GithubDeployment>;
  onLinkDeployment?: () => void;
  onRetry?: () => void;
  onRefresh?: () => void;
}

function timeAgo(isoString: string | null): string {
  if (!isoString) return '—';
  try {
    const diff = Date.now() - new Date(isoString).getTime();
    if (diff < 0) return 'vừa xong';
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} ngày trước`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} tháng trước`;
    return `${Math.floor(months / 12)} năm trước`;
  } catch {
    return isoString;
  }
}

export const RepoDeploymentBlock: React.FC<RepoDeploymentBlockProps> = ({
  repo,
  linkedDeployments,
  githubDeployments,
  onLinkDeployment,
  onRefresh,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingLogsDeploy, setViewingLogsDeploy] = useState<LinkedDeployment | null>(null);
  const [activeActionDeploy, setActiveActionDeploy] = useState<LinkedDeployment | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [unlinkTarget, setUnlinkTarget] = useState<LinkedDeployment | null>(null);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  const prevStatesRef = useRef<Record<string, string>>({});

  // 1. Tự động lắng nghe khi trạng thái chuyển từ building -> ready
  useEffect(() => {
    linkedDeployments.items.forEach((deploy) => {
      const prev = prevStatesRef.current[deploy.linkId];
      if (prev && prev === 'building' && deploy.state === 'ready') {
        setFeedbackMessage({
          text: `🎉 Dự án ${deploy.projectName} (${deploy.provider.toUpperCase()}) đã hoàn tất build và sẵn sàng trên Production!`,
          type: 'success',
        });
      }
      prevStatesRef.current[deploy.linkId] = deploy.state;
    });
  }, [linkedDeployments.items]);

  // 2. Tự động định kỳ đồng bộ trạng thái khi có dịch vụ đang building
  useEffect(() => {
    const hasBuilding = linkedDeployments.items.some((d) => d.state === 'building');
    if (!hasBuilding || !onRefresh) return;

    const interval = setInterval(() => {
      onRefresh();
    }, 6000);

    return () => clearInterval(interval);
  }, [linkedDeployments.items, onRefresh]);

  const hasGithubDeploys =
    githubDeployments.status === 'ok' && githubDeployments.items.length > 0;
  const hasLinkedDeploys =
    linkedDeployments.status === 'ok' && linkedDeployments.items.length > 0;

  const handleLinkClick = () => {
    if (onLinkDeployment) {
      onLinkDeployment();
    }
    setIsModalOpen(true);
  };

  const handleToggleSuspend = async (deploy: LinkedDeployment) => {
    if (!repo?.id) return;
    setActionLoadingId(deploy.linkId);
    setFeedbackMessage(null);
    try {
      const nextAction = deploy.state === 'suspended' ? 'resume' : 'suspend';
      const res = await toggleGithubDeploymentSuspend(repo.id, deploy.linkId, nextAction);
      setFeedbackMessage({
        text: res.message || 'Cập nhật trạng thái thành công',
        type: 'success',
      });
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể thay đổi trạng thái triển khai';
      setFeedbackMessage({ text: msg, type: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleTriggerDeploy = async (deploy: LinkedDeployment) => {
    if (!repo?.id) return;
    setActionLoadingId(deploy.linkId);
    setFeedbackMessage(null);
    try {
      const res = await triggerGithubDeploymentDeploy(repo.id, deploy.linkId);
      setFeedbackMessage({
        text: res.message || 'Đã kích hoạt triển khai commit mới nhất thành công!',
        type: 'success',
      });
      setActiveActionDeploy(null);
      if (onRefresh) {
        onRefresh();
      }
      // Tự động mở terminal logs để người dùng theo dõi tiến trình
      setViewingLogsDeploy(deploy);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể kích hoạt triển khai';
      setFeedbackMessage({ text: msg, type: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRestartService = async (deploy: LinkedDeployment) => {
    if (!repo?.id) return;
    setActionLoadingId(deploy.linkId);
    setFeedbackMessage(null);
    try {
      const res = await restartGithubDeploymentService(repo.id, deploy.linkId);
      setFeedbackMessage({
        text: res.message || 'Đã gửi lệnh khởi động lại dịch vụ thành công!',
        type: 'success',
      });
      setActiveActionDeploy(null);
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể khởi động lại dịch vụ';
      setFeedbackMessage({ text: msg, type: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmUnlink = async () => {
    if (!repo?.id || !unlinkTarget) return;
    setIsUnlinking(true);
    try {
      const res = await deleteGithubDeploymentLink(repo.id, unlinkTarget.linkId);
      setFeedbackMessage({
        text: res.message || 'Đã xóa liên kết thành công',
        type: 'success',
      });
      setUnlinkTarget(null);
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể xóa liên kết triển khai';
      setFeedbackMessage({ text: msg, type: 'error' });
    } finally {
      setIsUnlinking(false);
    }
  };

  return (
    <div className="bg-[#0a0a0a] border border-[var(--border)] overflow-hidden">
      {/* Block Header */}
      <div className="px-5 py-3.5 border-b border-[var(--border)] flex items-center justify-between bg-black/40">
        <div className="flex items-center gap-2.5">
          <IconRegistry name="rocket" size={16} className="text-[#52a8ff]" />
          <Typography variant="body-sm" className="font-semibold text-white tracking-wide">
            Triển khai (Deployments)
          </Typography>
          {(hasLinkedDeploys || hasGithubDeploys) && (
            <span className="px-2 py-0.5 text-[10px] font-mono bg-[#141414] text-neutral-400 border border-neutral-800">
              {linkedDeployments.items.length + githubDeployments.items.length}
            </span>
          )}
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleLinkClick}
          className="text-xs h-7 px-2.5 gap-1.5"
        >
          <IconRegistry name="plus" size={12} />
          <span>Liên kết triển khai</span>
        </Button>
      </div>

      {/* Thông báo kết quả thao tác */}
      {feedbackMessage && (
        <div
          className={`mx-4 mt-3 px-3 py-2 text-xs border flex items-center justify-between ${feedbackMessage.type === 'success'
            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
            : 'bg-red-950/40 text-red-400 border-red-500/30'
            }`}
        >
          <span>{feedbackMessage.text}</span>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-neutral-400 hover:text-white p-0.5 ml-2 cursor-pointer"
          >
            <IconRegistry name="close" size={12} />
          </button>
        </div>
      )}

      {/* Block Body */}
      <div className="p-4 space-y-4">
        {hasLinkedDeploys && (
          <div className="space-y-2">
            <Typography variant="label" className="text-neutral-400 text-[11px] uppercase tracking-wider font-mono">
              Dự án liên kết
            </Typography>
            <div className="divide-y divide-[var(--border)] border border-[var(--border)] bg-neutral-950/60 p-3">
              {linkedDeployments.items.map((deploy) => {
                const isSuspended = deploy.state === 'suspended';
                const isActionLoading = actionLoadingId === deploy.linkId;

                return (
                  <div
                    key={deploy.linkId}
                    className="py-2.5 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-3 group px-1"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-1.5 py-0.5 text-[10px] font-mono bg-neutral-900 text-[#52a8ff] border border-neutral-800 uppercase font-bold">
                          {deploy.provider}
                        </span>
                        <span className="font-medium text-white text-sm font-mono">{deploy.projectName}</span>
                        <span className="text-xs text-neutral-500 font-mono">({deploy.environment})</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono border ${deploy.state === 'ready'
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                            : isSuspended
                              ? 'bg-amber-950/40 text-amber-400 border-amber-500/30'
                              : deploy.state === 'building'
                                ? 'bg-blue-950/40 text-[#52a8ff] border-blue-500/30'
                                : deploy.state === 'error'
                                  ? 'bg-red-950/40 text-red-400 border-red-500/30'
                                  : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                            }`}
                        >
                          {deploy.state === 'building' && !isSuspended && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#52a8ff] animate-ping inline-block" />
                          )}
                          <span>
                            {isSuspended
                              ? 'tạm ngưng'
                              : deploy.state === 'building'
                                ? 'building...'
                                : deploy.state}
                          </span>
                        </span>
                        <span>•</span>
                        <span>{timeAgo(deploy.createdAt)}</span>
                      </div>
                    </div>

                    {/* Actions on the right: gọn gàng với nút 3 chấm */}
                    <div className="flex items-center gap-2 shrink-0">
                      {deploy.url && (
                        <Link
                          href={deploy.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#52a8ff] hover:underline inline-flex items-center gap-1 font-mono px-2.5 py-1 rounded border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 transition-colors"
                        >
                          <span>Mở ứng dụng</span>
                          <IconRegistry name="external-link" size={11} />
                        </Link>
                      )}

                      {/* Nút 3 chấm mở Dialog menu tất cả chức năng */}
                      <button
                        type="button"
                        onClick={() => setActiveActionDeploy(deploy)}
                        title="Tùy chọn triển khai (...)"
                        className="p-1.5 rounded border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer inline-flex items-center justify-center font-mono"
                      >
                        {isActionLoading ? (
                          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
                        ) : (
                          <IconRegistry name="more-horizontal" size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {hasGithubDeploys && (
          <div className="space-y-2">
            {hasLinkedDeploys && (
              <Typography variant="label" className="text-neutral-400 text-[11px] uppercase tracking-wider font-mono">
                Lịch sử Deployments từ GitHub
              </Typography>
            )}
            <div className="divide-y divide-[var(--border)]">
              {githubDeployments.items.map((deploy) => {
                const state = deploy.latestStatus?.state || 'unknown';
                const isSuccess = state === 'success';
                const targetUrl = deploy.latestStatus?.environmentUrl || deploy.latestStatus?.logUrl;
                const fallbackUrl =
                  targetUrl ||
                  (deploy.environment?.toLowerCase().includes('node_system') || deploy.environment?.toLowerCase().includes('render')
                    ? `https://${deploy.environment.toLowerCase().replace(/[^a-z0-9-_]/g, '-')}.onrender.com`
                    : null);

                return (
                  <div
                    key={deploy.id}
                    className="py-3 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-3 group hover:bg-neutral-900/30 px-2 -mx-2 transition-colors"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono border ${isSuccess
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                            : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                            }`}
                        >
                          {state}
                        </span>
                        <span className="font-medium text-white text-sm font-mono">
                          {deploy.environment}
                        </span>
                        <span className="text-xs font-mono text-neutral-500">
                          ({deploy.ref})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <span>{deploy.description || 'GitHub Deployment'}</span>
                        <span>•</span>
                        <span>{timeAgo(deploy.createdAt)}</span>
                      </div>
                    </div>
                    {fallbackUrl && (
                      <Link
                        href={fallbackUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#52a8ff] hover:underline inline-flex items-center gap-1 shrink-0"
                      >
                        <span>Mở ứng dụng</span>
                        <IconRegistry name="external-link" size={12} />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!hasLinkedDeploys && !hasGithubDeploys && (
          /* Unlinked Empty State */
          <div className="py-8 px-4 text-center space-y-3">
            <div className="w-12 h-12 mx-auto bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500">
              <IconRegistry name="rocket" size={24} />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <Typography variant="body-sm" className="font-medium text-neutral-200">
                Chưa có liên kết triển khai
              </Typography>
              <Typography variant="caption" color="muted">
                Repo này chưa được liên kết với nền tảng triển khai (Vercel, Render, Cloudflare Pages) hoặc chưa có GitHub Deployment nào.
              </Typography>
            </div>
            <div className="pt-2">
              <Button variant="secondary" size="sm" onClick={handleLinkClick} className="text-xs">
                Liên kết triển khai ngay
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Action Dialog Modal (3 chấm) */}
      {activeActionDeploy && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setActiveActionDeploy(null)}
        >
          <div
            className="bg-[#0a0a0a] border border-neutral-800 max-w-lg w-full shadow-2xl overflow-hidden p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-neutral-900 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 text-[10px] font-mono bg-neutral-900 text-[#52a8ff] border border-neutral-800 uppercase font-bold">
                    {activeActionDeploy.provider}
                  </span>
                  <Typography variant="body" className="font-semibold text-white font-mono">
                    {activeActionDeploy.projectName}
                  </Typography>
                  <span className="text-xs text-neutral-500 font-mono">
                    ({activeActionDeploy.environment})
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.2 text-[10px] font-mono border ${activeActionDeploy.state === 'ready'
                      ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                      : activeActionDeploy.state === 'suspended'
                        ? 'bg-amber-950/40 text-amber-400 border-amber-500/30'
                        : activeActionDeploy.state === 'error'
                          ? 'bg-red-950/40 text-red-400 border-red-500/30'
                          : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                      }`}
                  >
                    {activeActionDeploy.state === 'suspended' ? 'tạm ngưng' : activeActionDeploy.state}
                  </span>
                  <span>•</span>
                  <span>Khởi tạo: {timeAgo(activeActionDeploy.createdAt)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveActionDeploy(null)}
                className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <IconRegistry name="close" size={14} />
              </button>
            </div>

            {/* List of Actions */}
            <div className="space-y-2">
              {/* 1. Deploy commit mới nhất */}
              <div className="p-3 rounded border border-neutral-800/80 bg-neutral-950/80 hover:border-neutral-700 transition-colors flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded bg-[#52a8ff]/10 border border-[#52a8ff]/30 flex items-center justify-center text-[#52a8ff] shrink-0">
                    <IconRegistry name="rocket" size={15} />
                  </div>
                  <div className="min-w-0">
                    <Typography variant="body-sm" className="font-medium text-white font-mono">
                      Deploy commit mới nhất
                    </Typography>
                    <Typography variant="caption" className="text-neutral-400 text-[11px] block truncate">
                      Kích hoạt bản dựng từ mã nguồn mới nhất trên GitHub
                    </Typography>
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={actionLoadingId === activeActionDeploy.linkId}
                  isLoading={actionLoadingId === activeActionDeploy.linkId}
                  onClick={() => handleTriggerDeploy(activeActionDeploy)}
                  className="text-xs shrink-0 font-mono"
                >
                  Deploy ngay
                </Button>
              </div>

              {/* 2. Khởi động lại (Restart Service) */}
              <div className="p-3 rounded border border-neutral-800/80 bg-neutral-950/80 hover:border-neutral-700 transition-colors flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <IconRegistry name="refresh" size={15} />
                  </div>
                  <div className="min-w-0">
                    <Typography variant="body-sm" className="font-medium text-white font-mono">
                      Khởi động lại (Restart Service)
                    </Typography>
                    <Typography variant="caption" className="text-neutral-400 text-[11px] block truncate">
                      Reboot web service / container trên {activeActionDeploy.provider.toUpperCase()}
                    </Typography>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={actionLoadingId === activeActionDeploy.linkId}
                  isLoading={actionLoadingId === activeActionDeploy.linkId}
                  onClick={() => handleRestartService(activeActionDeploy)}
                  className="text-xs shrink-0 font-mono"
                >
                  Restart
                </Button>
              </div>

              {/* 3. Xem logs & Tiến trình */}
              <div className="p-3 rounded border border-neutral-800/80 bg-neutral-950/80 hover:border-neutral-700 transition-colors flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[#52a8ff] shrink-0">
                    <IconRegistry name="logs" size={15} />
                  </div>
                  <div className="min-w-0">
                    <Typography variant="body-sm" className="font-medium text-white font-mono">
                      Xem logs & Tiến trình
                    </Typography>
                    <Typography variant="caption" className="text-neutral-400 text-[11px] block truncate">
                      Mở cửa sổ terminal trực tiếp theo dõi console logs & deploys
                    </Typography>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const target = activeActionDeploy;
                    setActiveActionDeploy(null);
                    setViewingLogsDeploy(target);
                  }}
                  className="text-xs shrink-0 font-mono"
                >
                  Xem logs
                </Button>
              </div>

              {/* 4. Mở ứng dụng (nếu có URL) */}
              {activeActionDeploy.url && (
                <div className="p-3 rounded border border-neutral-800/80 bg-neutral-950/80 hover:border-neutral-700 transition-colors flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[#52a8ff] shrink-0">
                      <IconRegistry name="external-link" size={15} />
                    </div>
                    <div className="min-w-0">
                      <Typography variant="body-sm" className="font-medium text-white font-mono">
                        Mở ứng dụng
                      </Typography>
                      <Typography variant="caption" className="text-neutral-400 text-[11px] block truncate">
                        {activeActionDeploy.url}
                      </Typography>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      if (activeActionDeploy.url) {
                        window.open(activeActionDeploy.url, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    className="text-xs shrink-0 font-mono text-[#52a8ff]"
                  >
                    Truy cập
                  </Button>
                </div>
              )}

              {/* 5. Tạm ngưng / Tiếp tục */}
              <div className="p-3 rounded border border-neutral-800/80 bg-neutral-950/80 hover:border-neutral-700 transition-colors flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded border flex items-center justify-center shrink-0 ${activeActionDeploy.state === 'suspended'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      }`}
                  >
                    <IconRegistry
                      name={activeActionDeploy.state === 'suspended' ? 'play' : 'pause'}
                      size={15}
                    />
                  </div>
                  <div className="min-w-0">
                    <Typography variant="body-sm" className="font-medium text-white font-mono">
                      {activeActionDeploy.state === 'suspended'
                        ? 'Tiếp tục dịch vụ'
                        : 'Tạm ngưng dịch vụ'}
                    </Typography>
                    <Typography variant="caption" className="text-neutral-400 text-[11px] block truncate">
                      {activeActionDeploy.state === 'suspended'
                        ? 'Kích hoạt lại dịch vụ đang tạm dừng'
                        : 'Tạm dừng dịch vụ để tiết kiệm tài nguyên'}
                    </Typography>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={actionLoadingId === activeActionDeploy.linkId}
                  onClick={() => {
                    handleToggleSuspend(activeActionDeploy);
                    setActiveActionDeploy(null);
                  }}
                  className="text-xs shrink-0 font-mono"
                >
                  {activeActionDeploy.state === 'suspended' ? 'Tiếp tục' : 'Tạm ngưng'}
                </Button>
              </div>

              {/* 6. Xóa liên kết */}
              <div className="p-3 rounded border border-red-950/30 bg-red-950/10 hover:border-red-900/40 transition-colors flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded bg-red-950/30 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                    <IconRegistry name="trash" size={15} />
                  </div>
                  <div className="min-w-0">
                    <Typography variant="body-sm" className="font-medium text-red-400 font-mono">
                      Xóa liên kết triển khai
                    </Typography>
                    <Typography variant="caption" className="text-neutral-400 text-[11px] block truncate">
                      Gỡ bỏ cấu hình và xóa project trên nền tảng đám mây
                    </Typography>
                  </div>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    const target = activeActionDeploy;
                    setActiveActionDeploy(null);
                    setUnlinkTarget(target);
                  }}
                  className="text-xs shrink-0 font-mono"
                >
                  Xóa liên kết
                </Button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end pt-2 border-t border-neutral-900">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setActiveActionDeploy(null)}
                className="text-xs font-mono"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Unlink Confirmation Modal */}
      {unlinkTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => !isUnlinking && setUnlinkTarget(null)}
        >
          <div
            className="bg-[#0a0a0a] border border-neutral-800 max-w-md w-full shadow-2xl overflow-hidden p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded bg-red-950/40 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
                <IconRegistry name="alert-triangle" size={18} />
              </div>
              <div className="space-y-2">
                <Typography variant="body" className="font-semibold text-white">
                  Xác nhận xóa liên kết triển khai
                </Typography>
                <Typography variant="caption" className="text-neutral-400">
                  Bạn có chắc muốn xóa liên kết triển khai dự án{' '}
                  <strong className="text-white font-mono">{unlinkTarget.projectName}</strong> (
                  {unlinkTarget.provider.toUpperCase()})?
                </Typography>
                <div className="text-[11px] text-neutral-400 bg-neutral-900/80 p-2.5 rounded border border-neutral-800 space-y-1 leading-relaxed">
                  <p className="text-emerald-400 font-medium flex items-center gap-1.5">
                    <span>✓</span>
                    <span>Dự án & toàn bộ mã nguồn trên GitHub được giữ nguyên 100% (không bị xóa).</span>
                  </p>
                  <p className="text-neutral-400">
                    • Hệ thống chỉ xóa file cấu hình YAML trên GitHub và xóa project trên nền tảng {unlinkTarget.provider.toUpperCase()}.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-900">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setUnlinkTarget(null)}
                disabled={isUnlinking}
                className="text-xs"
              >
                Hủy bỏ
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmUnlink}
                isLoading={isUnlinking}
                className="text-xs"
              >
                Xác nhận xóa
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Deploy Setup Modal */}
      {repo && (
        <DeploySetupModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          repo={repo}
          onSuccess={() => {
            if (onRefresh) onRefresh();
          }}
        />
      )}

      {/* Deploy Logs & Timeline Modal */}
      {repo && viewingLogsDeploy && (
        <DeployLogsModal
          isOpen={Boolean(viewingLogsDeploy)}
          onClose={() => {
            setViewingLogsDeploy(null);
            if (onRefresh) onRefresh();
          }}
          repoId={repo.id}
          deployment={viewingLogsDeploy}
        />
      )}
    </div>
  );
};
