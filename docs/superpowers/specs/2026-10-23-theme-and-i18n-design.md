# Design Specification: Theme Enhancement and i18n Integration

- **Project:** System Manager
- **Date:** 2026-10-23
- **Status:** Approved

## 1. Objectives
1. Nâng cấp và hoàn thiện hệ thống Design Tokens & Theme để hỗ trợ chuẩn hiển thị tiếng Việt, bổ sung layout tokens, đồng bộ hóa Tailwind CSS v4 variables và cải thiện hiển thị Dark/Light mode.
2. Tích hợp giải pháp đa ngôn ngữ (i18n) bằng kiến trúc React Context & Custom Hooks nội bộ (không thay đổi cấu trúc URL), hỗ trợ lưu trữ trạng thái qua Cookie/LocalStorage và chuyển đổi ngôn ngữ tức thì giữa Tiếng Việt (`vi`) và Tiếng Anh (`en`).

## 2. Architecture & Components

### 2.1. Theme Updates
* **`src/theme/font.ts`**:
  * Thêm `vietnamese` subset vào cả `fontSans` (Inter) và `fontMono` (JetBrains Mono).
* **`src/theme/tokens.ts`**:
  * Bổ sung nhóm `layout` tokens:
    * `sidebarWidth`: `'16rem'` (256px)
    * `sidebarCollapsedWidth`: `'4rem'` (64px)
    * `headerHeight`: `'3.5rem'` (56px)
    * `contentMaxWidth`: `'80rem'` (1280px)
* **`src/app/globals.css`**:
  * Mở rộng CSS variables cho semantic surface tokens: `--card`, `--sidebar`, `--border`, `--muted` cho cả chế độ mặc định (Light) và `@media (prefers-color-scheme: dark)` hoặc class `.dark`.
  * Map các biến vào Tailwind v4 `@theme inline`.

### 2.2. i18n Architecture (`src/i18n/`)
* **`src/i18n/config.ts`**:
  * Khai báo hằng số `SUPPORTED_LOCALES = ['vi', 'en'] as const`, kiểu `Locale`, và `DEFAULT_LOCALE = 'vi'`.
* **`src/i18n/locales/vi.json` & `src/i18n/locales/en.json`**:
  * Các từ điển cấu trúc hóa: `common`, `nav`, `dashboard`, `system`, `errors`.
* **`src/i18n/context.tsx`**:
  * React Context `I18nContext` và Provider `I18nProvider`.
  * Hook `useTranslation()` cung cấp:
    * `locale`: Ngôn ngữ hiện tại (`'vi'` | `'en'`)
    * `setLocale(locale)`: Hàm thay đổi ngôn ngữ, lưu vào `localStorage` và `document.cookie`.
    * `t(key, params)`: Hàm dịch hỗ trợ nested keys (e.g., `'nav.dashboard'`) và tham số chèn (interpolation).
* **`src/i18n/LanguageSwitcher.tsx`**:
  * Component UI trực quan cho phép người dùng chuyển đổi qua lại giữa `Tiếng Việt` và `English`.
* **`src/i18n/index.ts`**:
  * Export tập trung tất cả types, components và hooks.
* **`src/app/layout.tsx`**:
  * Bọc component con trong `I18nProvider` để toàn bộ ứng dụng sử dụng được tính năng đa ngữ.

## 3. Verification & Acceptance Criteria
- Cả font sans và font mono tải và hiển thị tiếng Việt có dấu hoàn hảo không bị vỡ glyph.
- Các biến Tailwind v4 hoạt động tốt với các class: `bg-card`, `border-border`, `text-muted`.
- Chức năng chuyển đổi ngôn ngữ phản hồi ngay lập tức trên UI và lưu trạng thái sau khi refresh trang.
- Ứng dụng Next.js build / dev không có lỗi TypeScript hoặc lint.
