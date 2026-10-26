import React from 'react';
import Link from 'next/link';
import { Typography } from '@/components/common/Typography';
import { IconRegistry } from '@/components/common/IconRegistry';
import { RepoBlockState } from './RepoBlockState';
import type { ListBlock, CiRun, RunConclusion, RunStatus } from '@/app/api/github/repo-detail.types';

export interface RepoCiRunsBlockProps {
  ciRuns: ListBlock<CiRun>;
  onRetry?: () => void;
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

function renderStatusBadge(status: RunStatus, conclusion: RunConclusion | null) {
  if (status === 'in_progress' || status === 'queued' || status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono bg-amber-950/40 text-amber-400 border border-amber-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        Đang chạy
      </span>
    );
  }

  if (conclusion === 'success') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
        <IconRegistry name="check" size={11} />
        Thành công
      </span>
    );
  }

  if (conclusion === 'failure') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono bg-red-950/40 text-red-400 border border-red-500/30">
        <IconRegistry name="close" size={11} />
        Thất bại
      </span>
    );
  }

  if (conclusion === 'cancelled') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono bg-neutral-900 text-neutral-400 border border-neutral-700">
        Hủy bỏ
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono bg-neutral-900 text-neutral-400 border border-neutral-800">
      {conclusion || status}
    </span>
  );
}

export const RepoCiRunsBlock: React.FC<RepoCiRunsBlockProps> = ({ ciRuns, onRetry }) => {
  return (
    <div className="bg-[#0a0a0a] border border-[var(--border)] overflow-hidden">
      {/* Block Header */}
      <div className="px-5 py-3.5 border-b border-[var(--border)] flex items-center justify-between bg-black/40">
        <div className="flex items-center gap-2.5">
          <IconRegistry name="cpu" size={16} className="text-[#52a8ff]" />
          <Typography variant="body-sm" className="font-semibold text-white tracking-wide">
            CI / Actions gần nhất
          </Typography>
          {ciRuns.status === 'ok' && ciRuns.items.length > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-mono bg-[#141414] text-neutral-400 border border-neutral-800">
              {ciRuns.items.length}
            </span>
          )}
        </div>
        {ciRuns.cached && (
          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
            Cached
          </span>
        )}
      </div>

      {/* Block Body */}
      <div className="p-4">
        <RepoBlockState
          status={ciRuns.status}
          error={ciRuns.error}
          emptyMessage="Repo chưa cấu hình GitHub Actions hoặc chưa có workflow run nào."
          onRetry={onRetry}
        >
          <div className="divide-y divide-[var(--border)]">
            {ciRuns.items.map((run) => {
              const shortSha = run.headSha ? run.headSha.slice(0, 7) : '';

              return (
                <div
                  key={run.id}
                  className="py-3.5 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-3 group hover:bg-neutral-900/30 px-2 -mx-2 transition-colors"
                >
                  {/* Left info */}
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {renderStatusBadge(run.status, run.conclusion)}
                      <Link
                        href={run.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-white hover:text-[#52a8ff] transition-colors truncate text-sm"
                      >
                        {run.workflowName}
                      </Link>
                      <span className="text-xs font-mono text-neutral-500">#{run.runNumber}</span>
                    </div>

                    <div className="flex items-center gap-2.5 text-xs text-neutral-400 flex-wrap">
                      {run.branch && (
                        <span className="font-mono text-neutral-300 bg-neutral-900 px-1.5 py-0.5 border border-neutral-800">
                          {run.branch}
                        </span>
                      )}
                      {shortSha && (
                        <span className="font-mono text-neutral-500">{shortSha}</span>
                      )}
                      {run.headCommitHeadline && (
                        <span className="text-neutral-400 truncate max-w-xs md:max-w-md">
                          {run.headCommitHeadline}
                        </span>
                      )}
                      <span>•</span>
                      <span>{timeAgo(run.startedAt)}</span>
                      {run.actor && (
                        <>
                          <span>•</span>
                          <span className="text-neutral-400">bởi {run.actor.login}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right: Quick action */}
                  <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={run.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition-colors"
                    >
                      <span>Xem log</span>
                      <IconRegistry name="external-link" size={12} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </RepoBlockState>
      </div>
    </div>
  );
};
