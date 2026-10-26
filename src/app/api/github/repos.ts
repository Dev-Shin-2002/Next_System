/**
 * GitHub Repositories API Module
 * Kết nối tới Backend endpoint GET /api/v1/github/repos (hỗ trợ ETag Cache và Query Parameters)
 */

import { api } from '@/lib/api';
import type {
  RepoDetailData,
  SetupDeploymentRequest,
  SetupDeploymentResponse,
} from './repo-detail.types';

export interface GithubRepoOwner {
  login: string;
  avatarUrl: string;
  type: string;
  htmlUrl: string;
}

export interface GithubRepoPermissions {
  admin: boolean;
  push: boolean;
  pull: boolean;
}

export interface GithubRepo {
  id: number;
  name: string;
  fullName: string;
  isPrivate: boolean;
  owner: GithubRepoOwner;
  htmlUrl: string;
  defaultBranch: string;
  fork: boolean;
  stargazersCount: number;
  forksCount: number;
  openIssuesCount: number;
  language: string | null;
  size: number;
  archived: boolean;
  updatedAt: string;
  pushedAt: string;
  createdAt: string;
  visibility: 'all' | 'public' | 'private' | string;
  description: string | null;
  permissions?: GithubRepoPermissions;
}

export interface GithubRateLimit {
  limit: number;
  remaining: number;
  reset: number;
}

export interface FetchGithubReposParams {
  page?: number;
  per_page?: number;
  sort?: 'created' | 'updated' | 'pushed' | 'full_name';
  direction?: 'asc' | 'desc';
  visibility?: 'all' | 'public' | 'private';
  affiliation?: string;
  refresh?: boolean;
}

export interface FetchGithubReposResult {
  repos: GithubRepo[];
  page: number;
  perPage: number;
  cached: boolean;
  rateLimit?: GithubRateLimit;
}

/**
 * Lấy danh sách repositories của tài khoản GitHub đã kết nối
 */
export async function getGithubRepos(
  params?: FetchGithubReposParams
): Promise<FetchGithubReposResult> {
  const queryParams: Record<string, string | number | boolean | undefined> = {};

  if (params?.page !== undefined) queryParams.page = params.page;
  if (params?.per_page !== undefined) queryParams.per_page = params.per_page;
  if (params?.sort) queryParams.sort = params.sort;
  if (params?.direction) queryParams.direction = params.direction;
  if (params?.visibility) queryParams.visibility = params.visibility;
  if (params?.affiliation) queryParams.affiliation = params.affiliation;
  if (params?.refresh) queryParams.refresh = 'true';

  return await api.get<FetchGithubReposResult>('/api/v1/github/repos', {
    params: queryParams,
  });
}

/**
 * Lấy thông tin tổng quan chi tiết của 1 repository theo ID
 */
export async function getGithubRepoDetail(
  id: number,
  refresh?: boolean
): Promise<RepoDetailData> {
  return await api.get<RepoDetailData>(`/api/v1/github/repos/${id}/overview`, {
    params: refresh ? { refresh: 'true' } : undefined,
  });
}

/**
 * Thiết lập triển khai dự án lên Vercel, Render hoặc Cloudflare
 */
export async function setupGithubRepoDeployment(
  repoId: number,
  payload: SetupDeploymentRequest
): Promise<SetupDeploymentResponse> {
  return await api.post<SetupDeploymentResponse>(
    `/api/v1/github/repos/${repoId}/deployments/setup`,
    payload
  );
}

