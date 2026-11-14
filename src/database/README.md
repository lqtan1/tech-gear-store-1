# Mock database

`products.json` là nguồn dữ liệu sản phẩm dùng cho đồ án frontend.

`users.json` là nguồn dữ liệu tài khoản demo dùng cho đăng nhập. Tài khoản trong file này có:

- `admin@techgear.vn` / `admin` — quyền quản trị.
- `customer@techgear.vn` / `customer` — quyền khách hàng.

Trong môi trường thật, mật khẩu không được lưu dạng plain text như file demo này mà phải được hash ở backend.

Các dữ liệu phiên và dữ liệu có tính thay đổi được mô phỏng bằng `localStorage`:

- `tech-gear-cart`: giỏ hàng.
- `tech-gear-orders`: đơn hàng.
- `tech-gear-user`: phiên đăng nhập an toàn, không chứa mật khẩu.
- `tech-gear-theme`: lựa chọn giao diện.

Đây là mock database phía trình duyệt, không phải database server. Khi triển khai backend thật, các service trong `src/features/*/service.ts` và store đơn hàng có thể được thay bằng API repository mà không cần thay đổi giao diện.
