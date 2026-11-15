import { Link } from 'react-router';

export default function AboutPage() {
  return (
    <div className="about-page-wolf py-4">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb-nav mb-4">
          <Link to="/">Trang chủ</Link>
          <span>/</span>
          <strong>Về chúng tôi</strong>
          <span>/</span>
          <strong>Giới thiệu TechGear Store</strong>
        </div>

        {/* Hero Banner */}
        <div className="about-hero-section shadow-sm mb-5">
          <span className="about-badge">CHUYÊN GIA THIẾT BỊ NGOẠI VI & GEAR</span>
          <h1 className="about-hero-title">
            TechGear Store — Nâng Tầm Trải Nghiệm Công Nghệ & Góc Làm Việc Của Bạn
          </h1>
          <p className="about-hero-subtitle">
            Được thành lập bởi những người đam mê công nghệ và văn hóa setup góc máy tính tối giản, TechGear Store tự hào là đơn vị phân phối chính hãng các dòng bàn phím cơ custom, chuột công thái học, màn hình đồ họa và tai nghe Hi-Fi hàng đầu tại Việt Nam.
          </p>
        </div>

        {/* 4 Pillars of Excellence */}
        <div className="about-stats-grid mb-5">
          <div className="about-stat-card shadow-sm">
            <span className="stat-emoji">💎</span>
            <strong className="stat-num">100%</strong>
            <span className="stat-label">Hàng Chính Hãng</span>
            <p className="stat-desc">Đầy đủ tem kiểm định, hóa đơn VAT và bảo hành điện tử chính ngạch.</p>
          </div>
          <div className="about-stat-card shadow-sm">
            <span className="stat-emoji">🛡️</span>
            <strong className="stat-num">24 Tháng</strong>
            <span className="stat-label">Bảo Hành 1 Đổi 1</span>
            <p className="stat-desc">Đổi mới thiết bị trong 30 ngày đầu và bảo hành 2 năm an tâm tuyệt đối.</p>
          </div>
          <div className="about-stat-card shadow-sm">
            <span className="stat-emoji">⚡</span>
            <strong className="stat-num">2 Giờ</strong>
            <span className="stat-label">Giao Siêu Tốc</span>
            <p className="stat-desc">Giao hỏa tốc nội thành TP. HCM và freeship toàn quốc từ đơn 500.000đ.</p>
          </div>
          <div className="about-stat-card shadow-sm">
            <span className="stat-emoji">⭐</span>
            <strong className="stat-num">4.9 / 5</strong>
            <span className="stat-label">Hài Lòng Khách Hàng</span>
            <p className="stat-desc">Hơn 25.000+ tín đồ công nghệ và lập trình viên tin tưởng lựa chọn.</p>
          </div>
        </div>

        {/* Story Section */}
        <div className="about-story-grid mb-5">
          <div className="story-content-col">
            <span className="story-eyebrow">CÂU CHUYỆN THƯƠNG HIỆU</span>
            <h2 className="story-title">Kiến tạo không gian làm việc truyền cảm hứng</h2>
            <p className="story-text">
              Chúng tôi tin rằng bàn phím, con chuột hay chiếc màn hình máy tính không đơn thuần là công cụ làm việc vô tri. Đó là những vật dụng tiếp xúc trực tiếp với đôi tay và đôi mắt của bạn suốt 8 đến 10 tiếng mỗi ngày.
            </p>
            <p className="story-text">
              Một chiếc bàn phím gõ êm đầm ấm, một chú chuột công thái học nâng đỡ cổ tay hay một màn hình chuẩn màu sắc nét không chỉ giúp bạn làm việc nhanh hơn mà còn bảo vệ sức khỏe thể chất lâu dài, khơi gợi nguồn cảm hứng sáng tạo bất tận.
            </p>
            <div className="brand-badges-list">
              <span className="brand-pill">Logitech</span>
              <span className="brand-pill">Keychron</span>
              <span className="brand-pill">NuPhy</span>
              <span className="brand-pill">Razer</span>
              <span className="brand-pill">Dell UltraSharp</span>
              <span className="brand-pill">Sony Audio</span>
              <span className="brand-pill">MonsGeek</span>
              <span className="brand-pill">Akko</span>
            </div>
          </div>
          <div className="story-img-col">
            <img
              src="https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=1200&q=80"
              alt="Góc làm việc TechGear Setup"
              className="story-img shadow-md"
            />
          </div>
        </div>

        {/* CTA Showroom */}
        <div className="about-showroom-cta shadow-sm text-center py-5">
          <span className="showroom-tag">TRẢI NGHIỆM TRỰC TIẾP</span>
          <h2 className="cta-title">Ghé thăm Showroom TechGear Store ngay hôm nay</h2>
          <p className="cta-desc">
            Trải nghiệm trực tiếp hàng trăm mẫu switch phím cơ, cầm thử chuột công thái học và kiểm tra màn hình đồ họa tại không gian trải nghiệm hiện đại.
          </p>
          <div className="cta-buttons-row">
            <Link to="/stores" className="btn-wolf-primary">
              📍 Xem chỉ đường Showroom (70 Lữ Gia, Q. 11, TP. HCM)
            </Link>
            <Link to="/products" className="btn-wolf-secondary">
              🛒 Khám phá sản phẩm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
