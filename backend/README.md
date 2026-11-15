# TechGear Store - Backend Service

## Tổng quan
Backend phục vụ các API cho ứng dụng TechGear Store:
- Xác thực & Phân quyền quản trị (Admin Guard Middleware)
- Tích hợp cổng thanh toán VNPAY (Khởi tạo URL, xác thực Checksum SHA-512, xử lý IPN / Return URL)
- Quản lý sản phẩm, tồn kho và tải ảnh qua Supabase Storage
- API thống kê & báo cáo dành cho Quản trị viên (Analytics)

## Công nghệ sử dụng
- **Runtime:** Node.js
- **Framework:** Express
- **Database & Auth:** Supabase (PostgreSQL, Supabase Auth, Supabase Storage)
- **Bảo mật:** Node Crypto (HMAC-SHA512)

## Tài liệu liên quan
- Xem chi tiết đặc tả tại [`docs/04_AI_ADMIN_TECHNICAL_SPEC.md`](../docs/04_AI_ADMIN_TECHNICAL_SPEC.md).
