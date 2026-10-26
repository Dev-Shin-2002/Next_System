import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { IconRegistry } from '@/components/common/IconRegistry';
import type { Repo } from '@/app/api/github/repo-detail.types';

export interface RepoDetailHeaderProps {
  repo: Repo;
  isCached: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
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

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  owner: { label: 'Chủ sở hữu', color: 'border-white/30 text-white bg-white/10' },
  admin: { label: 'Quản trị viên', color: 'border-purple-500/30 text-purple-300 bg-purple-500/10' },
  collaborator: { label: 'Cộng tác viên', color: 'border-blue-500/30 text-blue-300 bg-blue-500/10' },
  read: { label: 'Chỉ đọc', color: 'border-gray-500/30 text-gray-400 bg-gray-500/10' },
};

function formatSize(kb: number): string {
  if (kb >= 1024) {
    return `${(kb / 1024).toFixed(1)} MB`;
  }
  return `${kb} KB`;
}

export const RepoDetailHeader: React.FC<RepoDetailHeaderProps> = ({
  repo,
  isCached,
  isLoading,
  isRefreshing,
  onRefresh,
}) => {
  const roleConfig = ROLE_LABELS[repo.role] || ROLE_LABELS.read;
  const langColor = repo.language ? LANGUAGE_COLORS[repo.language] || '#999999' : undefined;

  return (
    <div className="space-y-4 pb-6 border-b border-[var(--border)]">
      {/* Back Link Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link
          href="/admin/github"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[#999999] hover:text-white transition-colors"
        >
          <IconRegistry name="chevron-left" size={14} />
          <span>Dự án GitHub</span>
        </Link>
        <span className="text-xs font-mono text-[#666666]">/</span>
        <span className="text-xs font-mono text-white font-medium">{repo.name}</span>

        {isCached && (
          <span className="ml-2 v-chip !px-2 !py-0.2 text-[10px] text-[#62c073] border border-[#62c073]/30">
            ETag Cached
          </span>
        )}
      </div>

      {/* Main Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <Typography variant="h2" color="primary">
              {repo.name}
            </Typography>

            {/* Visibility Badge */}
            {repo.isPrivate ? (
              <span className="px-2 py-0.5 text-[11px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20">
                Private
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[11px] font-mono bg-[#62c073]/10 text-[#62c073] border border-[#62c073]/20">
                Public
              </span>
            )}

            {/* Role Badge */}
            <span
              className={`px-2 py-0.5 text-[11px] font-mono border ${roleConfig.color}`}
              title="Quyền thao tác của bạn đối với repository này"
            >
              {roleConfig.label}
            </span>

            {repo.archived && (
              <span className="px-2 py-0.5 text-[11px] font-mono bg-white/5 text-[#999999] border border-white/10">
                Archived
              </span>
            )}
          </div>

          {/* Sub Metadata Line */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#999999]">
            {/* Owner */}
            <div className="flex items-center gap-1.5">
              {repo.owner.avatarUrl && (
                <Image
                  src={repo.owner.avatarUrl}
                  alt={repo.owner.login}
                  width={16}
                  height={16}
                  unoptimized
                  className="rounded-full"
                />
              )}
              <span className="text-white">{repo.owner.login}</span>
            </div>

            <span className="text-[#666666]">•</span>

            {/* Branch */}
            <div className="flex items-center gap-1">
              <span className="text-[#666666]">branch:</span>
              <span className="text-white">{repo.defaultBranch}</span>
            </div>

            {/* Language */}
            {repo.language && (
              <>
                <span className="text-[#666666]">•</span>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: langColor }}
                  />
                  <span className="text-white">{repo.language}</span>
                </div>
              </>
            )}

            <span className="text-[#666666]">•</span>

            {/* Size */}
            <span>{formatSize(repo.sizeKb)}</span>

            {/* Homepage */}
            {repo.homepage && (
              <>
                <span className="text-[#666666]">•</span>
                <a
                  href={repo.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#52a8ff] hover:underline"
                >
                  {repo.homepage.replace(/^https?:\/\//, '')}
                </a>
              </>
            )}
          </div>

          {/* Description */}
          {repo.description && (
            <Typography variant="body-sm" color="subtext" className="max-w-3xl">
              {repo.description}
            </Typography>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading || isRefreshing}
            isLoading={isRefreshing}
            leftIcon={
              !isRefreshing ? (
                <svg
                  className="w-3.5 h-3.5 text-[#52a8ff]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              ) : undefined
            }
            title="Gọi GitHub API bỏ qua cache để lấy trạng thái mới nhất"
          >
            {isRefreshing ? 'Đang cập nhật...' : 'Làm mới'}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            href={repo.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            leftIcon={<IconRegistry name="github" size={14} />}
            rightIcon={<span>↗</span>}
          >
            Mở GitHub
          </Button>
        </div>
      </div>
    </div>
  );
};
