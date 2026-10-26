/**
 * TypeScript Type Definitions cho GitHub Repo Detail
 * Đồng bộ với chuẩn Backend Fastify Zod Schema (repo-detail.schema.ts)
 */

export type BlockStatus =
  | 'ok'
  | 'empty'
  | 'forbidden'
  | 'rate_limited'
  | 'not_linked'
  | 'error';

export interface BlockError {
  code: string;
  message: string;
}

export interface ListBlock<T> {
  status: BlockStatus;
  fetchedAt: string | null;
  cached: boolean;
  error: BlockError | null;
  items: T[];
  hasMore: boolean;
  totalCount: number | null;
}

export type RepoRole = 'owner' | 'admin' | 'collaborator' | 'read';

export interface GithubUser {
  login: string;
  avatarUrl: string | null;
}

export interface Repo {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  owner: {
    login: string;
    type: 'User' | 'Organization' | 'Bot';
    avatarUrl: string | null;
    htmlUrl: string;
  };
  htmlUrl: string;
  homepage: string | null;
  isPrivate: boolean;
  archived: boolean;
  defaultBranch: string;
  language: string | null;
  sizeKb: number;
  pushedAt: string | null;
  updatedAt: string;
  role: RepoRole;
  permissions: {
    admin: boolean;
    push: boolean;
    pull: boolean;
  };
}

export interface Commit {
  sha: string;
  messageHeadline: string;
  author: {
    name: string | null;
    login: string | null;
    avatarUrl: string | null;
  };
  authoredAt: string | null;
  verified: boolean | null;
  htmlUrl: string;
}

export type RunStatus =
  | 'queued'
  | 'in_progress'
  | 'completed'
  | 'waiting'
  | 'requested'
  | 'pending'
  | 'unknown';

export type RunConclusion =
  | 'success'
  | 'failure'
  | 'cancelled'
  | 'skipped'
  | 'timed_out'
  | 'neutral'
  | 'stale'
  | 'action_required'
  | 'unknown';

export interface CiRun {
  id: number;
  runNumber: number;
  runAttempt: number;
  workflowName: string;
  event: string;
  status: RunStatus;
  conclusion: RunConclusion | null;
  branch: string | null;
  headSha: string;
  headCommitHeadline: string | null;
  actor: GithubUser | null;
  pullRequestNumbers: number[];
  startedAt: string;
  updatedAt: string;
  htmlUrl: string;
}

export interface PullRequest {
  number: number;
  title: string;
  state: 'open' | 'closed';
  draft: boolean;
  author: GithubUser | null;
  headRef: string;
  baseRef: string;
  requestedReviewerCount: number;
  createdAt: string;
  updatedAt: string;
  mergedAt: string | null;
  htmlUrl: string;
}

export type DeploymentState =
  | 'queued'
  | 'pending'
  | 'in_progress'
  | 'success'
  | 'failure'
  | 'error'
  | 'inactive'
  | 'unknown';

export interface GithubDeployment {
  id: number;
  sha: string;
  ref: string;
  task: string;
  environment: string;
  description: string | null;
  isProduction: boolean | null;
  creator: GithubUser | null;
  createdAt: string;
  updatedAt: string;
  latestStatus: {
    state: DeploymentState;
    logUrl: string | null;
    environmentUrl: string | null;
    createdAt: string;
  } | null;
}

export type Provider = 'vercel' | 'render' | 'cloudflare_pages';

export type LinkedDeploymentState =
  | 'queued'
  | 'building'
  | 'ready'
  | 'error'
  | 'canceled'
  | 'unknown';

export interface LinkedDeployment {
  provider: Provider;
  linkId: string;
  externalId: string;
  projectName: string;
  environment: 'production' | 'preview' | 'other';
  state: LinkedDeploymentState;
  commitSha: string | null;
  branch: string | null;
  url: string | null;
  dashboardUrl: string | null;
  createdAt: string;
  finishedAt: string | null;
}

export interface RepoDetailData {
  repo: Repo;
  commits: ListBlock<Commit>;
  ciRuns: ListBlock<CiRun>;
  openPulls: ListBlock<PullRequest>;
  githubDeployments: ListBlock<GithubDeployment>;
  linkedDeployments: ListBlock<LinkedDeployment>;
}

export interface SetupDeploymentRequest {
  provider: 'vercel' | 'render' | 'cloudflare';
  mode: 'launch' | 'api';
  apiToken?: string;
  accountId?: string;
  saveToken?: boolean;
  createWorkflow?: boolean;
  projectName?: string;
}

export interface SetupDeploymentResponse {
  success: boolean;
  launchUrl?: string;
  linkedDeployment?: LinkedDeployment;
  workflowCreated?: boolean;
  message?: string;
}
