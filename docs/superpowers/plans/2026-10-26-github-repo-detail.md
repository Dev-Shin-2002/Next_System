# GitHub Repository Detail Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Triển khai hoàn chỉnh cả Backend Fastify lẫn Frontend Next.js cho trang Chi tiết GitHub Repository (`/admin/github/[id]`), hiển thị tình trạng dự án theo các khối độc lập (Header, Metrics, Commits, CI Workflow Runs, Open PRs, Deployments) với cơ chế chịu lỗi từng khối và ETag Cache qua PostgreSQL.

**Architecture:** 
- Backend cung cấp endpoint tổng hợp `GET /api/v1/github/repos/:id/overview` gọi song song các sub-resources của GitHub qua `Promise.allSettled`, bọc vào chuẩn `ListBlock<T>` với trạng thái tường minh (`ok`, `empty`, `forbidden`, `rate_limited`, `not_linked`, `error`) và lưu ETag cache trong PostgreSQL.
- Frontend Next.js nhận dữ liệu theo `RepoDetailResponse`, chia nhỏ thành các feature components chuyên biệt trong `features/github/detail/` và sử dụng hệ thống Dark Tech Design Tokens (`Typography`, `Button`, `Select`, `IconRegistry`).

**Tech Stack:** Fastify, TypeScript, Prisma (PostgreSQL), Zod, Next.js (App Router), React 19, Tailwind CSS.

## Global Constraints
- Thời gian luôn là chuỗi ISO 8601 UTC.
- Repo ID luôn là kiểu `number` (không dùng BigInt trong JSON serialization).
- SHA đầy đủ 40 ký tự ở API; frontend cắt 7 ký tự khi hiển thị.
- Mọi trường dữ liệu không tồn tại phải dùng `null`, không dùng `undefined`.
- Từng khối giao diện độc lập: nếu 1 khối bị lỗi (VD 403 không đủ quyền xem Actions), chỉ khối đó hiện cảnh báo, cả trang không bị gián đoạn.
- Tận dụng ETag Cache để tiết kiệm hạn mức 5.000 req/h của GitHub API.

---

### Task 1: Backend Schema & Mappers

**Files:**
- Create: `backend/src/modules/github/repo-detail.schema.ts`
- Create: `backend/src/modules/github/repo-detail.mapper.ts`

**Interfaces:**
- Produces: `RepoDetailResponse`, `RepoDetailData`, `Repo`, `Commit`, `CiRun`, `PullRequest`, `GithubDeployment`, `LinkedDeployment`, `ListBlock<T>`, `toRepo()`, `toCommit()`, `toCiRun()`, `toPullRequest()`, `toGithubDeployment()`, `okBlock()`, `errorBlock()`, `notLinkedBlock()`, `deriveRole()`.

- [ ] **Step 1: Tạo `backend/src/modules/github/repo-detail.schema.ts`**
  Định nghĩa Zod Schema hoàn chỉnh cho `Repo`, `Commit`, `CiRun`, `PullRequest`, `GithubDeployment`, `LinkedDeployment`, `ListBlock<T>` và `RepoDetailResponse`.

- [ ] **Step 2: Tạo `backend/src/modules/github/repo-detail.mapper.ts`**
  Định nghĩa raw interfaces, các hàm chuyển đổi dữ liệu (`toRepo`, `toCommit`, `toCiRun`, `toPullRequest`, `toGithubDeployment`), các hàm bọc khối (`okBlock`, `errorBlock`, `notLinkedBlock`) và hàm trích xuất rate limit từ headers.

- [ ] **Step 3: Kiểm tra biên dịch TypeScript trên Backend**
  Chạy lệnh: `npx tsc --noEmit` tại thư mục `backend/`.
  Kỳ vọng: PASS (0 errors).

- [ ] **Step 4: Commit**
  ```bash
  git add backend/src/modules/github/repo-detail.schema.ts backend/src/modules/github/repo-detail.mapper.ts
  git commit -m "feat(backend): add github repo detail schema and mappers"
  ```

---

### Task 2: Backend Service & Route Endpoint

**Files:**
- Modify: `backend/src/modules/github/github.service.ts`
- Modify: `backend/src/modules/github/github.route.ts`

**Interfaces:**
- Consumes: Mappers & Schema từ Task 1.
- Produces: Hàm `fetchRepositoryOverview(prisma, userId, repoId, options)` và route `GET /api/v1/github/repos/:id/overview`.

