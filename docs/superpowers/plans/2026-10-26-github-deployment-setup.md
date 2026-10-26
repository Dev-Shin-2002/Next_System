# GitHub Repository Deployment Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Triển khai tính năng Thiết lập Triển khai (Deploy Setup) cho GitHub Repository (`/admin/github/[id]`) hỗ trợ chọn 3 nền tảng (**Vercel**, **Render**, **Cloudflare Pages/Workers**) với 2 chế độ: **1-Click Launch** (mở URL chính thức) và **Tự động qua API** (tạo Project, tự động commit file CI/CD workflow lên GitHub và lưu liên kết vào DB).

**Architecture:** 
- **Backend (Fastify + Prisma)**: Mở rộng Prisma schema với model `ProjectDeploymentLink`. Thêm module `deployment-setup.service.ts` xử lý gọi API Vercel/Render/Cloudflare, commit workflow lên GitHub và lưu token mã hóa AES-256-GCM. Đăng ký endpoint `POST /api/v1/github/repos/:id/deployments/setup`. Cập nhật `fetchRepositoryOverview` để tự động trả về các deployment đã liên kết trong DB.
- **Frontend (Next.js 16 + React 19)**: Tạo component `DeploySetupModal.tsx` thiết kế Dark Tech cho phép chọn Vercel/Render/Cloudflare, chuyển đổi linh hoạt giữa 1-Click Launch và Tự động qua API. Nâng cấp `RepoDeploymentBlock.tsx` kích hoạt Modal khi người dùng bấm `+ Liên kết triển khai`.

**Tech Stack:** Fastify, TypeScript, Prisma (PostgreSQL), Zod, Next.js 16 (App Router), React 19, Tailwind CSS.

## Global Constraints
- Thời gian luôn là chuỗi ISO 8601 UTC.
- Repo ID luôn là kiểu `number` (tránh BigInt trong JSON serialization).
- Mọi token bên thứ ba nếu được lưu phải mã hóa AES-256-GCM qua hàm `encryptCredential()`.
- Thiết kế Dark Tech Brutalist nhất quán: Geist Mono/Sans, bo góc sắc nét, palette `#0a0a0a`, `#52a8ff`.

---

### Task 1: Backend Database Schema Migration

**Files:**
- Modify: `backend/prisma/schema.prisma`

**Interfaces:**
- Produces: Model `ProjectDeploymentLink` kết nối với `User`.

- [x] **Step 1: Thêm model `ProjectDeploymentLink` vào `backend/prisma/schema.prisma`**

```prisma
model ProjectDeploymentLink {
  id                String    @id @default(uuid())
  userId            String    @map("user_id")
  githubRepoId      Int       @map("github_repo_id")
  provider          String    // 'VERCEL' | 'RENDER' | 'CLOUDFLARE'
  externalProjectId String    @map("external_project_id")
  projectName       String    @map("project_name")
  environment       String    @default("production")
  status            String    @default("queued") // 'queued' | 'building' | 'ready' | 'error'
  url               String?
  dashboardUrl      String?   @map("dashboard_url")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([githubRepoId, provider, externalProjectId])
  @@index([githubRepoId])
  @@index([userId])
  @@map("project_deployment_links")
}
```

Và thêm quan hệ `deploymentLinks ProjectDeploymentLink[]` vào model `User`.

- [x] **Step 2: Chạy Prisma migrate / db push và generate client**

Run: `npx prisma db push` trong `backend/`.
Expected: `Your database is now in sync with your Prisma schema.`
Run: `npx prisma generate` trong `backend/`.
Expected: `✔ Generated Prisma Client`

- [x] **Step 3: Commit**

```bash
git add backend/prisma/schema.prisma
git commit -m "feat(backend): add ProjectDeploymentLink model to prisma schema"
```

---

### Task 2: Backend Setup Deployment Service & Route

**Files:**
- Create: `backend/src/modules/github/deployment-setup.service.ts`
- Modify: `backend/src/modules/github/github.service.ts`
- Modify: `backend/src/modules/github/github.route.ts`

**Interfaces:**
- Produces: Hàm `setupRepositoryDeployment(prisma, userId, repoId, payload)` và route `POST /api/v1/github/repos/:id/deployments/setup`.

- [x] **Step 1: Tạo `backend/src/modules/github/deployment-setup.service.ts`**
  - Hỗ trợ tạo URL 1-Click Launch cho Vercel, Render, Cloudflare.
  - Hỗ trợ gọi API Vercel (`POST /v11/projects`), Render (`POST /v1/services`), Cloudflare (`POST /accounts/:id/pages/projects`).
  - Hỗ trợ tạo commit file CI/CD workflow lên repo GitHub qua GitHub API `PUT /repos/:owner/:repo/contents/:path`.
  - Hỗ trợ lưu token mã hóa qua `encryptCredential()` nếu `saveToken: true`.
  - Tạo bản ghi trong `prisma.projectDeploymentLink`.

- [x] **Step 2: Cập nhật `fetchRepositoryOverview` trong `github.service.ts`**
  - Truy vấn `prisma.projectDeploymentLink.findMany({ where: { githubRepoId: repoId } })` và map vào `linkedDeployments`.
  - Nếu có bản ghi, trả về `status: 'ok'`, nếu chưa có trả về `status: 'not_linked'`.

- [x] **Step 3: Đăng ký route `POST /github/repos/:id/deployments/setup` trong `github.route.ts`**
  - Xác thực JWT.
  - Validate tham số `id` và body request.
  - Gọi `setupRepositoryDeployment` và trả về `reply.ok(result)`.

