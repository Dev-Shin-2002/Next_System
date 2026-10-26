# System Manager Frontend (Next.js 16 + React 19)

Hệ thống quản trị hạ tầng và dự án tập trung (System Manager) với phong cách thiết kế **Dark Tech Brutalism**, sử dụng bảng mã thiết kế nhất quán (`Typography`, `Button`, `Select`, `IconRegistry`).

## 🚀 Các tính năng chính

- **Admin Console (`/admin`)**:
  - Quản lý dự án GitHub (`/admin/github`): Đồng bộ danh sách repository qua OAuth2, hỗ trợ tìm kiếm, lọc theo phân loại, quyền hạn và ETag cache.
  - Chi tiết dự án GitHub (`/admin/github/[id]`): Hiển thị bức tranh toàn cảnh "đang xảy ra gì" trên dự án gồm 4 thẻ chỉ số nhanh, danh sách 10 commit gần nhất, trạng thái GitHub Actions CI runs, Pull Requests đang mở và liên kết triển khai (Vercel, Render, Cloudflare).
- **Portal User Console (`/portal`)**:
  - Giao diện dành riêng cho thành viên với bố cục tinh gọn và trải nghiệm hiện đại.
- **Xác thực an toàn (OAuth & JWT)**:
  - Tích hợp GitHub OAuth đăng nhập nhanh và lưu phiên an toàn.

## 🛠️ Công nghệ sử dụng

- **Framework**: Next.js 16 (App Router) + React 19
- **Styling**: Tailwind CSS v4, Dark Tech design system tokens
- **Icons**: IconRegistry nội bộ chuẩn SVG tối ưu
- **API Client**: Axios wrapper tự động gắn Bearer Token và xử lý lỗi đồng bộ

## 💻 Hướng dẫn chạy môi trường phát triển

```bash
# Cài đặt dependencies
npm install

# Khởi chạy server phát triển trên port 8386
npm run dev
```

Truy cập: [http://localhost:8386](http://localhost:8386)