- [ ] **Step 1: Thêm `fetchRepositoryOverview` vào `github.service.ts`**
  - Tìm `Integration` của `userId` với provider `GITHUB` và giải mã access token.
  - Kiểm tra ETag Cache trong PostgreSQL (`IntegrationCache`) với cacheKey `repo:overview:${repoId}`.
  - Lấy repo metadata qua `GET https://api.github.com/repositories/:id`.
  - Dùng `Promise.allSettled` gọi song song:
    1. `GET /repos/{owner}/{name}`
    2. `GET /repos/{owner}/{name}/commits?per_page=10`
    3. `GET /repos/{owner}/{name}/actions/runs?per_page=10`
    4. `GET /repos/{owner}/{name}/pulls?state=open&per_page=10`
    5. `GET /repos/{owner}/{name}/deployments?per_page=5`
  - Ánh xạ sang cấu trúc `RepoDetailData`, cập nhật ETag vào `IntegrationCache`, trả về kết quả chuẩn envelope.

- [ ] **Step 2: Đăng ký route `GET /github/repos/:id/overview` trong `github.route.ts`**
  - Xác thực người dùng qua JWT.
  - Nhận `id` từ `request.params` (ép kiểu số nguyên) và `refresh` từ `request.query`.
  - Gọi `fetchRepositoryOverview` và trả về `reply.ok(result)`.

- [ ] **Step 3: Kiểm tra biên dịch TypeScript trên Backend**
  Chạy lệnh: `npx tsc --noEmit` tại thư mục `backend/`.
  Kỳ vọng: PASS (0 errors).

- [ ] **Step 4: Commit**
  ```bash
  git add backend/src/modules/github/github.service.ts backend/src/modules/github/github.route.ts
  git commit -m "feat(backend): implement GET /api/v1/github/repos/:id/overview"
  ```

---

### Task 3: Frontend API Client & Types

**Files:**
- Create: `frontend/src/app/api/github/repo-detail.types.ts`
- Modify: `frontend/src/app/api/github/repos.ts`
- Modify: `frontend/src/app/api/github/index.ts`

**Interfaces:**
- Consumes: API endpoint `/api/v1/github/repos/:id/overview`.
- Produces: `RepoDetailData`, `RepoDetailResponse`, `getGithubRepoDetail(id: number, refresh?: boolean)`.

- [ ] **Step 1: Tạo `frontend/src/app/api/github/repo-detail.types.ts`**
  Đồng bộ Types từ Schema backend sang Frontend: `Repo`, `Commit`, `CiRun`, `PullRequest`, `GithubDeployment`, `LinkedDeployment`, `ListBlock<T>`, `RepoDetailData`.

- [ ] **Step 2: Thêm hàm `getGithubRepoDetail` trong `frontend/src/app/api/github/repos.ts`**
  ```typescript
  export async function getGithubRepoDetail(
    id: number,
    refresh?: boolean
  ): Promise<RepoDetailData> {
    return await api.get<RepoDetailData>(`/api/v1/github/repos/${id}/overview`, {
      params: refresh ? { refresh: 'true' } : undefined,
    });
  }
  ```

- [ ] **Step 3: Export trong `frontend/src/app/api/github/index.ts`**
  Export `* from './repo-detail.types'` để toàn bộ ứng dụng dùng chung.

- [ ] **Step 4: Kiểm tra TypeScript trên Frontend**
  Chạy: `npx tsc --noEmit` tại `frontend/`.
  Kỳ vọng: PASS (0 errors).

- [ ] **Step 5: Commit**
  ```bash
  git add frontend/src/app/api/github/
  git commit -m "feat(frontend): add repo detail types and API client function"
  ```

---

### Task 4: Frontend Detail Feature Components (Header, Metrics, BlockState)

**Files:**
- Create: `frontend/src/features/github/detail/RepoBlockState.tsx`
- Create: `frontend/src/features/github/detail/RepoDetailHeader.tsx`
- Create: `frontend/src/features/github/detail/RepoMetricsCards.tsx`

**Interfaces:**
- Consumes: `Repo`, `ListBlock<T>`, `Typography`, `Button`, `IconRegistry`.
- Produces: `RepoBlockState`, `RepoDetailHeader`, `RepoMetricsCards`.

