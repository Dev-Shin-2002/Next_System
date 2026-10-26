import React from 'react';
import { Button } from '@/components/common/Button';
import { Typography } from '@/components/common/Typography';
import { IconRegistry } from '@/components/common/IconRegistry';
import type { GithubRateLimit } from '@/app/api/github/repos';

export interface GithubHeaderProps {
  isCached: boolean;
  rateLimit: GithubRateLimit | null;
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const GithubHeader: React.FC<GithubHeaderProps> = ({
  isCached,
  rateLimit,
  isLoading,
  isRefreshing,
  onRefresh,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 pb-4 border-b border-[var(--border)]">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <Typography
            variant="status"
            color="accent"
            className="flex items-center gap-1.5"
          >
            <IconRegistry name="github" size={14} />
            GitHub Integration // Repositories
          </Typography>
          {isCached && (
            <span className="v-chip !px-2 !py-0.2 text-[10px] text-[#62c073] border border-[#62c073]/30">
              ETag Cached
            </span>
          )}
        </div>
        <Typography variant="h2" color="primary">
          Dự án GitHub
        </Typography>
        <Typography variant="body-sm" color="muted" className="mt-1 max-w-xl">
          Danh sách repositories từ tài khoản GitHub kết nối, hỗ trợ tự động lưu ETag Cache qua cơ sở dữ liệu.
        </Typography>
      </div>

      {/* Action & Rate Limit Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {rateLimit && (
          <div className="px-3 py-1.5 bg-[#0e0e0e] border border-[var(--border)] text-[11px] font-mono flex items-center gap-2">
            <Typography variant="caption" color="muted">
              API Quota:
            </Typography>
            <Typography variant="caption" color="primary" className="font-semibold">
              {rateLimit.remaining} / {rateLimit.limit}
            </Typography>
          </div>
        )}

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
          title="Gọi GitHub API bỏ qua bộ nhớ đệm ETag để cập nhật mới nhất"
        >
          {isRefreshing ? 'Đang đồng bộ...' : 'Làm mới (Force Refresh)'}
        </Button>
      </div>
    </div>
  );
};
