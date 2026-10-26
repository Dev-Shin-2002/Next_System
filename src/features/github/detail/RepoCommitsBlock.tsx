import React from 'react';
import Link from 'next/link';
import { Typography } from '@/components/common/Typography';
import { IconRegistry } from '@/components/common/IconRegistry';
import { RepoBlockState } from './RepoBlockState';
import type { ListBlock, Commit } from '@/app/api/github/repo-detail.types';

export interface RepoCommitsBlockProps {
  commits: ListBlock<Commit>;
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

export const RepoCommitsBlock: React.FC<RepoCommitsBlockProps> = ({ commits, onRetry }) => {
  return (
    <div className="bg-[#0a0a0a] border border-[var(--border)] overflow-hidden">
      {/* Block Header */}
      <div className="px-5 py-3.5 border-b border-[var(--border)] flex items-center justify-between bg-black/40">
        <div className="flex items-center gap-2.5">
          <IconRegistry name="code" size={16} className="text-[#52a8ff]" />
          <Typography variant="body-sm" className="font-semibold text-white tracking-wide">
            Commit gần đây
          </Typography>
          {commits.status === 'ok' && commits.items.length > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-mono bg-[#141414] text-neutral-400 border border-neutral-800">
              {commits.items.length}
            </span>
          )}
        </div>
        {commits.cached && (
          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
            Cached
          </span>
        )}
      </div>

      {/* Block Body */}
      <div className="p-4">
        <RepoBlockState
          status={commits.status}
          error={commits.error}
          emptyMessage="Chưa có commit nào trên nhánh mặc định."
          onRetry={onRetry}
        >
          <div className="divide-y divide-[var(--border)]">
            {commits.items.map((commit) => {
              const shortSha = commit.sha.slice(0, 7);
              const authorName = commit.author.name || commit.author.login || 'Unknown author';

              return (
                <div
                  key={commit.sha}
                  className="py-3 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-3 group hover:bg-neutral-900/30 px-2 -mx-2 transition-colors"
                >
                  {/* Left: Message & Meta */}
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={commit.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-[#52a8ff] hover:underline font-semibold shrink-0"
                        title={commit.sha}
                      >
                        {shortSha}
                      </Link>
                      <Typography
                        variant="body-sm"
                        className="text-neutral-200 truncate font-medium group-hover:text-white"
                        title={commit.messageHeadline}
                      >
                        {commit.messageHeadline}
                      </Typography>
                      {commit.verified && (
                        <span className="px-1.5 py-0.2 text-[9px] font-mono bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 shrink-0">
                          Verified
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 text-xs text-neutral-500">
                      {commit.author.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={commit.author.avatarUrl}
                          alt={authorName}
                          className="w-4 h-4 rounded-full border border-neutral-800"
                        />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-neutral-800 flex items-center justify-center text-[9px] text-neutral-400 font-mono">
                          {authorName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-neutral-400">{authorName}</span>
                      <span>•</span>
                      <span>{timeAgo(commit.authoredAt)}</span>
                    </div>
                  </div>

                  {/* Right: Quick Action Link */}
                  <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={commit.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition-colors"
                    >
                      <span>Xem</span>
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