- [ ] **Step 1: Tạo `RepoBlockState.tsx`**
  Component tái sử dụng hiển thị các trạng thái khối:
  - `forbidden`: Hộp cảnh báo màu hổ phách "Không đủ quyền xem mục này trên GitHub".
  - `rate_limited`: Hộp cảnh báo hết hạn mức GitHub API.
  - `error`: Hộp cảnh báo lỗi kèm nút Thử lại.
  - `empty`: Hiển thị "Chưa có dữ liệu".
  - `loading`: Skeleton pulse.

- [ ] **Step 2: Tạo `RepoDetailHeader.tsx`**
  - Hiển thị breadcrumb quay về danh sách (`← Dự án GitHub`).
  - Tên repo, badge `Role` (`owner`, `admin`, `collaborator`, `read`), badge `Private`/`Public`.
  - Tên tác giả, ngôn ngữ, branch mặc định, dung lượng.
  - Nút `Mở GitHub ↗` và nút `Làm mới (Force Refresh)`.

- [ ] **Step 3: Tạo `RepoMetricsCards.tsx`**
  Hiển thị lưới 4 thẻ:
  1. CI mới nhất (Trạng thái icon pass/fail/in-progress, tên workflow run).
  2. Deploy mới nhất (Trạng thái deploy từ GitHub hoặc "Chưa liên kết").
  3. Pull Requests mở (Số lượng PR đang mở).
  4. Lần push cuối (Relative time từ `pushedAt`).

- [ ] **Step 4: Kiểm tra linter và TypeScript**
  Chạy: `npm run lint` tại `frontend/`.
  Kỳ vọng: PASS (0 errors).

- [ ] **Step 5: Commit**
  ```bash
  git add frontend/src/features/github/detail/
  git commit -m "feat(frontend): create RepoDetailHeader, RepoMetricsCards, and RepoBlockState"
  ```

---

### Task 5: Frontend Data Blocks (Commits, CI Runs, Pull Requests, Deployment Stub)

**Files:**
- Create: `frontend/src/features/github/detail/RepoCommitsBlock.tsx`
- Create: `frontend/src/features/github/detail/RepoCiRunsBlock.tsx`
- Create: `frontend/src/features/github/detail/RepoOpenPullsBlock.tsx`
- Create: `frontend/src/features/github/detail/RepoDeploymentBlock.tsx`
- Create: `frontend/src/features/github/detail/index.ts`
- Modify: `frontend/src/features/github/index.ts`

**Interfaces:**
- Consumes: `ListBlock<Commit>`, `ListBlock<CiRun>`, `ListBlock<PullRequest>`, `ListBlock<LinkedDeployment>`, `RepoBlockState`.
- Produces: `RepoCommitsBlock`, `RepoCiRunsBlock`, `RepoOpenPullsBlock`, `RepoDeploymentBlock`.

- [ ] **Step 1: Tạo `RepoCommitsBlock.tsx`**
  - Hiển thị danh sách 10 commit gần nhất:
    - SHA 7 ký tự (cắt từ 40 ký tự) kèm link mở commit trên GitHub.
    - Message headline dòng đầu.
    - Avatar + tác giả commit.
    - Badge `Verified` nếu có chữ ký số.
    - Thời gian tương đối (`authoredAt`).
  - Bọc qua `RepoBlockState` nếu status khác `ok`.

- [ ] **Step 2: Tạo `RepoCiRunsBlock.tsx`**
  - Hiển thị danh sách GitHub Actions runs:
    - Trạng thái kết luận (icon check xanh lá nếu `success`, x đỏ nếu `failure`, spinner nếu `in_progress`).
    - Tên workflow run (`workflowName`), sự kiện kích hoạt (`event`).
    - Branch mục tiêu và commit SHA.
    - Thời lượng thực thi và link xem log GitHub (`htmlUrl`).
  - Bọc qua `RepoBlockState` nếu status khác `ok`.

- [ ] **Step 3: Tạo `RepoOpenPullsBlock.tsx`**
  - Hiển thị danh sách PR đang mở:
    - Số hiệu PR `#123` và tiêu đề.
    - Tác giả PR (avatar + login).
    - Cặp nhánh `headRef -> baseRef`.
    - Số lượng reviewer yêu cầu (`requestedReviewerCount`).
    - Badge `Draft` nếu là PR nháp.
  - Bọc qua `RepoBlockState` nếu status khác `ok`.

