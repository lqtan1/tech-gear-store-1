import { useState, useMemo } from 'react';
import { Link } from 'react-router';

import Toast from '../components/Toast';
import TrustBar from '../components/TrustBar';
import { useProductStore } from '../features/products/store';
import { getProductPrimaryImage } from '../features/products/utils';

interface SoftwareItem {
  id: string;
  name: string;
  maker: string;
  badge: string;
  badgeType: 'gaming' | 'office' | 'custom';
  version: string;
  releaseDate: string;
  iconBg: string;
  iconSvg: string;
  tagline: string;
  desc: string;
  features: string[];
  osSupport: string;
  windowsUrl: string;
  macUrl: string;
  webAppUrl?: string;
  guideNote: string;
}

const softwareCatalog: SoftwareItem[] = [
  {
    id: 'logitech-ghub',
    name: 'Logitech G HUB',
    maker: 'Logitech G',
    badge: 'Gaming Esports',
    badgeType: 'gaming',
    version: 'v2024.8.6',
    releaseDate: '10/2026',
    iconBg: '#0f172a',
    iconSvg: '🎮',
    tagline: 'Trung tâm điều khiển phần cứng Gaming Logitech G',
    desc: 'Phần mềm tối thượng dành riêng cho chuột, bàn phím và tai nghe Logitech G. Tự động nhận diện tựa game, tinh chỉnh cảm biến HERO 2 lên đến 32.000 DPI, hiệu ứng ánh sáng LIGHTSYNC RGB 16.8 triệu màu và gán phím macro phức tạp.',
    features: [
      'Đồng bộ ánh sáng LIGHTSYNC RGB',
      'Hiệu chỉnh DPI & Lift-off cảm biến HERO 2',
      'Lập trình Macro & G-Shift kép',
      'Lưu profile bộ nhớ On-Board Memory',
    ],
    osSupport: 'Windows 10/11 (64-bit) • macOS 12 Monterey trở lên',
    windowsUrl: 'https://www.logitechg.com/vi-vn/innovation/g-hub.html',
    macUrl: 'https://www.logitechg.com/vi-vn/innovation/g-hub.html',
    guideNote: 'Yêu cầu kết nối cáp USB hoặc đầu thu LIGHTSPEED khi cập nhật firmware lần đầu.',
  },
  {
    id: 'logi-options-plus',
    name: 'Logi Options+',
    maker: 'Logitech Master Series',
    badge: 'Công thái học & Văn phòng',
    badgeType: 'office',
    version: 'v1.84.1',
    releaseDate: '10/2026',
    iconBg: '#1e293b',
    iconSvg: '💼',
    tagline: 'Tối ưu hóa hiệu suất làm việc & cử chỉ thông minh',
    desc: 'Ứng dụng thế hệ mới nâng tầm năng suất cho dòng MX Master 3S, MX Anywhere và bàn phím MX Keys. Hỗ trợ thao tác cử chỉ (Gestures), tính năng Smart Actions tự động hóa nhiều bước bấm và chia sẻ file không dây qua Logitech Flow.',
    features: [
      'Logitech Flow - Di chuyển chuột giữa 3 máy tính',
      'Smart Actions tự động hóa tác vụ chỉ với 1 phím',
      'Tùy chỉnh độ nhạy con lăn MagSpeed vô cực',
      'Phím chức năng chuyên biệt cho Zoom, Teams & Adobe',
    ],
    osSupport: 'Windows 10/11 (64-bit) • macOS 11 Big Sur trở lên',
    windowsUrl: 'https://www.logitech.com/vi-vn/software/logi-options-plus.html',
    macUrl: 'https://www.logitech.com/vi-vn/software/logi-options-plus.html',
    guideNote: 'Cấp quyền Accessibility trên macOS trong Cài đặt hệ thống để kích hoạt cử chỉ Smart Actions.',
  },
  {
    id: 'keychron-launcher',
    name: 'Keychron Launcher / VIA',
    maker: 'Keychron & QMK Community',
    badge: 'Phím cơ Custom QMK',
    badgeType: 'custom',
    version: 'Web App / Offline',
    releaseDate: 'Cập nhật liên tục',
    iconBg: '#18181b',
    iconSvg: '⌨️',
    tagline: 'Cấu hình bàn phím cơ trực tiếp trên trình duyệt Web',
    desc: 'Nền tảng tùy biến phím cơ mạnh mẽ nhất hiện nay, không cần cài đặt phần mềm nặng máy. Hoạt động trên WebHID Chrome/Edge, cho phép remap toàn bộ phím trên 4 layer, key override, macro tổ hợp và chỉnh hiệu ứng RGB trực quan.',
    features: [
      'Chạy trực tiếp trên Web trình duyệt (WebHID)',
      'Hỗ trợ 4 Layer phím độc lập (Mac & Windows)',
      'Lập trình Macro không giới hạn ký tự',
      'Tùy biến Knob xoay âm lượng & đèn RGB tức thì',
    ],
    osSupport: 'Trình duyệt Chrome, Edge, Opera trên Windows, macOS, Linux',
    windowsUrl: 'https://launcher.keychron.com/',
    macUrl: 'https://launcher.keychron.com/',
    webAppUrl: 'https://launcher.keychron.com/',
    guideNote: 'Cắm cáp USB và mở trang web trên trình duyệt Google Chrome hoặc Microsoft Edge để kết nối.',
  },
  {
    id: 'razer-synapse',
    name: 'Razer Synapse (Gen 3 / 4)',
    maker: 'Razer Inc.',
    badge: 'Gaming Esports',
    badgeType: 'gaming',
    version: 'v4.0.86',
    releaseDate: '10/2026',
    iconBg: '#052e16',
    iconSvg: '🐍',
    tagline: 'Trung tâm hiệu năng thiết bị ngoại vi Razer Gaming',
    desc: 'Bộ công cụ toàn diện cho dòng chuột DeathAdder, bàn phím BlackWidow và tai nghe BlackShark. Tinh chỉnh công nghệ Razer Chroma RGB 16.8 triệu màu, âm thanh vòm THX Spatial Audio 7.1 và công nghệ Hypershift nhân đôi chức năng nút bấm.',
    features: [
      'Razer Chroma RGB Studio đồng bộ hàng trăm game',
      'Hiệu chỉnh bề mặt bàn di chuột & Focus Pro 30K DPI',
      'Âm thanh vòm THX Spatial Audio định vị chuẩn xác',
      'Razer Hypershift nhân đôi số lượng nút gán phím',
    ],
    osSupport: 'Windows 10/11 64-bit (Có Razer macOS Companion cho Mac)',
    windowsUrl: 'https://www.razer.com/synapse-3',
    macUrl: 'https://www.razer.com/synapse-3',
    guideNote: 'Khuyến nghị đăng nhập Razer ID để lưu profile đám mây và nhận cập nhật firmware tự động.',
  },
  {
    id: 'nuphy-console',
    name: 'NuPhy Console',
    maker: 'NuPhy Studio',
    badge: 'Phím cơ Siêu mỏng',
    badgeType: 'office',
    version: 'v1.2.4',
    releaseDate: '09/2026',
    iconBg: '#312e81',
    iconSvg: '⚡',
    tagline: 'Tiện ích cấu hình phím mỏng NuPhy Air Series',
    desc: 'Phần mềm chính thức tùy chỉnh chuyên sâu cho dòng bàn phím cơ siêu mỏng NuPhy Air75, Air96, Halo Series. Cho phép gán phím chức năng, lập trình macro, điều chỉnh hiệu ứng dải LED hông (Sidelight) và kiểm tra dung lượng pin chính xác.',
    features: [
      'Gán phím Fn & chuyển đổi nhanh Mac / Windows',
      'Chỉnh hiệu ứng LED phím và dải RGB Sidelight viền',
      'Kiểm tra % dung lượng pin và trạng thái Sleep timer',
      'Cập nhật firmware 2.4GHz dongle và Bluetooth',
    ],
    osSupport: 'Windows 10/11 (64-bit) • macOS 11 trở lên',
    windowsUrl: 'https://nuphy.com/pages/console',
    macUrl: 'https://nuphy.com/pages/console',
    guideNote: 'Gạt công tắc chế độ kết nối sang có dây (Wired mode) khi thực hiện nâng cấp firmware.',
  },
];

