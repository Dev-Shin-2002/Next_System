# GitHub Repository Deployment Setup Feature Design

- **Date**: 2026-10-26
- **Status**: Approved
- **Scope**: Frontend (`frontend/src/features/github/detail/`) & Backend (`backend/src/modules/github/`)

## 1. Problem Statement
Trang chi tiết GitHub Repository (`/admin/github/[id]`) đã có khối **"Triển khai (Deployments)"** nhưng hiện tại chỉ hiển thị trạng thái `Chưa có liên kết` kèm thông báo tạm thời. Người dùng cần một cơ chế thực tế để:
1. Chọn nền tảng mục tiêu (**Vercel**, **Render**, **Cloudflare Pages/Workers**).
2. Lựa chọn giữa **1-Click Launch** (mở trang deploy chính thức với repo gắn sẵn) hoặc **Tự động hóa qua API** (hệ thống tự gọi API tạo project trên nền tảng, tự động tạo workflow CI/CD trên GitHub, và liên kết vào hệ thống).

## 2. Solution Architecture

### 2.1 User Flows

```
[Bấm "+ Liên kết triển khai" tại /admin/github/:id]
                      │
                      ▼
        ┌───────────────────────────────┐
        │       DeploySetupModal        │
        │ 1. Chọn Provider              │
        │    (Vercel, Render, CF)       │
        │ 2. Chọn Phương thức           │
        └───────┬───────────────┬───────┘
                │               │
      [1-Click Launch]     [Tự động qua API]
                │               │
                ▼               ▼
      Mở popup chính thức   POST /api/v1/github/repos/:id/deployments/setup
      (Vercel/Render/CF)    ├─ 1. Lưu token (AES-256-GCM) nếu checkbox bật
                            ├─ 2. Gọi API nền tảng tạo project
                            ├─ 3. Commit CI/CD workflow lên GitHub (nếu chọn)
                            ├─ 4. Lưu liên kết vào DB (`ProjectDeploymentLink`)
                            └─ 5. Khối Deployments trên web tự cập nhật
```

### 2.2 Supported Providers & 1-Click URLs
1. **Vercel**:
   - 1-Click URL: `https://vercel.com/new/clone?repository-url=https://github.com/{owner}/{repo}`
   - API Endpoint: `POST https://api.vercel.com/v11/projects`
2. **Render**:
   - 1-Click URL: `https://render.com/deploy?repo=https://github.com/{owner}/{repo}`
   - API Endpoint: `POST https://api.render.com/v1/services`
   - Config file: `render.yaml`
3. **Cloudflare Pages / Workers**:
   - 1-Click URL: `https://deploy.workers.cloudflare.com/?url=https://github.com/{owner}/{repo}`
   - API Endpoint: `POST https://api.cloudflare.com/client/v4/accounts/{account_id}/pages/projects`
   - Workflow file: `.github/workflows/deploy.yml` với `cloudflare/wrangler-action`

## 3. Data Schema & Models

### 3.1 Prisma Schema Extension (Backend)

```prisma
model ProjectDeploymentLink {
  id                String    @id @default(uuid())
  userId            String    @map("user_id")
  githubRepoId      Int       @map("github_repo_id")
  provider          String    // 'VERCEL' | 'RENDER' | 'CLOUDFLARE'
  externalProjectId String    @map("external_project_id")
  projectName       String    @map("project_name")
  environment       String    @default("production") // 'production' | 'preview'
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

### 3.2 Setup Request / Response DTO

```typescript
export interface SetupDeploymentRequest {
  provider: 'vercel' | 'render' | 'cloudflare';
  mode: 'manual' | 'api';
  apiToken?: string;
  accountId?: string; // Bắt buộc đối với Cloudflare
  saveToken?: boolean;
  createWorkflow?: boolean;
  projectName?: string;
}

export interface SetupDeploymentResponse {
  success: boolean;
  linkedDeployment: LinkedDeployment;
  launchUrl?: string;
  workflowCreated?: boolean;
}
```

## 4. Frontend Components

1. `DeploySetupModal.tsx`:
   - Modal Dark Tech, backdrop blur, bo góc sắc nét.
   - Tabs: `1-Click Launch` và `Tự động hóa qua API`.
   - Card chọn nền tảng với biểu tượng SVG chính thức của Vercel, Render, Cloudflare.
   - Form nhập token, account ID, project name.
   - Checkbox lưu token và tạo CI/CD workflow.
2. Cập nhật `RepoDeploymentBlock.tsx`:
   - Gắn sự kiện mở `DeploySetupModal` khi bấm nút `Liên kết triển khai`.
   - Nhận danh sách deployments cập nhật từ response sau khi tạo xong.

## 5. Security & Isolation
- Toàn bộ API token người dùng nhập nếu chọn `saveToken: true` sẽ được mã hóa bằng AES-256-GCM qua hàm `encryptCredential()` sẵn có tại `backend/src/common/crypto.ts`.
- Nếu `saveToken: false`, token chỉ được dùng 1 lần trong phiên xử lý và lập tức bị giải phóng khỏi bộ nhớ.
