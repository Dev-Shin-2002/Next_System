import React from 'react';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Button } from '@/components/common/Button';
import { Typography } from '@/components/common/Typography';

export interface GithubFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  visibility: 'all' | 'public' | 'private';
  onVisibilityChange: (value: 'all' | 'public' | 'private') => void;
  sort: 'updated' | 'pushed' | 'created' | 'full_name';
  onSortChange: (value: 'updated' | 'pushed' | 'created' | 'full_name') => void;
  direction: 'desc' | 'asc';
  onDirectionChange: (value: 'desc' | 'asc') => void;
  perPage: number;
  onPerPageChange: (value: number) => void;
  affiliation: string;
  onAffiliationChange: (value: string) => void;
  onReset: () => void;
  totalFiltered: number;
  totalLoaded: number;
}

const VISIBILITY_OPTIONS = [
  { label: 'all (Tất cả)', value: 'all' },
  { label: 'public (Công khai)', value: 'public' },
  { label: 'private (Riêng tư)', value: 'private' },
];

const SORT_OPTIONS = [
  { label: 'updated (Mới cập nhật)', value: 'updated' },
  { label: 'pushed (Mới đẩy code)', value: 'pushed' },
  { label: 'created (Mới tạo)', value: 'created' },
  { label: 'full_name (Theo tên A-Z)', value: 'full_name' },
];

const DIRECTION_OPTIONS = [
  { label: 'desc (Giảm dần ↓)', value: 'desc' },
  { label: 'asc (Tăng dần ↑)', value: 'asc' },
];

const PER_PAGE_OPTIONS = [
  { label: '15 mục', value: 15 },
  { label: '30 mục', value: 30 },
  { label: '50 mục', value: 50 },
  { label: '100 mục', value: 100 },
];

const AFFILIATION_OPTIONS = [
  { label: 'Tất cả (Owner + Collab + Org)', value: 'owner,collaborator,organization_member' },
  { label: 'Chủ sở hữu (Owner)', value: 'owner' },
  { label: 'Cộng tác viên (Collaborator)', value: 'collaborator' },
  { label: 'Tổ chức (Organization)', value: 'organization_member' },
];

export const GithubFilters: React.FC<GithubFiltersProps> = ({
  searchQuery,
  onSearchChange,
  visibility,
  onVisibilityChange,
  sort,
  onSortChange,
  direction,
  onDirectionChange,
  perPage,
  onPerPageChange,
  affiliation,
  onAffiliationChange,
  onReset,
  totalFiltered,
  totalLoaded,
}) => {
  return (
    <div className="p-4 bg-[#0a0a0a] border border-[var(--border)] space-y-4">
      {/* Header of Query Parameters */}
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
        <div className="flex items-center gap-2">
          <Typography variant="status" color="primary">
            Bộ lọc & Tham số truy vấn (Query Parameters)
          </Typography>
          <Typography variant="caption" color="muted">
            ({totalFiltered} / {totalLoaded} repos)
          </Typography>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-xs font-mono !h-6 !px-2 text-[#999999] hover:text-white"
        >
          Đặt lại (Clear)
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Quick Search */}
        <div className="lg:col-span-2">
          <Typography variant="caption" as="label" color="muted" className="block mb-1">
            Tìm kiếm (Tên, mô tả, ngôn ngữ)
          </Typography>
          <Input
            size="sm"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Nhập tên dự án..."
          />
        </div>

        {/* Visibility */}
        <div>
          <Typography variant="caption" as="label" color="muted" className="block mb-1">
            Quyền hiển thị (visibility)
          </Typography>
          <Select
            size="sm"
            value={visibility}
            onChange={(e) => onVisibilityChange(e.target.value as 'all' | 'public' | 'private')}
            options={VISIBILITY_OPTIONS}
          />
        </div>

        {/* Sort */}
        <div>
          <Typography variant="caption" as="label" color="muted" className="block mb-1">
            Sắp xếp theo (sort)
          </Typography>
          <Select
            size="sm"
            value={sort}
            onChange={(e) =>
              onSortChange(e.target.value as 'updated' | 'pushed' | 'created' | 'full_name')
            }
            options={SORT_OPTIONS}
          />
        </div>

        {/* Direction */}
        <div>
          <Typography variant="caption" as="label" color="muted" className="block mb-1">
            Thứ tự (direction)
          </Typography>
          <Select
            size="sm"
            value={direction}
            onChange={(e) => onDirectionChange(e.target.value as 'desc' | 'asc')}
            options={DIRECTION_OPTIONS}
          />
        </div>

        {/* Per Page */}
        <div>
          <Typography variant="caption" as="label" color="muted" className="block mb-1">
            Số lượng / trang (per_page)
          </Typography>
          <Select
            size="sm"
            value={perPage}
            onChange={(e) => onPerPageChange(Number(e.target.value))}
            options={PER_PAGE_OPTIONS}
          />
        </div>
      </div>

      {/* Affiliation Sub-filter */}
      <div className="pt-2 border-t border-[var(--border)] flex flex-wrap items-center gap-3">
        <Typography variant="caption" color="muted">
          Phạm vi sở hữu (affiliation):
        </Typography>
        <div className="flex flex-wrap items-center gap-2">
          {AFFILIATION_OPTIONS.map((aff) => (
            <Button
              key={aff.value}
              type="button"
              variant={affiliation === aff.value ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => onAffiliationChange(aff.value)}
              className="!h-7 !px-2.5 !text-[11px] font-mono"
            >
              {aff.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