- [x] **Step 4: Kiểm tra TypeScript trên Backend**

Run: `npx tsc --noEmit` tại `backend/`.
Expected: PASS (0 errors).

- [x] **Step 5: Commit**

```bash
git add backend/src/modules/github/
git commit -m "feat(backend): implement deployment setup service and API endpoint"
```

---

### Task 3: Frontend API Client & Types

**Files:**
- Modify: `frontend/src/app/api/github/repo-detail.types.ts`
- Modify: `frontend/src/app/api/github/repos.ts`

**Interfaces:**
- Produces: `SetupDeploymentRequest`, `SetupDeploymentResponse`, `setupGithubRepoDeployment(repoId, payload)`.

- [x] **Step 1: Thêm types trong `frontend/src/app/api/github/repo-detail.types.ts`**

```typescript
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
```

- [x] **Step 2: Thêm hàm `setupGithubRepoDeployment` trong `frontend/src/app/api/github/repos.ts`**

```typescript
export async function setupGithubRepoDeployment(
  repoId: number,
  payload: SetupDeploymentRequest
): Promise<SetupDeploymentResponse> {
  return await api.post<SetupDeploymentResponse>(
    `/api/v1/github/repos/${repoId}/deployments/setup`,
    payload
  );
}
```

- [x] **Step 3: Kiểm tra TypeScript trên Frontend**

Run: `npx tsc --noEmit` tại `frontend/`.
Expected: PASS (0 errors).

- [x] **Step 4: Commit**

```bash
git add frontend/src/app/api/github/
git commit -m "feat(frontend): add setup deployment request types and API client"
```

---

### Task 4: Frontend `DeploySetupModal.tsx` Component

**Files:**
- Create: `frontend/src/features/github/detail/DeploySetupModal.tsx`
- Modify: `frontend/src/features/github/detail/index.ts`

**Interfaces:**
- Produces: Component `DeploySetupModal` (props: `isOpen`, `onClose`, `repo`, `onSuccess`).

- [x] **Step 1: Tạo `DeploySetupModal.tsx`**
  - Modal Dark Tech, backdrop blur, phím tắt `Esc` để đóng.
  - Chọn Provider: **Vercel** (logo tam giác), **Render** (logo R), **Cloudflare** (logo đám mây vàng).
  - Hai tab chế độ:
    - **1-Click Launch**: Nút mở URL tạo project chính thức với repo được điền sẵn.
    - **Tự động qua API**: Form nhập API token, Account ID (Cloudflare), checkbox lưu token, checkbox tạo CI/CD workflow, nút `[Tạo và Triển khai]`.
  - Hiển thị spinner và trạng thái phản hồi rõ ràng khi đang thực hiện.

- [x] **Step 2: Export trong `frontend/src/features/github/detail/index.ts`**

- [x] **Step 3: Kiểm tra TypeScript & Lint**

Run: `npx tsc --noEmit` và `npm run lint` tại `frontend/`.
Expected: PASS (0 errors, 0 warnings).

- [x] **Step 4: Commit**

```bash
git add frontend/src/features/github/detail/
git commit -m "feat(frontend): create DeploySetupModal component for multi-platform deployment"
```

---

### Task 5: Tích hợp Modal vào `RepoDeploymentBlock.tsx` & Page Detail

**Files:**
- Modify: `frontend/src/features/github/detail/RepoDeploymentBlock.tsx`
- Modify: `frontend/src/app/(admin)/admin/github/[id]/page.tsx`

**Interfaces:**
- Consumes: `DeploySetupModal`, `setupGithubRepoDeployment`.
- Produces: Luồng tương tác hoàn chỉnh khi bấm `Liên kết triển khai`.

- [x] **Step 1: Nâng cấp `RepoDeploymentBlock.tsx`**
  - Nhận prop `repo: Repo` và callback `onRefresh?: () => void`.
  - Bấm `[+ Liên kết triển khai]` hoặc `[Liên kết triển khai ngay]` sẽ mở `DeploySetupModal`.
  - Khi hoàn thành thiết lập thành công, tự động gọi `onRefresh()` để cập nhật danh sách deployments ngay lập tức.

- [x] **Step 2: Cập nhật `page.tsx`**
  - Truyền `repo={data.repo}` và `onRefresh={() => fetchOverview(true)}` vào `RepoDeploymentBlock`.

- [x] **Step 3: Kiểm tra TypeScript & Lint**

Run: `npx tsc --noEmit` và `npm run lint` tại `frontend/`.
Expected: PASS (0 errors, 0 warnings).

- [x] **Step 4: Commit**

```bash
git add frontend/src/features/github/detail/RepoDeploymentBlock.tsx "frontend/src/app/(admin)/admin/github/[id]/page.tsx"
git commit -m "feat(github): integrate DeploySetupModal into deployment block and detail page"
```

---

### Task 6: Kiểm thử Toàn diện & Xác thực (Verification)

**Files:** Toàn bộ dự án Backend & Frontend

- [x] **Step 1: Kiểm tra TypeScript Backend**
  Run: `npx tsc --noEmit` tại `backend/`.
  Expected: PASS (0 errors).

- [x] **Step 2: Kiểm tra TypeScript Frontend**
  Run: `npx tsc --noEmit` tại `frontend/`.
  Expected: PASS (0 errors).

- [x] **Step 3: Kiểm tra Linter Frontend**
  Run: `npm run lint` tại `frontend/`.
  Expected: PASS (0 errors, 0 warnings).

- [x] **Step 4: Commit hoàn tất**