- [ ] **Step 4: Tạo `RepoDeploymentBlock.tsx`**
  - Hiển thị khối Triển khai:
    - Nếu `linkedDeployments.status === 'not_linked'`: Hiển thị hộp thông báo Dark Tech "Repo này chưa gắn với Vercel, Render hay Cloudflare" kèm nút `Liên kết triển khai` (`variant="primary"`).
    - Sẵn sàng render danh sách deployments khi có liên kết.

- [ ] **Step 5: Export toàn bộ từ `frontend/src/features/github/detail/index.ts` và `frontend/src/features/github/index.ts`**

- [ ] **Step 6: Kiểm tra linter và TypeScript**
  Chạy: `npm run lint` tại `frontend/`.
  Kỳ vọng: PASS (0 errors).

- [ ] **Step 7: Commit**
  ```bash
  git add frontend/src/features/github/
  git commit -m "feat(frontend): create RepoCommitsBlock, RepoCiRunsBlock, RepoOpenPullsBlock, RepoDeploymentBlock"
  ```

---

### Task 6: Trang Chi tiết `/admin/github/[id]/page.tsx` & Điều hướng từ Danh sách

**Files:**
- Create: `frontend/src/app/(admin)/admin/github/[id]/page.tsx`
- Modify: `frontend/src/features/github/GithubRepoCard.tsx` (cập nhật liên kết bấm vào xem chi tiết)

**Interfaces:**
- Consumes: Tất cả components từ Task 4 & Task 5, `getGithubRepoDetail`.
- Produces: Route `/admin/github/:id` hoàn chỉnh.

- [ ] **Step 1: Tạo `frontend/src/app/(admin)/admin/github/[id]/page.tsx`**
  - Nhận `params.id` từ URL (async params của Next.js 15+).
  - Quản lý trạng thái: `detailData`, `isLoading`, `isRefreshing`, `error`.
  - Fetch dữ liệu qua `getGithubRepoDetail(repoId, false)` trong `useEffect` (tuân thủ quy tắc không gọi setState đồng bộ để tránh cascading renders).
  - Cung cấp hàm `handleForceRefresh()` gọi với `refresh=true`.
  - Render theo cấu trúc:
    - `RepoDetailHeader`
    - `RepoMetricsCards`
    - `RepoCommitsBlock`
    - `RepoCiRunsBlock`
    - `RepoOpenPullsBlock`
    - `RepoDeploymentBlock`
  - Xử lý skeleton pulse loading khi `isLoading === true`.

- [ ] **Step 2: Cập nhật `GithubRepoCard.tsx`**
  - Thêm liên kết nội bộ `Link href={`/admin/github/${repo.id}`}` vào tiêu đề repository và thẻ để người dùng có thể nhấp vào xem trang chi tiết.
  - Vẫn giữ nút `↗` mở tab mới trực tiếp sang trang web GitHub.

- [ ] **Step 3: Kiểm tra linter và TypeScript**
  Chạy: `npm run lint` và `npx tsc --noEmit` tại `frontend/`.
  Kỳ vọng: PASS (0 errors, 0 warnings).

- [ ] **Step 4: Commit**
  ```bash
  git add frontend/src/app/\(admin\)/admin/github/\[id\]/ frontend/src/features/github/GithubRepoCard.tsx
  git commit -m "feat(frontend): assemble repo detail page at /admin/github/[id] and wire card links"
  ```

---

### Task 7: Kiểm thử Tổng hợp (Full Verification)

**Files:** Toàn bộ dự án Backend & Frontend

- [ ] **Step 1: Chạy kiểm tra TypeScript Backend**
  Chạy: `npx tsc --noEmit` tại `backend/`.
  Kỳ vọng: PASS (0 errors).

- [ ] **Step 2: Chạy kiểm tra TypeScript Frontend**
  Chạy: `npx tsc --noEmit` tại `frontend/`.
  Kỳ vọng: PASS (0 errors).

- [ ] **Step 3: Chạy linter Frontend**
  Chạy: `npm run lint` tại `frontend/`.
  Kỳ vọng: PASS (0 errors, 0 warnings).

- [ ] **Step 4: Commit hoàn tất tính năng**
  ```bash
  git commit --allow-empty -m "chore: verify and complete github repo detail implementation"
  ```
