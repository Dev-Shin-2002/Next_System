'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getGithubRepoDetail } from '@/app/api/github/repos';
import type { RepoDetailData } from '@/app/api/github/repo-detail.types';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { IconRegistry } from '@/components/common/IconRegistry';
import {
  RepoDetailHeader,
  RepoMetricsCards,
  RepoCommitsBlock,
  RepoCiRunsBlock,
  RepoOpenPullsBlock,
  RepoDeploymentBlock,
} from '@/features/github/detail';

export default function RepoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const repoId = Number(params?.id);

  const [data, setData] = useState<RepoDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(
    async (refresh = false) => {
      if (!repoId || isNaN(repoId)) {
        setError('ID repository không hợp lệ.');
        setIsLoading(false);
        return;
      }

      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const result = await getGithubRepoDetail(repoId, refresh);
        setData(result);
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : 'Không thể tải thông tin chi tiết repository. Vui lòng thử lại.';
        setError(message);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [repoId]
  );

  useEffect(() => {
    let ignore = false;

    if (!repoId || isNaN(repoId)) {
      return;
    }

    getGithubRepoDetail(repoId, false)
      .then((res) => {
        if (!ignore) {
          setData(res);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const message =
            err instanceof Error
              ? err.message
              : 'Không thể tải thông tin chi tiết repository. Vui lòng thử lại.';
          setError(message);
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [repoId]);

  /* Loading State */
  if (isLoading && !data) {
    return (
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto animate-pulse">
        {/* Breadcrumb Skeleton */}
        <div className="h-4 w-48 bg-neutral-900 border border-neutral-800" />

        {/* Header Skeleton */}
        <div className="p-6 bg-[#0a0a0a] border border-[var(--border)] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-900" />
            <div className="space-y-2 flex-1">
              <div className="h-6 w-1/3 bg-neutral-900" />
              <div className="h-4 w-1/4 bg-neutral-900" />
            </div>
          </div>
        </div>

        {/* Metrics Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-[#0a0a0a] border border-[var(--border)]" />
          ))}
        </div>

        {/* Blocks Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-[#0a0a0a] border border-[var(--border)]" />
          <div className="h-72 bg-[#0a0a0a] border border-[var(--border)]" />
        </div>
      </div>
    );
  }

  /* Error State */
  if (error && !data) {
    return (
      <div className="p-6 md:p-8 space-y-6 max-w-2xl mx-auto">
        <div className="p-6 bg-[#0a0a0a] border border-red-500/30 space-y-4">
          <div className="flex items-center gap-3 text-red-400">
            <IconRegistry name="alert-triangle" size={20} />
            <Typography variant="body" className="font-semibold text-white">
              Đã xảy ra lỗi
            </Typography>
          </div>
          <Typography variant="body-sm" color="muted">
            {error}
          </Typography>
          <div className="flex items-center gap-3 pt-2">
            <Button variant="primary" size="sm" onClick={() => fetchOverview(true)}>
              Thử lại
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push('/admin/github')}
            >
              Quay lại danh sách
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
        <Link
          href="/admin/github"
          className="hover:text-[#52a8ff] transition-colors flex items-center gap-1"
        >
          <span>Dự án GitHub</span>
        </Link>
        <span>/</span>
        <span className="text-neutral-300 truncate max-w-xs">{data.repo.name}</span>
      </div>

      {/* 1. Header Block */}
      <RepoDetailHeader
        repo={data.repo}
        isRefreshing={isRefreshing}
        onRefresh={() => fetchOverview(true)}
      />

      {/* 2. Metrics 4 Cards */}
      <RepoMetricsCards data={data} />

      {/* 3. Main Data Blocks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Commits Block */}
        <RepoCommitsBlock
          commits={data.commits}
          onRetry={() => fetchOverview(true)}
        />

        {/* CI Runs Block */}
        <RepoCiRunsBlock
          ciRuns={data.ciRuns}
          onRetry={() => fetchOverview(true)}
        />
      </div>

      {/* 4. Pull Requests Block */}
      <RepoOpenPullsBlock
        openPulls={data.openPulls}
        onRetry={() => fetchOverview(true)}
      />

      {/* 5. Deployments Block */}
      <RepoDeploymentBlock
        repo={data.repo}
        linkedDeployments={data.linkedDeployments}
        githubDeployments={data.githubDeployments}
        onRetry={() => fetchOverview(true)}
        onRefresh={() => fetchOverview(true)}
      />
    </div>
  );
}