export default function SoftwarePage() {
  const [selectedMakerFilter, setSelectedMakerFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const allProducts = useProductStore((state) => state.products);

  const filteredSoftware = useMemo(() => {
    return softwareCatalog.filter((item) => {
      const matchMaker =
        selectedMakerFilter === 'all' ||
        (selectedMakerFilter === 'gaming' && item.badgeType === 'gaming') ||
        (selectedMakerFilter === 'office' && item.badgeType === 'office') ||
        (selectedMakerFilter === 'custom' && item.badgeType === 'custom');

      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.maker.toLowerCase().includes(q) ||
        item.features.some((f) => f.toLowerCase().includes(q));

      return matchMaker && matchSearch;
    });
  }, [selectedMakerFilter, searchQuery]);

  const handleDownload = (softwareName: string, osName: string, officialUrl: string) => {
    setToastMessage(`Bắt đầu tải “${softwareName}” cho hệ điều hành ${osName}`);
    window.open(officialUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="software-download-page">
      {/* 1. Page Header / Breadcrumb */}
      <div className="software-hero-banner">
        <div className="container">
          <div className="software-breadcrumb">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <strong>Trung tâm phần mềm & Driver</strong>
          </div>

          <div className="software-hero-content">
            <span className="hero-eyebrow-pill">HỆ SINH THÁI DRIVER CHÍNH HÃNG</span>
            <h1 className="software-hero-title">Trung Tâm Tải Phần Mềm & Driver TechGear</h1>
            <p className="software-hero-desc">
              Tải về phần mềm điều khiển chính thức từ các thương hiệu hàng đầu: Logitech G, Razer, Keychron, NuPhy.
              Cá nhân hóa hiệu ứng ánh sáng RGB, tinh chỉnh độ nhạy DPI, lập trình phím Macro và tối ưu hóa trải nghiệm
              làm việc cũng như thi đấu thể thao điện tử.
            </p>

            {/* Quick stats counter */}
            <div className="software-stats-row">
              <div className="software-stat-item">
                <strong className="stat-number">5+</strong>
                <span className="stat-label">Phần mềm chính hãng</span>
              </div>
              <div className="software-stat-item">
                <strong className="stat-number">100%</strong>
                <span className="stat-label">Driver an toàn & sạch</span>
              </div>
              <div className="software-stat-item">
                <strong className="stat-number">Win / Mac</strong>
                <span className="stat-label">Tương thích đa nền tảng</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="software-controls-section">
        <div className="container">
          <div className="software-toolbar-card">
            <div className="software-filter-pills">
              <button
                type="button"
                className={`software-pill-btn ${selectedMakerFilter === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedMakerFilter('all')}
              >
                Tất cả phần mềm ({softwareCatalog.length})
              </button>
              <button
                type="button"
                className={`software-pill-btn gaming ${selectedMakerFilter === 'gaming' ? 'active' : ''}`}
                onClick={() => setSelectedMakerFilter('gaming')}
              >
                🎮 Gaming Gear (Logitech G / Razer)
              </button>
              <button
                type="button"
                className={`software-pill-btn office ${selectedMakerFilter === 'office' ? 'active' : ''}`}
                onClick={() => setSelectedMakerFilter('office')}
              >
                💼 Văn phòng & Công thái học (Logi Options+ / NuPhy)
              </button>
              <button
                type="button"
                className={`software-pill-btn custom ${selectedMakerFilter === 'custom' ? 'active' : ''}`}
                onClick={() => setSelectedMakerFilter('custom')}
              >
                ⌨️ Phím cơ Custom QMK / VIA
              </button>
            </div>

            <div className="software-search-input-wrap">
              <span className="search-icon-symbol">🔍</span>
              <input
                type="text"
                className="software-search-field"
                placeholder="Tìm phần mềm, tính năng (LED, DPI, Macro)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Tìm phần mềm"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="software-search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Xóa tìm kiếm"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Software Cards Grid */}
      <section className="software-list-section">
        <div className="container">
          {filteredSoftware.length === 0 ? (
            <div className="empty-software-state">
              <span className="empty-emoji">🔍</span>
              <h3>Không tìm thấy phần mềm phù hợp</h3>
              <p>Hãy thử thay đổi từ khóa hoặc chọn bộ lọc "Tất cả phần mềm".</p>
              <button
                type="button"
                className="btn-wolf-primary mt-3"
                onClick={() => {
                  setSelectedMakerFilter('all');
                  setSearchQuery('');
                }}
              >
                Đặt lại bộ lọc
              </button>
            </div>
          ) : (
            <div className="software-grid">
              {filteredSoftware.map((item) => {
                // Find compatible products currently in store
                const compatibleProducts = allProducts.filter((p) => p.softwareId === item.id);

                return (
                  <article key={item.id} className="software-card">
                    {/* Header */}
                    <div className="software-card-top">
                      <div className="software-card-identity">
                        <div
                          className="software-app-avatar"
                          style={{ backgroundColor: item.iconBg }}
                          aria-hidden="true"
                        >
                          <span className="software-avatar-emoji">{item.iconSvg}</span>
                        </div>
                        <div>
                          <div className="software-badge-row">
                            <span className={`software-tag-pill ${item.badgeType}`}>{item.badge}</span>
                            <span className="software-version-tag">{item.version}</span>
                          </div>
                          <h2 className="software-app-name">{item.name}</h2>
                          <span className="software-maker-name">{item.maker}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tagline & Desc */}
                    <div className="software-card-body">
                      <p className="software-card-tagline">
                        <strong>{item.tagline}</strong>
                      </p>
                      <p className="software-card-desc">{item.desc}</p>

                      {/* Feature Checklist */}
                      <div className="software-features-box">
                        <span className="features-box-title">Tính năng nổi bật:</span>
                        <ul className="features-bullet-list">
                          {item.features.map((feat, idx) => (
                            <li key={idx} className="feature-bullet-item">
                              <span className="check-icon">✓</span>
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Compatible Gear in Store */}
                      <div className="software-compatible-box">
                        <div className="compatible-header">
                          <span className="compatible-title">Thiết bị tương thích tại TechGear:</span>
                          <span className="compatible-count">{compatibleProducts.length} sản phẩm</span>
                        </div>
                        {compatibleProducts.length > 0 ? (
                          <div className="compatible-products-list">
                            {compatibleProducts.map((p) => (
                              <Link
                                key={p.id}
                                to={`/products/${p.id}`}
                                className="compatible-product-chip"
                                title={`Xem chi tiết "${p.name}"`}
                              >
                                <img src={getProductPrimaryImage(p)} alt={p.name} className="compatible-chip-img" />
                                <span className="compatible-chip-name">{p.name}</span>
                                <span className="compatible-chip-arrow">→</span>
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <p className="compatible-empty-note">
                            Tương thích với các dòng thiết bị {item.maker} có hỗ trợ giao thức kết nối.
                          </p>
                        )}
                      </div>

                      {/* OS Support & Note */}
                      <div className="software-os-note">
                        <span className="os-label">Hệ điều hành:</span> {item.osSupport}
                      </div>
                      <div className="software-guide-note">
                        <span className="info-icon">ℹ️</span> {item.guideNote}
                      </div>
                    </div>

                    {/* Download Buttons Row */}
                    <div className="software-card-footer">
                      <div className="download-buttons-group">
                        <button
                          type="button"
                          className="btn-download windows"
                          onClick={() => handleDownload(item.name, 'Windows', item.windowsUrl)}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="os-icon"
                          >
                            <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.901-1.8" />
                          </svg>
                          <span>Tải về Windows</span>
                        </button>

                        <button
                          type="button"
                          className="btn-download mac"
                          onClick={() => handleDownload(item.name, 'macOS', item.macUrl)}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="os-icon"
                          >
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.63 1.35-.57.65-.96 1.7-0.84 2.73.99.08 2.02-.48 2.55-1.23z" />
                          </svg>
                          <span>Tải về macOS</span>
                        </button>

                        {item.webAppUrl && (
                          <button
                            type="button"
                            className="btn-download webapp"
                            onClick={() => handleDownload(item.name, 'Trình duyệt Web', item.webAppUrl!)}
                            title="Mở ngay trên trình duyệt Google Chrome hoặc Edge"
                          >
                            🌐 Mở Web App
                          </button>
                        )}
                      </div>

                      <div className="software-direct-link-row">
                        <a
                          href={item.windowsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="official-portal-link"
                        >
                          Trang chủ chính hãng {item.maker} ↗
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 4. Installation & Driver FAQ Guide */}
      <section className="software-faq-section">
        <div className="container">
          <div className="faq-card-wrap">
            <div className="faq-header">
              <span className="section-eyebrow">HƯỚNG DẪN & HỖ TRỢ KỸ THUẬT</span>
              <h3 className="faq-section-title">Câu hỏi thường gặp về cài đặt Phần mềm & Driver</h3>
            </div>

            <div className="faq-grid">
              <div className="faq-item">
                <strong className="faq-question">❓ Thiết bị của tôi có cần bắt buộc cài phần mềm không?</strong>
                <p className="faq-answer">
                  Hầu hết chuột, bàn phím và tai nghe tại TechGear đều hỗ trợ Plug & Play (cắm là chạy). Tuy nhiên,
                  việc cài phần mềm chính thức sẽ giúp bạn tận dụng tối đa tính năng như: chỉnh DPI theo bước 50 DPI,
                  đổi màu LED RGB, gán phím tắt nhanh và theo dõi % pin chính xác.
                </p>
              </div>

              <div className="faq-item">
                <strong className="faq-question">❓ Tôi dùng macOS thì các phần mềm có tương thích tốt không?</strong>
                <p className="faq-answer">
                  Logitech Options+, Keychron Launcher (VIA) và NuPhy Console hỗ trợ hoàn hảo trên macOS (bao gồm chip M1,
                  M2, M3). Với Razer, bạn có thể lưu profile trực tiếp vào bộ nhớ On-Board Memory trên máy tính Windows
                  rồi mang sang Mac sử dụng mà không cần chạy phần mềm nền.
                </p>
              </div>

              <div className="faq-item">
                <strong className="faq-question">❓ Khi cập nhật Firmware thiết bị cần lưu ý những gì?</strong>
                <p className="faq-answer">
                  Luôn cắm cáp USB trực tiếp vào máy tính (tránh qua hub chia USB) và đảm bảo pin thiết bị trên 50%.
                  Tuyệt đối không rút cáp hoặc tắt máy tính trong quá trình thanh tiến trình nạp firmware đang chạy.
                </p>
              </div>

              <div className="faq-item">
                <strong className="faq-question">❓ Cần hỗ trợ cài đặt cấu hình Macro phức tạp?</strong>
                <p className="faq-answer">
                  Đội ngũ kỹ thuật viên của TechGear luôn sẵn sàng hỗ trợ qua Hotline <strong>1900 6750</strong> hoặc
                  trực tiếp tại showroom để hướng dẫn bạn lập trình Macro, map phím QMK/VIA chi tiết nhất.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TrustBar />

      <Toast
        message={toastMessage}
        variant="download"
        title="Đang tải xuống..."
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}
