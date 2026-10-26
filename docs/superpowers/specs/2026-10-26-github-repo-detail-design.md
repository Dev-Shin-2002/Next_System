# Thiết kế Kỹ thuật: Trang Chi tiết GitHub Repository (GitHub Repo Detail)

- **Ngày tạo**: 2026-10-26
- **Tác giả**: Antigravity Pair Programming
- **Trạng thái**: Draft / Approved by User
- **Phạm vi**: Backend Fastify (`/api/v1/github/repos/:id/overview`) & Frontend Next.js (`/admin/github/[id]`)

---

## 1. Mục tiêu & Bối cảnh

### 1.1 Mục tiêu
Cung cấp trang chi tiết tổng hợp cho từng kho lưu trữ GitHub của người dùng trong hệ thống Admin Console:
- Người dùng bấm vào một repository ở trang danh sách `/admin/github` sẽ được điều hướng đến `/admin/github/[id]`.
- Trang chi tiết trình bày tình trạng hiện tại của dự án ("Đang xảy ra gì"): metadata kho lưu trữ, commit gần đây, kết quả GitHub Actions CI, Pull Requests đang mở, và khối triển khai (chuẩn bị kết nối Vercel/Render).
- Thực hiện hoàn chỉnh cả **Backend** lẫn **Frontend** cho Giai đoạn 1 (Bản đầu).

### 1.2 Nguyên tắc thiết kế
1. **URL định danh theo ID**: Dùng GitHub Repository ID dạng số (ví dụ `/admin/github/1429427843`), không dùng tên repo vì repo có thể bị đổi tên trên GitHub.
2. **Khả năng chịu lỗi từng khối (Fault-Tolerant Block Architecture)**: Dữ liệu được chia thành các khối độc lập (`ListBlock<T>`). Nếu một API con của GitHub gặp lỗi (ví dụ không đủ quyền xem Actions 403, hoặc không có workflow), chỉ khối đó báo lỗi; toàn bộ trang và các khối còn lại vẫn hiển thị bình thường.
3. **Quy chuẩn dữ liệu không undefined**: Mọi trường dữ liệu luôn tồn tại; dùng `null` khi không có dữ liệu để bảo vệ client không bao giờ bị lỗi crash key hoặc lỗi hydration của React.
4. **Tiết kiệm hạn mức GitHub API (Quota Optimization)**: Dùng ETag cache lưu vào bảng `IntegrationCache` của PostgreSQL với cache key theo repoId, tránh lãng phí hạn mức 5.000 req/h.
5. **Giao diện chuẩn Dark Tech**: Tái sử dụng hệ thống Design System có sẵn (`Typography`, `Button`, `Select`, `IconRegistry`, thẻ viền 1px góc vuông 0px).

---

## 2. Kiến trúc Hệ thống

### 2.1 Luồng dữ liệu tổng thể

```
[Browser / Admin UI]
       │
       │ GET /api/v1/github/repos/:id/overview?refresh=false
       ▼
[Fastify Backend Controller]
       │
       ├─► Xác thực JWT Bearer Token
       ├─► Tìm tài khoản & giải mã GitHub Access Token
       ├─► Tra cứu ETag Cache trong PostgreSQL (bảng IntegrationCache)
       │
       ├─► (Nếu cache còn hiệu lực) ──► Trả về dữ liệu từ DB (cached: true)
       │
       └─► (Nếu cache hết hạn hoặc refresh=true)
              │
              ├─► GET https://api.github.com/repositories/:id (lấy owner, name)
              │
              └─► Promise.allSettled:
                     ├─► GET /repos/{owner}/{repo} (Repo metadata)
                     ├─► GET /repos/{owner}/{repo}/commits?per_page=10
                     ├─► GET /repos/{owner}/{repo}/actions/runs?per_page=10
                     ├─► GET /repos/{owner}/{repo}/pulls?state=open&per_page=10
                     └─► GET /repos/{owner}/{repo}/deployments?per_page=5
              │
              ├─► Ánh xạ dữ liệu qua Mapper (toRepo, toCommit, toCiRun, toPullRequest...)
              ├─► Đóng gói thành ListBlock (okBlock, errorBlock, notLinkedBlock)
              ├─► Lưu ETag và dữ liệu vào PostgreSQL
              │
              ▼
[Frontend Response] ──► Render các khối độc lập qua React Components
```

---

## 3. Đặc tả Hợp đồng Dữ liệu (Schema & Mapper)

### 3.1 Zod Schema (`repo-detail.schema.ts`)

