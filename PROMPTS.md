BỐI CẢNH
Dự án phu-xuan-react, đề tài "Website thiết bị ngoại vi và phụ kiện công nghệ"[cite: 30]. Đọc AGENTS.md ở thư mục gốc và tuân thủ tuyệt đối[cite: 30].

NHIỆM VỤ
Tạo cơ chế ThemeContext cho toàn ứng dụng tại:
1. src/app/theme-context.tsx
2. src/app/providers.tsx
3. Hướng dẫn sửa src/main.tsx để bọc AppProviders quanh App[cite: 28, 33].

RÀNG BUỘC
- Theme gồm hai chế độ: "light" và "dark"[cite: 28].
- Hook useTheme() phải kiểm tra context; nếu dùng ngoài ThemeProvider thì throw Error rõ ràng[cite: 28].
- Viết bằng TypeScript strict, không dùng any[cite: 30, 39].
- Không cài thêm bất kỳ thư viện ngoài nào[cite: 30].

TIÊU CHÍ XONG
- npm run build và npm run typecheck không báo lỗi kiểu[cite: 30, 33].
- Provider hoạt động độc lập và sẵn sàng tái sử dụng cho các màn hình[cite: 28].

ĐẦU RA
Nêu ngắn gọn kế hoạch trước, sau đó liệt kê toàn bộ nội dung từng tệp[cite: 30].