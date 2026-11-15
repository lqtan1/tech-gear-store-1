import { Link } from 'react-router';

export default function StoresPage() {
  return (
    <div className="stores-page-wolf py-4">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb-nav mb-4">
          <Link to="/">Trang chủ</Link>
          <span>/</span>
          <strong>Hệ thống cửa hàng & Showroom trải nghiệm</strong>
        </div>

        {/* Hero Section */}
        <div className="stores-hero-header shadow-sm mb-5 text-center">
          <span className="stores-badge">SHOWROOM TRẢI NGHIỆM CHÍNH HÃNG</span>
          <h1 className="stores-title">Hệ Thống Showroom TechGear Store</h1>
          <p className="stores-subtitle">
            Không gian trải nghiệm công nghệ hiện đại bậc nhất TP. Hồ Chí Minh với bàn Switch Testing Station, khu vực Ergonomics Workspace và đội ngũ chuyên viên kỹ thuật tư vấn tận tâm.
          </p>
        </div>

        {/* Store Detail Card */}
        <div className="store-detail-layout-grid mb-5">
          {/* Info Column */}
          <div className="store-info-col shadow-sm">
            <div className="store-status-row">
              <span className="live-status-pill open">● Đang mở cửa</span>
              <span className="store-city-pill">TP. HỒ CHÍ MINH</span>
            </div>
            <h2 className="store-name">TechGear Flagship Showroom Lữ Gia</h2>
            <p className="store-tagline">Trung tâm phân phối & bảo hành thiết bị ngoại vi chính hãng</p>

            <div className="store-meta-list">
              <div className="store-meta-item">
                <span className="meta-icon">📍</span>
                <div>
                  <strong>Địa chỉ Showroom:</strong>
                  <p>70 Lữ Gia, Phường 15 (Khu Phú Thọ), Quận 11, TP. Hồ Chí Minh</p>
                  <small className="meta-sub">
                    (Gần cổng sau Đại học Bách Khoa TP. HCM, đối diện khu thương mại Lữ Gia Plaza)
                  </small>
                </div>
              </div>

              <div className="store-meta-item">
                <span className="meta-icon">🕒</span>
                <div>
                  <strong>Giờ mở cửa phục vụ:</strong>
                  <p>Thứ Hai – Chủ Nhật: 8:00 – 22:00</p>
                  <small className="meta-sub">Mở cửa liên tục suốt trưa và phục vụ tất cả các ngày lễ, Tết.</small>
                </div>
              </div>

              <div className="store-meta-item">
                <span className="meta-icon">📞</span>
                <div>
                  <strong>Hotline tư vấn kỹ thuật & CSKH:</strong>
                  <p>
                    <a href="tel:19006750" className="phone-highlight">
                      1900 6750
                    </a>{' '}
                    (Hỗ trợ 24/7)
                  </p>
                  <p>
                    Zalo Hotline:{' '}
                    <a
                      href="https://zalo.me/0335744258"
                      target="_blank"
                      rel="noreferrer"
                      className="phone-highlight"
                    >
                      0335.744.258
                    </a>
                  </p>
                </div>
              </div>

              <div className="store-meta-item">
                <span className="meta-icon">🚗</span>
                <div>
                  <strong>Bãi đỗ xe:</strong>
                  <p>Miễn phí 100% bãi đỗ xe ô tô và xe máy rộng rãi ngay trước cửa Showroom, có bảo vệ hỗ trợ.</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="store-actions-row mt-4">
              <a
                href="https://maps.google.com/?q=70+Lữ+Gia,+Phường+15,+Quận+11,+TP+Hồ+Chí+Minh"
                target="_blank"
                rel="noreferrer"
                className="btn-wolf-primary"
              >
                🗺️ Mở Google Maps chỉ đường
              </a>
              <a href="tel:19006750" className="btn-wolf-secondary">
                📞 Gọi Hotline cửa hàng
              </a>
            </div>
          </div>

          {/* Map Column */}
          <div className="store-map-col shadow-sm">
            <div className="map-frame-box">
              <iframe
                title="Bản đồ chỉ đường TechGear Store 70 Lữ Gia"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.517758348981!2d106.65438847480572!3d10.771602989376662!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752ec186847c21%3A0xe549db5bc0efb5bc!2zNzAgTOG7ryBHaWEsIFBoxrDhu51uZyAxNSwgUXXhuq1uIDExLCBI4buTIENow60gTWluaCwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '380px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        {/* Experience Highlights at Showroom */}
        <div className="showroom-experiences-section mb-5">
          <div className="text-center mb-4">
            <span className="section-eyebrow">DỊCH VỤ ĐẶC QUYỀN</span>
            <h2 className="section-main-heading">Trải nghiệm tại Showroom TechGear</h2>
          </div>

          <div className="experiences-grid">
            <div className="experience-card shadow-sm">
              <span className="exp-icon">⌨️</span>
              <h3 className="exp-title">Switch Test Station</h3>
              <p className="exp-desc">
                Thử trực tiếp hơn 50 loại switch cơ học (Linear, Tactile, Clicky, Silent, Hall Effect từ Gateron, Cherry, Kailh) trên bảng test chuyên dụng.
              </p>
            </div>

            <div className="experience-card shadow-sm">
              <span className="exp-icon">🖱️</span>
              <h3 className="exp-title">Góc Cầm Thử Chuột Công Thái Học</h3>
              <p className="exp-desc">
                Trải nghiệm thực tế mọi dáng cầm (Palm, Claw, Fingertip) với dòng chuột Logitech MX Master, Razer DeathAdder, Superlight trên bàn kê tay.
              </p>
            </div>

            <div className="experience-card shadow-sm">
              <span className="exp-icon">🖥️</span>
              <h3 className="exp-title">Màn Hình Đồ Họa Cân Màu Sẵn</h3>
              <p className="exp-desc">
                Kiểm tra độ phủ màu và độ phân giải 4K trên các dòng màn hình Dell UltraSharp được cân chỉnh màu bằng thiết bị chuyên dụng Calibrite.
              </p>
            </div>

            <div className="experience-card shadow-sm">
              <span className="exp-icon">🔧</span>
              <h3 className="exp-title">Hỗ Trợ Kỹ Thuật & Lube Phím Miễn Phí</h3>
              <p className="exp-desc">
                Khách hàng mua bàn phím tại TechGear được hỗ trợ cân chỉnh thanh cân bằng (Stab) và tra mỡ bôi trơn switch hoàn toàn miễn phí.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
