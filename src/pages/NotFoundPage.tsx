import { Link } from 'react-router';

export default function NotFoundPage() {
  return <section className="container empty-state"><p className="eyebrow">404</p><h1>Trang không tồn tại</h1><p>Đường dẫn bạn truy cập không hợp lệ.</p><Link className="button primary" to="/">Về trang chủ</Link></section>;
}