```typescript
import { z } from 'zod';

export const IsoDate = z.string().datetime({ offset: true });
export const Sha = z.string().regex(/^[0-9a-f]{40}$/i);
const Url = z.string().url();

export const GithubUser = z.object({
  login: z.string(),
  avatarUrl: Url.nullable(),
});

export const BlockStatus = z.enum([
  'ok',          // Có dữ liệu
  'empty',       // Gọi thành công nhưng rỗng
  'forbidden',   // Không đủ quyền (403/404)
  'rate_limited',// Hết hạn mức GitHub API
  'not_linked',  // Chưa liên kết nền tảng triển khai
  'error',       // Lỗi mạng hoặc upstream lỗi
]);

export const BlockError = z.object({
  code: z.string(),
  message: z.string(),
});

export const listBlock = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    status: BlockStatus,
    fetchedAt: IsoDate.nullable(),
    cached: z.boolean(),
    error: BlockError.nullable(),
    items: z.array(item),
    hasMore: z.boolean(),
    totalCount: z.number().int().nonnegative().nullable(),
  });

export const RepoRole = z.enum(['owner', 'admin', 'collaborator', 'read']);

export const Repo = z.object({
  id: z.number().int(),
  name: z.string(),
  fullName: z.string(),
  description: z.string().nullable(),
  owner: z.object({
    login: z.string(),
    type: z.enum(['User', 'Organization', 'Bot']),
    avatarUrl: Url.nullable(),
    htmlUrl: Url,
  }),
  htmlUrl: Url,
  homepage: z.string().nullable(),
  isPrivate: z.boolean(),
  archived: z.boolean(),
  defaultBranch: z.string(),
  language: z.string().nullable(),
  sizeKb: z.number().int().nonnegative(),
  pushedAt: IsoDate.nullable(),
  updatedAt: IsoDate,
  role: RepoRole,
  permissions: z.object({ admin: z.boolean(), push: z.boolean(), pull: z.boolean() }),
});

export const Commit = z.object({
  sha: Sha,
  messageHeadline: z.string(),
  author: z.object({
    name: z.string().nullable(),
    login: z.string().nullable(),
    avatarUrl: Url.nullable(),
  }),
  authoredAt: IsoDate.nullable(),
  verified: z.boolean().nullable(),
  htmlUrl: Url,
});

export const RunStatus = z.enum([
  'queued', 'in_progress', 'completed', 'waiting', 'requested', 'pending', 'unknown',
]);

export const RunConclusion = z.enum([
  'success', 'failure', 'cancelled', 'skipped', 'timed_out', 'neutral', 'stale', 'action_required', 'unknown',
]);

export const CiRun = z.object({
  id: z.number().int(),
  runNumber: z.number().int(),
  runAttempt: z.number().int(),
  workflowName: z.string(),
  event: z.string(),
  status: RunStatus,
  conclusion: RunConclusion.nullable(),
  branch: z.string().nullable(),
  headSha: Sha,
  headCommitHeadline: z.string().nullable(),
  actor: GithubUser.nullable(),
  pullRequestNumbers: z.array(z.number().int()),
  startedAt: IsoDate,
  updatedAt: IsoDate,
  htmlUrl: Url,
});

export const PullRequest = z.object({
  number: z.number().int(),
  title: z.string(),
  state: z.enum(['open', 'closed']),
  draft: z.boolean(),
  author: GithubUser.nullable(),
  headRef: z.string(),
  baseRef: z.string(),
  requestedReviewerCount: z.number().int().nonnegative(),
  createdAt: IsoDate,
  updatedAt: IsoDate,
  mergedAt: IsoDate.nullable(),
  htmlUrl: Url,
});

export const DeploymentState = z.enum([
  'queued', 'pending', 'in_progress', 'success', 'failure', 'error', 'inactive', 'unknown',
]);

export const GithubDeployment = z.object({
  id: z.number().int(),
  sha: Sha,
  ref: z.string(),
  task: z.string(),
  environment: z.string(),
  description: z.string().nullable(),
  isProduction: z.boolean().nullable(),
  creator: GithubUser.nullable(),
  createdAt: IsoDate,
  updatedAt: IsoDate,
  latestStatus: z
    .object({
      state: DeploymentState,
      logUrl: z.string().nullable(),
      environmentUrl: z.string().nullable(),
      createdAt: IsoDate,
    })
    .nullable(),
});

export const Provider = z.enum(['vercel', 'render', 'cloudflare_pages']);
export const LinkedDeploymentState = z.enum(['queued', 'building', 'ready', 'error', 'canceled', 'unknown']);

export const LinkedDeployment = z.object({
  provider: Provider,
  linkId: z.string(),
  externalId: z.string(),
  projectName: z.string(),
  environment: z.enum(['production', 'preview', 'other']),
  state: LinkedDeploymentState,
  commitSha: Sha.nullable(),
  branch: z.string().nullable(),
  url: z.string().nullable(),
  dashboardUrl: z.string().nullable(),
  createdAt: IsoDate,
  finishedAt: IsoDate.nullable(),
});

export const RepoDetailData = z.object({
  repo: Repo,
  commits: listBlock(Commit),
  ciRuns: listBlock(CiRun),
  openPulls: listBlock(PullRequest),
  githubDeployments: listBlock(GithubDeployment),
  linkedDeployments: listBlock(LinkedDeployment),
});

export const RateLimit = z.object({
  limit: z.number().int(),
  remaining: z.number().int(),
  reset: z.number().int(),
});

export const Meta = z.object({
  requestId: z.string(),
  rateLimit: RateLimit.nullable(),
});

export const RepoDetailResponse = z.object({
  success: z.literal(true),
  data: RepoDetailData,
  meta: Meta,
});
```

