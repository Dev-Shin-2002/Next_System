import React, { useState } from 'react';
import Link from 'next/link';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { IconRegistry } from '@/components/common/IconRegistry';
import { DeploySetupModal } from './DeploySetupModal';
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

      {/* Block Body */}
      <div className="p-4">
        {hasLinkedDeploys ? (
          <div className="divide-y divide-[var(--border)]">
            {linkedDeployments.items.map((deploy) => (
              <div
                key={deploy.linkId}
                className="py-3 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-3 group hover:bg-neutral-900/30 px-2 -mx-2 transition-colors"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-1.5 py-0.5 text-[10px] font-mono bg-neutral-900 text-neutral-300 border border-neutral-800 uppercase">
                      {deploy.provider}
                    </span>
                    <span className="font-medium text-white text-sm">{deploy.projectName}</span>
                    <span className="text-xs text-neutral-500 font-mono">({deploy.environment})</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <span className="font-mono">{deploy.state}</span>
                    <span>•</span>
                    <span>{timeAgo(deploy.createdAt)}</span>
                  </div>
                </div>
                {deploy.url && (
                  <Link
                    href={deploy.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#52a8ff] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Mở ứng dụng</span>
                    <IconRegistry name="external-link" size={12} />
                  </Link>
                )}
              </div>
            ))}
          </div>
        ) : hasGithubDeploys ? (
          <div className="divide-y divide-[var(--border)]">
            {githubDeployments.items.map((deploy) => {
              const state = deploy.latestStatus?.state || 'unknown';
              const isSuccess = state === 'success';
              const targetUrl = deploy.latestStatus?.environmentUrl || deploy.latestStatus?.logUrl;

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
                  {targetUrl && (
                    <Link
                      href={targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#52a8ff] hover:underline inline-flex items-center gap-1 shrink-0"
                    >
                      <span>Mở môi trường</span>
                      <IconRegistry name="external-link" size={12} />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
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
    </div>
  );
};
