'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Typography } from '@/components/common/Typography';
import type { GithubRepo } from '@/app/api/github/repos';

export interface GithubRepoCardProps {
  repo: GithubRepo;
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  'C#': '#178600',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Java: '#b07219',
  Go: '#00ADD8',
  Rust: '#dea584',
  PHP: '#4F5D95',
  Ruby: '#701516',
  Shell: '#89e051',
  C: '#555555',
  'C++': '#f34b7d',
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 KB';
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)} MB`;
  }
  return `${bytes} KB`;
}

function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export const GithubRepoCard: React.FC<GithubRepoCardProps> = ({ repo }) => {
  const router = useRouter();
  const langColor = repo.language
    ? LANGUAGE_COLORS[repo.language] || '#999999'
    : undefined;

  const handleCardClick = (e: React.MouseEvent) => {
    // If clicked on an external link or button, do not navigate to detail
    const target = e.target as HTMLElement;
    if (target.closest('a[target="_blank"]')) {
      return;
    }
    router.push(`/admin/github/${repo.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="p-5 bg-[#0a0a0a] border border-[var(--border)] hover:border-[#52a8ff]/60 hover:bg-[#0d0d0d] transition-all flex flex-col justify-between group cursor-pointer relative"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          router.push(`/admin/github/${repo.id}`);
        }
      }}
    >
      <div className="space-y-3">
        {/* Top Owner / Visibility Row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Image
              src={repo.owner.avatarUrl}
              alt={repo.owner.login}
              width={20}
              height={20}
              unoptimized
              className="rounded-full border border-white/20 shrink-0"
            />
            <Typography variant="caption" color="muted" className="truncate">
              {repo.owner.login}
            </Typography>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {repo.isPrivate ? (
              <span className="px-2 py-0.5 text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20">
                Private
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[10px] font-mono bg-[#62c073]/10 text-[#62c073] border border-[#62c073]/20">
                Public
              </span>
            )}
            {repo.fork && (
              <span className="px-1.5 py-0.5 text-[10px] font-mono bg-white/5 text-[#999999] border border-white/10">
                Fork
              </span>
            )}
          </div>
        </div>

        {/* Repository Name & Detail Link */}
        <div className="flex items-center justify-between gap-2">
          <Link
            href={`/admin/github/${repo.id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-base font-semibold text-white group-hover:text-[#52a8ff] transition-colors inline-flex items-center gap-1.5 break-all"
          >
            <span>{repo.name}</span>
          </Link>
          <a
            href={repo.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title="Mở trực tiếp trên GitHub"
            className="text-xs text-neutral-500 hover:text-white transition-colors shrink-0 p-1 hover:bg-neutral-800 border border-transparent hover:border-neutral-700"
          >
            ↗
          </a>
        </div>

        {/* Description */}
        <Typography variant="body-sm" color="muted" className="line-clamp-2 min-h-[32px]">
          {repo.description || (
            <span className="italic text-[#666666]">Không có mô tả</span>
          )}
        </Typography>
      </div>

      {/* Bottom Metadata & Stats */}
      <div className="mt-4 pt-3 border-t border-[var(--border)] space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-[#999999]">
          {/* Language */}
          <div className="flex items-center gap-1.5">
            {repo.language ? (
              <>
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: langColor }}
                />
                <Typography variant="caption" color="primary">
                  {repo.language}
                </Typography>
              </>
            ) : (
              <Typography variant="caption" color="muted">
                Không rõ
              </Typography>
            )}
          </div>

          {/* Stats Icons */}
          <div className="flex items-center gap-3 text-[11px]">
            <span title="Stars" className="flex items-center gap-1 hover:text-white">
              ★ {repo.stargazersCount}
            </span>
            <span title="Forks" className="flex items-center gap-1 hover:text-white">
              ⑂ {repo.forksCount}
            </span>
            <span title="Dung lượng">
              {formatBytes(repo.size)}
            </span>
          </div>
        </div>

        {/* Branch & Update Timestamp */}
        <div className="flex items-center justify-between text-[10px] font-mono text-[#666666]">
          <span className="truncate max-w-[140px]">
            branch: <span className="text-[#999999]">{repo.defaultBranch}</span>
          </span>
          <span>Cập nhật: {formatDate(repo.updatedAt)}</span>
        </div>

        {/* Action Link Footer */}
        <div className="pt-2 flex items-center justify-between border-t border-neutral-900 text-xs font-mono">
          <span className="text-[10px] text-neutral-500">ID: {repo.id}</span>
          <span className="text-[#52a8ff] group-hover:translate-x-0.5 transition-transform font-medium inline-flex items-center gap-1">
            Chi tiết <span>→</span>
          </span>
        </div>
      </div>
    </div>
  );
};