---

## 4. Thiết kế Chi tiết Backend (Fastify)

### 4.1 Tập tin cấu trúc mới trong Backend
- `backend/src/modules/github/repo-detail.schema.ts`: Chứa toàn bộ Schema Zod và Types suy diễn.
- `backend/src/modules/github/repo-detail.mapper.ts`: Chứa raw interfaces, hàm `toRepo`, `toCommit`, `toCiRun`, `toPullRequest`, `toGithubDeployment`, `okBlock`, `errorBlock`, `notLinkedBlock`, `deriveRole`.
- Bổ sung hàm `fetchRepositoryOverview(prisma, userId, repoId, options)` vào `backend/src/modules/github/github.service.ts`.
- Bổ sung route `GET /github/repos/:id/overview` vào `backend/src/modules/github/github.route.ts`.

### 4.2 Xử lý ETag Cache & Rate Limit
- Cache key trong DB: `repo:overview:${repoId}` gắn với `integrationId`.
- Nếu client truyền `refresh=true`, bỏ qua ETag và ép buộc fetch mới từ GitHub.
- Đọc các headers `x-ratelimit-limit`, `x-ratelimit-remaining`, `x-ratelimit-reset` để phản hồi trong `meta.rateLimit`.

---

## 5. Thiết kế Chi tiết Frontend (Next.js)

### 5.1 Cấu trúc Thư mục và Tập tin
```
frontend/src/
├── app/
│   ├── api/github/
│   │   ├── repos.ts               # Bổ sung getGithubRepoDetail(id, refresh?)
│   │   └── repo-detail.types.ts   # Shared Types từ Schema
│   └── (admin)/admin/github/
│       ├── page.tsx               # Danh sách (đã hoàn thành)
│       └── [id]/
│           └── page.tsx           # Trang chi tiết Repo (/admin/github/:id)
└── features/github/
    ├── index.ts
    └── detail/
        ├── RepoDetailHeader.tsx   # Header repo, role, tags, actions
        ├── RepoMetricsCards.tsx   # 4 thẻ chỉ số tổng hợp
        ├── RepoCommitsBlock.tsx   # Danh sách 10 commit gần nhất
        ├── RepoCiRunsBlock.tsx    # Danh sách workflow runs CI
        ├── RepoOpenPullsBlock.tsx # Danh sách Pull Requests đang mở
        ├── RepoDeploymentBlock.tsx# Khối liên kết triển khai (trạng thái chưa liên kết)
        ├── RepoBlockState.tsx     # Khối hiển thị trạng thái (Forbidden, Error, Empty, Loading)
        └── index.ts
```

### 5.2 Chi tiết từng Component Giao diện

#### A. `RepoDetailHeader.tsx`
- **Breadcrumb**: `Dự án GitHub / {repo.name}` kèm nút quay lại `← Quay lại danh sách`.
- **Thông tin nhận diện**:
  - Tên repo (font Sans lớn, tracking chặt, đậm).
  - Badge quyền hiển thị: `Private` hoặc `Public`.
  - Badge vai trò (`role`): `Chủ sở hữu (Owner)`, `Quản trị viên (Admin)`, `Cộng tác viên (Collaborator)`, `Người đọc (Read)`.
  - Chủ sở hữu avatar + login.
  - Ngôn ngữ lập trình chính kèm màu nhận diện.
  - Nhánh mặc định (`defaultBranch`), dung lượng KB.
- **Hành động**:
  - Nút `Mở GitHub ↗` (`variant="secondary"`, mở `repo.htmlUrl` tab mới).
  - Nút `Làm mới (Force Refresh)` (`variant="secondary"`, icon quay xung nhịp, gọi API với `refresh=true`).

#### B. `RepoMetricsCards.tsx` (4 Thẻ số liệu)
1. **CI mới nhất**:
   - Nếu `ciRuns.items[0]` tồn tại: icon pass xanh lá / fail đỏ / in-progress xanh dương, tên workflow và kết luận (`success`, `failure`...).
   - Nếu rỗng: *"Chưa cấu hình CI"*.
