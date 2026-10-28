/**
 * GitHub Repositories API Module
 * Kết nối tới Backend endpoint GET /api/v1/github/repos (hỗ trợ ETag Cache và Query Parameters)
 */

import { api } from '@/lib/api';
import type {
  RepoDetailData,
  SetupDeploymentRequest,
  SetupDeploymentResponse,
  RepoEnvExampleResponse,
  LinkedDeploymentState,
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

/**
 * Quét các biến môi trường từ file mẫu (.env.example, .env.sample, ...) trên GitHub repository
 */
export async function scanGithubRepoEnvExample(
  repoId: number
): Promise<RepoEnvExampleResponse> {
  return await api.get<RepoEnvExampleResponse>(
    `/api/v1/github/repos/${repoId}/env-example`
  );
}

/**
 * Xóa liên kết triển khai dự án khỏi repository
 */
export async function deleteGithubDeploymentLink(
  _repoId: number,
  linkId: string
): Promise<{ success: boolean; message: string }> {
  return await api.delete<{ success: boolean; message: string }>(
    `/api/v1/deployments/links/${linkId}`
  );
}

/**
 * Tạm ngưng hoặc kích hoạt lại liên kết triển khai dự án
 */
export async function toggleGithubDeploymentSuspend(
  _repoId: number,
  linkId: string,
  action?: 'suspend' | 'resume'
): Promise<{ success: boolean; state: LinkedDeploymentState; message: string }> {
  return await api.post<{ success: boolean; state: LinkedDeploymentState; message: string }>(
    `/api/v1/deployments/links/${linkId}/toggle-suspend`,
    { action }
  );
}

/**
 * Lấy tiến trình triển khai và logs thời gian thực từ Provider
 */
export async function fetchGithubDeploymentLogs(
  repoId: number,
  linkId: string
): Promise<import('./repo-detail.types').DeploymentLogsResponse> {
  return await api.get<import('./repo-detail.types').DeploymentLogsResponse>(
    `/api/v1/github/repos/${repoId}/deployments/links/${linkId}/logs`
  );
}

/**
 * Kích hoạt triển khai commit mới nhất trực tiếp qua Cloud Provider
 */
export async function triggerGithubDeploymentDeploy(
  repoId: number,
  linkId: string
): Promise<{ success: boolean; message: string; deployId?: string }> {
  return await api.post<{ success: boolean; message: string; deployId?: string }>(
    `/api/v1/github/repos/${repoId}/deployments/links/${linkId}/deploy`
  );
}

/**
 * Khởi động lại (Restart Service) container/web service qua Cloud Provider
 */
export async function restartGithubDeploymentService(
  repoId: number,
  linkId: string
): Promise<{ success: boolean; message: string }> {
  return await api.post<{ success: boolean; message: string }>(
    `/api/v1/github/repos/${repoId}/deployments/links/${linkId}/restart`
  );
}



