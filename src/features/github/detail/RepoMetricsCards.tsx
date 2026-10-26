import React from 'react';
import { Typography } from '@/components/common/Typography';
import type {
  CiRun,
  GithubDeployment,
  LinkedDeployment,
  ListBlock,
  PullRequest,
  Repo,
} from '@/app/api/github/repo-detail.types';

export interface RepoMetricsCardsProps {
  repo: Repo;
  ciRuns: ListBlock<CiRun>;
  openPulls: ListBlock<PullRequest>;
  githubDeployments: ListBlock<GithubDeployment>;
  linkedDeployments: ListBlock<LinkedDeployment>;
}

function timeAgo(dateString: string | null): string {
  if (!dateString) return 'Chưa có';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 30) {
    return date.toLocaleDateString('vi-VN');
  }
  if (diffDay > 0) return `${diffDay} ngày trước`;
  if (diffHour > 0) return `${diffHour} giờ trước`;
  if (diffMin > 0) return `${diffMin} phút trước`;
  return 'Vừa xong';
}

export const RepoMetricsCards: React.FC<RepoMetricsCardsProps> = ({
  repo,
  ciRuns,
  openPulls,
  githubDeployments,
  linkedDeployments,
}) => {
  // 1. CI Status
  const latestRun = ciRuns.items[0];
  let ciStatusText = 'Chưa cấu hình';
  let ciSubtext = 'Không có workflow runs';
  let ciDotColor = 'bg-[#666666]';

  if (latestRun) {
    if (latestRun.status === 'in_progress' || latestRun.status === 'queued') {
      ciStatusText = 'Đang chạy';
      ciSubtext = latestRun.workflowName;
      ciDotColor = 'bg-[#52a8ff] animate-pulse';
    } else if (latestRun.conclusion === 'success') {
      ciStatusText = 'Thành công';
      ciSubtext = latestRun.workflowName;
      ciDotColor = 'bg-[#62c073]';
    } else if (latestRun.conclusion === 'failure') {
      ciStatusText = 'Thất bại';
      ciSubtext = latestRun.workflowName;
      ciDotColor = 'bg-[#ef4444]';
    } else {
      ciStatusText = latestRun.conclusion || latestRun.status;
      ciSubtext = latestRun.workflowName;
      ciDotColor = 'bg-[#f59e0b]';
    }
  }

  // 2. Deploy Status
  const latestLinked = linkedDeployments.items[0];
  const latestGithub = githubDeployments.items[0];
  let deployStatusText = 'Chưa liên kết';
  let deploySubtext = 'Vercel, Render, Cloudflare';
  let deployDotColor = 'bg-[#666666]';

  if (latestLinked) {
    deployStatusText = latestLinked.state;
    deploySubtext = `${latestLinked.provider} (${latestLinked.environment})`;
    deployDotColor = latestLinked.state === 'ready' ? 'bg-[#62c073]' : 'bg-[#52a8ff]';
  } else if (latestGithub?.latestStatus) {
    deployStatusText = latestGithub.latestStatus.state;
    deploySubtext = `GitHub Deploy (${latestGithub.environment})`;
    deployDotColor =
      latestGithub.latestStatus.state === 'success' ? 'bg-[#62c073]' : 'bg-[#f59e0b]';
  }

  // 3. Open PRs
  const openPrCount = openPulls.totalCount ?? openPulls.items.length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* CI Card */}
      <div className="p-4 bg-[#0a0a0a] border border-[var(--border)] space-y-2">
        <div className="flex items-center justify-between">
          <Typography variant="caption" color="muted">
            CI MỚI NHẤT
          </Typography>
          <span className={`w-2 h-2 rounded-full ${ciDotColor}`} />
        </div>
        <div className="space-y-0.5">
          <Typography variant="h4" color="primary">
            {ciStatusText}
          </Typography>
          <Typography variant="caption" color="muted" className="truncate block">
            {ciSubtext}
          </Typography>
        </div>
      </div>

      {/* Deploy Card */}
      <div className="p-4 bg-[#0a0a0a] border border-[var(--border)] space-y-2">
        <div className="flex items-center justify-between">
          <Typography variant="caption" color="muted">
            DEPLOY MỚI NHẤT
          </Typography>
          <span className={`w-2 h-2 rounded-full ${deployDotColor}`} />
        </div>
        <div className="space-y-0.5">
          <Typography variant="h4" color="primary">
            {deployStatusText}
          </Typography>
          <Typography variant="caption" color="muted" className="truncate block">
            {deploySubtext}
          </Typography>
        </div>
      </div>

      {/* PR Card */}
      <div className="p-4 bg-[#0a0a0a] border border-[var(--border)] space-y-2">
        <div className="flex items-center justify-between">
          <Typography variant="caption" color="muted">
            PULL REQUESTS MỞ
          </Typography>
          <span className="w-2 h-2 rounded-full bg-[#52a8ff]" />
        </div>
        <div className="space-y-0.5">
          <Typography variant="h4" color="primary">
            {openPrCount} PR{openPrCount > 1 ? 's' : ''}
          </Typography>
          <Typography variant="caption" color="muted">
            {openPrCount > 0 ? 'Đang chờ review / duyệt' : 'Không có PR nào mở'}
          </Typography>
        </div>
      </div>

      {/* Last Push Card */}
      <div className="p-4 bg-[#0a0a0a] border border-[var(--border)] space-y-2">
        <div className="flex items-center justify-between">
          <Typography variant="caption" color="muted">
            LẦN ĐẨY CODE CUỐI
          </Typography>
          <span className="w-2 h-2 rounded-full bg-[#62c073]" />
        </div>
        <div className="space-y-0.5">
          <Typography variant="h4" color="primary">
            {timeAgo(repo.pushedAt)}
          </Typography>
          <Typography variant="caption" color="muted">
            Nhánh {repo.defaultBranch}
          </Typography>
        </div>
      </div>
    </div>
  );
};
