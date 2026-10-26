import React from 'react';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { IconRegistry } from '@/components/common/IconRegistry';
import type { BlockStatus, BlockError } from '@/app/api/github/repo-detail.types';

export interface RepoBlockStateProps {
  status: BlockStatus;
  error?: BlockError | null;
  emptyMessage?: string;
  onRetry?: () => void;
  children?: React.ReactNode;
}

export const RepoBlockState: React.FC<RepoBlockStateProps> = ({
  status,
  error,
  emptyMessage = 'Chưa có dữ liệu nào.',
  onRetry,
  children,
}) => {
  if (status === 'ok') {
    return <>{children}</>;
  }

  if (status === 'forbidden') {
    return (
      <div className="p-4 bg-[#141208] border border-amber-500/30 flex items-start gap-3">
        <div className="text-amber-400 mt-0.5 shrink-0">
          <IconRegistry name="alert-triangle" size={16} />
        </div>
        <div className="space-y-1">
          <Typography variant="body-sm" color="warning" className="font-medium">
            Không đủ quyền truy cập
          </Typography>
          <Typography variant="caption" color="muted">
            {error?.message ||
              'Bạn không có quyền xem thông tin khối này trên GitHub (hoặc tài nguyên đang ở chế độ riêng tư).'}
          </Typography>
        </div>
      </div>
    );
  }

  if (status === 'rate_limited') {
    return (
      <div className="p-4 bg-[#0a121d] border border-[#52a8ff]/30 flex items-start gap-3">
        <div className="text-[#52a8ff] mt-0.5 shrink-0">
          <IconRegistry name="metrics" size={16} />
        </div>
        <div className="space-y-1">
          <Typography variant="body-sm" color="accent" className="font-medium">
            Tạm dừng do hạn mức GitHub API
          </Typography>
          <Typography variant="caption" color="muted">
            {error?.message || 'Đã chạm hạn mức 5.000 req/h của GitHub. Vui lòng thử lại sau.'}
          </Typography>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="p-4 bg-red-950/20 border border-red-500/30 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="text-red-400 mt-0.5 shrink-0">
            <IconRegistry name="close" size={16} />
          </div>
          <div className="space-y-1">
            <Typography variant="body-sm" color="danger" className="font-medium">
              Không thể tải dữ liệu
            </Typography>
            <Typography variant="caption" color="muted">
              {error?.message || 'Đã xảy ra lỗi khi gọi GitHub API. Vui lòng thử lại sau.'}
            </Typography>
          </div>
        </div>
        {onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry} className="text-xs shrink-0">
            Thử lại
          </Button>
        )}
      </div>
    );
  }

  // status === 'empty'
  return (
    <div className="p-8 text-center bg-[#0a0a0a] border border-[var(--border)] space-y-2">
      <Typography variant="body-sm" color="muted" className="italic">
        {emptyMessage}
      </Typography>
    </div>
  );
};
