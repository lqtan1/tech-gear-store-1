# TechGear Store — Hệ Thống Bán Lẻ Thiết Bị Ngoại Vi & Phụ Kiện Công Nghệ

Dự án website thương mại điện tử chuyên biệt về thiết bị ngoại vi máy tính (bàn phím cơ, chuột gaming, màn hình chuyên dụng, tai nghe cao cấp và phụ kiện setup) tích hợp cổng thanh toán trực tuyến.

---

## 📁 Cấu trúc dự án

Dự án được tổ chức theo mô hình phân tách rõ ràng giữa Frontend, Backend và Tài liệu:

```text
tech-gear-doan/
├── backend/            # Dịch vụ Backend API (Node.js, Express, Supabase, VNPAY)
├── frontend/           # Giao diện người dùng Client & Admin (React 19, TypeScript, Vite, Zustand)
├── docs/               # Toàn bộ tài liệu đặc tả nghiệp vụ và kỹ thuật
├── AGENTS.md           # Quy tắc và hướng dẫn phát triển dành cho AI / Developer
├── PROMPTS.md          # Lưu vết ngữ cảnh & yêu cầu nhiệm vụ
└── README.md           # Hướng dẫn tổng quan dự án
```

---

## 🛠️ Công nghệ sử dụng

- **Frontend:**
  - React 19 + TypeScript (Strict mode)
  - Vite (Build tool)
  - Zustand (Quản lý state)
  - React Router
- **Backend:**
  - Node.js + Express
  - Supabase (PostgreSQL, Supabase Auth, Storage)
  - Cổng thanh toán VNPAY Sandbox (Node Crypto HMAC-SHA512)

---

## 🚀 Hướng dẫn khởi chạy

### 1. Frontend
```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt thư viện phụ thuộc
npm install

# Khởi chạy môi trường phát triển (Dev Server)
npm run dev

# Kiểm tra kiểu dữ liệu & build production
npm run typecheck
npm run build
```

### 2. Backend
Chi tiết cấu hình và triển khai được mô tả tại [backend/README.md](backend/README.md).

---

## 📚 Tài liệu tham khảo
- [01_BUSINESS_REQUIREMENTS.md](docs/01_BUSINESS_REQUIREMENTS.md): Đặc tả yêu cầu nghiệp vụ (BRD).
- [02_AI_UI_UX_SPECIFICATION.md](docs/02_AI_UI_UX_SPECIFICATION.md): Thiết kế giao diện & trải nghiệm người dùng.
- [03_AI_FRONTEND_TECHNICAL_SPEC.md](docs/03_AI_FRONTEND_TECHNICAL_SPEC.md): Đặc tả kỹ thuật phía Client.
- [04_AI_ADMIN_TECHNICAL_SPEC.md](docs/04_AI_ADMIN_TECHNICAL_SPEC.md): Kiến trúc Backend & Dashboard Quản trị.
