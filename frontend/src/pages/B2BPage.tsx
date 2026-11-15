import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';

export default function B2BPage() {
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [productNeeds, setProductNeeds] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!companyName || !phone || !contactName) return;
    setIsSubmitted(true);
  };

  return (
    <div className="b2b-page-wolf py-4">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb-nav mb-4">
          <Link to="/">Trang chủ</Link>
          <span>/</span>
          <strong>Bán hàng doanh nghiệp & Giải pháp dự án (B2B)</strong>
        </div>

        {/* Hero Banner */}
        <div className="b2b-hero-card shadow-sm mb-5 text-center">
          <span className="b2b-badge">GIẢI PHÁP GEAR DOANH NGHIỆP</span>
          <h1 className="b2b-title">Trang Bị Thiết Bị Ngoại Vi Chuyên Nghiệp Cho Doanh Nghiệp</h1>
          <p className="b2b-subtitle">
            TechGear Store chuyên cung cấp giải pháp bàn phím cơ, chuột công thái học và màn hình đồ họa số lượng lớn cho công ty phần mềm, studio sáng tạo, ngân hàng và doanh nghiệp hiện đại với mức chiết khấu hấp dẫn và dịch vụ bảo hành tận nơi.
          </p>
        </div>

        {/* Value Props Grid */}
        <div className="b2b-perks-grid mb-5">
          <div className="b2b-perk-card shadow-sm">
            <span className="perk-icon">🏷️</span>
            <h3 className="perk-title">Chiết Khấu Số Lượng Lớn</h3>
            <p className="perk-desc">Mức giá ưu đãi đặc biệt giảm từ 5% đến 25% dựa trên quy mô và giá trị hợp đồng trang bị thiết bị.</p>
          </div>

          <div className="b2b-perk-card shadow-sm">
            <span className="perk-icon">🧾</span>
            <h3 className="perk-title">Hóa Đơn VAT Điện Tử Nhanh</h3>
            <p className="perk-desc">Xuất hóa đơn GTGT điện tử hợp lệ 100% trong vòng 2 giờ sau khi thanh toán hoặc ký hợp đồng bàn giao.</p>
          </div>

          <div className="b2b-perk-card shadow-sm">
            <span className="perk-icon">📦</span>
            <h3 className="perk-title">Mượn Dùng Thử 7 Ngày</h3>
            <p className="perk-desc">Miễn phí gửi sản phẩm mẫu (Demo units) đến văn phòng quý công ty để nhân viên trải nghiệm trước khi quyết định.</p>
          </div>

          <div className="b2b-perk-card shadow-sm">
            <span className="perk-icon">🛠️</span>
            <h3 className="perk-title">Bảo Hành Tận Nơi 24 Tháng</h3>
            <p className="perk-desc">Chuyên viên kỹ thuật TechGear hỗ trợ xử lý sự cố và đổi mới thiết bị tận văn phòng doanh nghiệp trong 24 giờ.</p>
          </div>
        </div>

        {/* Form and Contact Section */}
        <div className="b2b-contact-grid mb-5">
          <div className="b2b-form-col shadow-sm">
            <h2 className="form-heading">Đăng ký nhận báo giá doanh nghiệp</h2>
            <p className="form-subtext">Điền thông tin bên dưới, chuyên viên B2B của chúng tôi sẽ liên hệ lại trong vòng 30 phút:</p>

            {isSubmitted ? (
              <div className="b2b-success-alert">
                <span className="success-icon">✓</span>
                <h3>Cảm ơn quý công ty!</h3>
                <p>
                  Yêu cầu báo giá của <strong>{companyName}</strong> đã được ghi nhận. Chuyên viên dự án của TechGear Store sẽ liên hệ lại với <strong>{contactName}</strong> qua số điện thoại <strong>{phone}</strong> trong vòng 30 phút làm việc.
                </p>
                <button
                  type="button"
                  className="btn-wolf-secondary mt-3"
                  onClick={() => setIsSubmitted(false)}
                >
                  Gửi thêm yêu cầu khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="b2b-form">
                <div className="form-group">
                  <label className="form-label">Tên công ty / Doanh nghiệp *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Công ty TNHH Công Nghệ ABC"
                    className="form-input"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Người liên hệ phụ trách *</label>
                    <input
                      type="text"
                      required
                      placeholder="Họ và tên người liên hệ"
                      className="form-input"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Số điện thoại liên hệ *</label>
                    <input
                      type="tel"
                      required
                      placeholder="Số điện thoại di động"
                      className="form-input"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email công ty (Nhận báo giá PDF)</label>
                  <input
                    type="email"
                    placeholder="example@company.com"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nhu cầu trang bị thiết bị & Số lượng dự kiến</label>
                  <textarea
                    rows={3}
                    placeholder="VD: Cần 30 bộ chuột công thái học MX Master 3S và 30 bàn phím cơ Keychron K2 Pro cho đội ngũ kỹ sư phần mềm..."
                    className="form-textarea"
                    value={productNeeds}
                    onChange={(e) => setProductNeeds(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn-wolf-primary full-width mt-2">
                  🚀 Nhận báo giá chiết khấu doanh nghiệp ngay
                </button>
              </form>
            )}
          </div>

          <div className="b2b-direct-contact-col shadow-sm">
            <h3 className="direct-heading">Bộ Phận Kinh Doanh Dự Án B2B</h3>
            <p className="direct-desc">Quý đối tác cần tư vấn nhanh dự án hoặc ký kết hợp đồng cung cấp thiết bị ngoại vi:</p>

            <div className="direct-item">
              <span className="item-icon">📞</span>
              <div>
                <strong>Hotline Dự Án Doanh Nghiệp:</strong>
                <p><a href="tel:19006750">1900 6750 (Nhánh 2)</a></p>
              </div>
            </div>

            <div className="direct-item">
              <span className="item-icon">📱</span>
              <div>
                <strong>Zalo Quản Lý Khách Hàng Doanh Nghiệp:</strong>
                <p><a href="https://zalo.me/0335744258" target="_blank" rel="noreferrer">0335.744.258 (Mr. Tuấn)</a></p>
              </div>
            </div>

            <div className="direct-item">
              <span className="item-icon">✉️</span>
              <div>
                <strong>Hộp thư báo giá dự án:</strong>
                <p><strong>b2b@techgear.vn</strong></p>
              </div>
            </div>

            <div className="direct-item">
              <span className="item-icon">🏢</span>
              <div>
                <strong>Trụ sở giao dịch:</strong>
                <p>70 Lữ Gia, Phường 15, Quận 11, TP. Hồ Chí Minh</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