2. **Deploy mới nhất**:
   - Giai đoạn 1: Hiển thị *"Chưa liên kết nền tảng"* hoặc status từ `githubDeployments`.
3. **Pull Requests mở**:
   - Số lượng PR đang mở (`openPulls.totalCount ?? openPulls.items.length`).
   - Nhãn phụ: *"Đang chờ duyệt / review"*.
4. **Lần đẩy code cuối (Last Push)**:
   - Hiển thị ngày đẩy code gần nhất (`repo.pushedAt`), tính thời gian tương đối ("2 giờ trước", "Hôm qua").

#### C. `RepoCommitsBlock.tsx`
- Tiêu đề: `Commits gần đây (10 commit mới nhất)`.
- Bảng/danh sách thẻ Dark Tech:
  - Cột 1: `SHA ngắn` (7 ký tự đầu từ `sha`) kèm nút copy và link commit GitHub.
  - Cột 2: `Message headline` (dòng đầu của commit message).
  - Cột 3: `Tác giả` (avatar + tên tác giả/login).
  - Cột 4: `Chữ ký xác thực (Verified)` (badge xanh lá nếu verified).
  - Cột 5: `Thời gian` (relative time).
- Chịu lỗi: Nếu `commits.status === 'forbidden'`, hiển thị cảnh báo *"Không đủ quyền xem lịch sử commit"*.

#### D. `RepoCiRunsBlock.tsx`
- Tiêu đề: `GitHub Actions (CI Workflow Runs)`.
- Danh sách runs:
  - Icon trạng thái: `success` (xanh lá), `failure` (đỏ), `in_progress` (quay), `cancelled` (xám).
  - Tên workflow (`workflowName`), sự kiện kích hoạt (`event`: push, pull_request...).
  - Nhánh mục tiêu (`branch`) & Commit SHA.
  - Thời lượng thực thi (tính từ `startedAt` đến `updatedAt`).
  - Liên kết trực tiếp xem log chi tiết trên GitHub Actions (`htmlUrl`).

#### E. `RepoOpenPullsBlock.tsx`
- Tiêu đề: `Pull Requests đang mở`.
- Danh sách PRs:
  - Số hiệu `#number` và tiêu đề PR.
  - Tác giả PR (avatar + login).
  - Nhánh nguồn -> đích (`headRef -> baseRef`).
  - Số lượng reviewer yêu cầu (`requestedReviewerCount`).
  - Nhãn `Draft` nếu là PR nháp.

#### F. `RepoDeploymentBlock.tsx`
- **Trạng thái chưa liên kết (`not_linked`)**:
  - Hộp thông báo phong cách Dark Tech: *"Repo này chưa gắn với Vercel, Render hay Cloudflare"*.
  - Nút bấm chính: `Liên kết triển khai` (`variant="primary"`) để mở modal/luồng kết nối sau này.

---

## 6. Kế hoạch Triển khai theo Phiên bản (Phasing)

- **Bản 1 (Triển khai ngay)**:
  - Backend: Schema, Mapper, Service với `Promise.allSettled`, Route `/api/v1/github/repos/:id/overview` có ETag Cache.
  - Frontend: Route `/admin/github/[id]`, Header, 4 Thẻ số liệu, Commits Block, CI Runs Block, Open Pulls Block, Deployment Block (trạng thái `not_linked`).
- **Bản 2 (Giai đoạn sau)**:
  - Tích hợp API Vercel / Render / Cloudflare Pages.
  - Khối Pipeline đa nền tảng theo commit SHA (mỗi hàng 1 commit, mỗi cột 1 nền tảng: GitHub CI, Vercel, Render).
- **Bản 3 (Giai đoạn hoàn thiện)**:
  - Bổ sung Issues, Quản lý Nhánh, README rendered markdown, Cảnh báo bảo mật Dependabot.

---

## 7. Kiểm tra Tự đánh giá (Spec Self-Review)

- [x] **Placeholder check**: Không có TBD, TODO hoặc yêu cầu mơ hồ.
- [x] **Tính nhất quán**: Cấu trúc Zod schema khớp hoàn toàn với response JSON và props của các component Frontend.
- [x] **Phạm vi (Scope)**: Tập trung chính xác vào Bản 1 theo đúng yêu cầu người dùng, phân tách rõ ràng với Bản 2 và Bản 3.
- [x] **Xử lý ngoại lệ**: Xử lý đầy đủ 401 (token hết hạn), 403 (không đủ quyền/tài nguyên private), 429 (rate limited), và trạng thái `not_linked`.
