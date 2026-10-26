'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  GithubHeader,
  GithubFilters,
  GithubRepoCard,
  GithubPagination,
  GithubNotConnected,
  GithubSkeletonGrid,
} from '@/features/github';
import { Button } from '@/components/common/Button';
import { IconRegistry } from '@/components/common/IconRegistry';
import {
  getGithubRepos,
  type GithubRepo,
  type GithubRateLimit,
} from '@/app/api/github/repos';
import { useGithubAuth } from '@/app/api/github/useGithubAuth';
import { ApiClientError } from '@/lib/api';

export default function AdminGithubPage() {
  const { login: handleGithubLogin } = useGithubAuth();

  // Query Parameters State
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(30);
  const [sort, setSort] = useState<'updated' | 'pushed' | 'created' | 'full_name'>('updated');
  const [direction, setDirection] = useState<'desc' | 'asc'>('desc');
  const [visibility, setVisibility] = useState<'all' | 'public' | 'private'>('all');
  const [affiliation, setAffiliation] = useState<string>(
    'owner,collaborator,organization_member'
  );

  // Client-side quick search query
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Data & Status State
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [rateLimit, setRateLimit] = useState<GithubRateLimit | null>(null);
  const [isCached, setIsCached] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notConnected, setNotConnected] = useState<boolean>(false);

  useEffect(() => {
    let ignore = false;

    getGithubRepos({
      page,
      per_page: perPage,
      sort,
      direction,
      visibility,
      affiliation,
    })
      .then((result) => {
        if (!ignore) {
          setRepos(result.repos || []);
          setIsCached(result.cached ?? false);
          if (result.rateLimit) {
            setRateLimit(result.rateLimit);
          }
          setNotConnected(false);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          if (err instanceof ApiClientError) {
            if (err.code === 'GITHUB_NOT_CONNECTED' || err.statusCode === 400) {
              setNotConnected(true);
            }
            setError(err.message);
          } else {
            setError(err instanceof Error ? err.message : 'Lỗi khi tải danh sách dự án');
          }
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [page, perPage, sort, direction, visibility, affiliation]);

  const handleForceRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const result = await getGithubRepos({
        page,
        per_page: perPage,
        sort,
        direction,
        visibility,
        affiliation,
        refresh: true,
      });
      setRepos(result.repos || []);
      setIsCached(result.cached ?? false);
      if (result.rateLimit) {
        setRateLimit(result.rateLimit);
      }
      setNotConnected(false);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        if (err.code === 'GITHUB_NOT_CONNECTED' || err.statusCode === 400) {
          setNotConnected(true);
        }
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Lỗi khi đồng bộ dự án');
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  // Client search filter
  const filteredRepos = useMemo(() => {
    if (!searchQuery.trim()) return repos;
    const q = searchQuery.toLowerCase().trim();
    return repos.filter(
      (repo) =>
        repo.name.toLowerCase().includes(q) ||
        repo.fullName.toLowerCase().includes(q) ||
        (repo.description && repo.description.toLowerCase().includes(q)) ||
        (repo.language && repo.language.toLowerCase().includes(q)) ||
        repo.owner.login.toLowerCase().includes(q)
    );
  }, [repos, searchQuery]);

  const resetFilters = () => {
    setPage(1);
    setPerPage(30);
    setSort('updated');
    setDirection('desc');
    setVisibility('all');
    setAffiliation('owner,collaborator,organization_member');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6 relative z-10 pb-16">
      {/* Header with Telemetry & Force Refresh */}
      <GithubHeader
        isCached={isCached}
        rateLimit={rateLimit}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        onRefresh={handleForceRefresh}
      />

      {/* Not Connected State */}
      {notConnected && <GithubNotConnected onConnect={() => handleGithubLogin()} />}

      {/* Query Parameters Filter Toolbar */}
      <GithubFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        visibility={visibility}
        onVisibilityChange={(v) => {
          setVisibility(v);
          setPage(1);
        }}
        sort={sort}
        onSortChange={(s) => {
          setSort(s);
          setPage(1);
        }}
        direction={direction}
        onDirectionChange={(d) => {
          setDirection(d);
          setPage(1);
        }}
        perPage={perPage}
        onPerPageChange={(p) => {
          setPerPage(p);
          setPage(1);
        }}
        affiliation={affiliation}
        onAffiliationChange={(a) => {
          setAffiliation(a);
          setPage(1);
        }}
        onReset={resetFilters}
        totalFiltered={filteredRepos.length}
        totalLoaded={repos.length}
      />

      {/* Error Message */}
      {error && !notConnected && (
        <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-200 text-xs font-mono">
          Lỗi: {error}
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && <GithubSkeletonGrid count={6} />}

      {/* Empty State */}
      {!isLoading && filteredRepos.length === 0 && (
        <div className="p-12 text-center bg-[#0a0a0a] border border-[var(--border)] space-y-3">
          <div className="inline-flex p-3 bg-white/5 text-[#999999]">
            <IconRegistry name="github" size={32} />
          </div>
          <h3 className="text-base font-medium text-white">Không tìm thấy dự án nào</h3>
          <p className="text-xs text-[#999999] max-w-sm mx-auto">
            Không có repository nào khớp với bộ lọc hiện tại của bạn. Thử thay đổi từ khóa tìm kiếm hoặc đặt lại bộ lọc.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={resetFilters}
            className="text-xs mx-auto"
          >
            Đặt lại bộ lọc
          </Button>
        </div>
      )}

      {/* Repositories Cards Grid */}
      {!isLoading && filteredRepos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRepos.map((repo) => (
            <GithubRepoCard key={repo.id} repo={repo} />
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      {!isLoading && repos.length > 0 && (
        <GithubPagination
          page={page}
          perPage={perPage}
          totalLoaded={repos.length}
          isLoading={isLoading}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
