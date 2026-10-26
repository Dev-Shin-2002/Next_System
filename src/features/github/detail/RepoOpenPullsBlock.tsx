import React from 'react';
import Link from 'next/link';
import { Typography } from '@/components/common/Typography';
import { IconRegistry } from '@/components/common/IconRegistry';
import { RepoBlockState } from './RepoBlockState';
import type { ListBlock, PullRequest } from '@/app/api/github/repo-detail.types';

export interface RepoOpenPullsBlockProps {
  openPulls: ListBlock<PullRequest>;
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

export const RepoOpenPullsBlock: React.FC<RepoOpenPullsBlockProps> = ({ openPulls, onRetry }) => {
  return (
    <div className="bg-[#0a0a0a] border border-[var(--border)] overflow-hidden">
      {/* Block Header */}
      <div className="px-5 py-3.5 border-b border-[var(--border)] flex items-center justify-between bg-black/40">
        <div className="flex items-center gap-2.5">
          <IconRegistry name="git-pull-request" size={16} className="text-[#52a8ff]" />
          <Typography variant="body-sm" className="font-semibold text-white tracking-wide">
            Pull Requests đang mở
          </Typography>
          {openPulls.status === 'ok' && openPulls.items.length > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-mono bg-[#141414] text-neutral-400 border border-neutral-800">
              {openPulls.items.length}
            </span>
          )}
        </div>
        {openPulls.cached && (
          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
            Cached
          </span>
        )}
      </div>

      {/* Block Body */}
      <div className="p-4">
        <RepoBlockState
          status={openPulls.status}
          error={openPulls.error}
          emptyMessage="Không có Pull Request nào đang mở."
          onRetry={onRetry}
        >
          <div className="divide-y divide-[var(--border)]">
            {openPulls.items.map((pr) => {
              const authorLogin = pr.author?.login || 'ghost';

              return (
                <div
                  key={pr.number}
                  className="py-3.5 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-3 group hover:bg-neutral-900/30 px-2 -mx-2 transition-colors"
                >
                  {/* Left: PR info */}
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-[#52a8ff] font-semibold">
                        #{pr.number}
                      </span>
                      <Link
                        href={pr.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-white hover:text-[#52a8ff] transition-colors truncate text-sm"
                        title={pr.title}
                      >
                        {pr.title}
                      </Link>
                      {pr.draft && (
                        <span className="px-1.5 py-0.2 text-[9px] font-mono bg-neutral-900 text-neutral-400 border border-neutral-700">
                          Draft
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 text-xs text-neutral-400 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        {pr.author?.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={pr.author.avatarUrl}
                            alt={authorLogin}
                            className="w-4 h-4 rounded-full border border-neutral-800"
                          />
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-neutral-800 flex items-center justify-center text-[9px] text-neutral-400 font-mono">
                            {authorLogin.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="text-neutral-300 font-medium">{authorLogin}</span>
                      </div>
                      <span>•</span>
                      <span className="font-mono text-[11px] text-neutral-400 bg-neutral-900 px-1.5 py-0.5 border border-neutral-800">
                        {pr.headRef} → {pr.baseRef}
                      </span>
                      {pr.requestedReviewerCount > 0 && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-neutral-400">
                            <IconRegistry name="users" size={12} />
                            {pr.requestedReviewerCount} reviewer
                          </span>
                        </>
                      )}
                      <span>•</span>
                      <span>mở {timeAgo(pr.createdAt)}</span>
                    </div>
                  </div>

                  {/* Right: Quick action */}
                  <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={pr.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition-colors"
                    >
                      <span>Xem PR</span>
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
