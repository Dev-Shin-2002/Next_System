import React from 'react';
import { Button } from '@/components/common/Button';
import { Typography } from '@/components/common/Typography';

export interface GithubPaginationProps {
  page: number;
  perPage: number;
  totalLoaded: number;
  isLoading: boolean;
  onPageChange: (newPage: number) => void;
}

export const GithubPagination: React.FC<GithubPaginationProps> = ({
  page,
  perPage,
  totalLoaded,
  isLoading,
  onPageChange,
}) => {
  return (
    <div className="p-4 bg-[#0a0a0a] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <Typography variant="caption" color="muted">
        Trang <span className="text-white font-medium">{page}</span> • Hiển thị{' '}
        <span className="text-white font-medium">{totalLoaded}</span> kết quả ({perPage}/trang)
      </Typography>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1 || isLoading}
          className="text-xs"
        >
          ← Trang trước
        </Button>

        <span className="px-3 py-1 text-xs font-mono bg-[#141414] border border-[var(--border)] text-white">
          {page}
        </span>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={totalLoaded < perPage || isLoading}
          className="text-xs"
        >
          Trang sau →
        </Button>
      </div>
    </div>
  );
};
