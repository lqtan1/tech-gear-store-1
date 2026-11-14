export default function TrustBar() {
  const commitments = [
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="3" width="15" height="13" rx="2" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      ),
      title: 'FREESHIP TOÀN QUỐC',
      subtitle: 'Đơn hàng từ 500.000đ',
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ),
      title: 'BẢO HÀNH CHÍNH HÃNG',
      subtitle: '24 tháng tận nơi, 1 đổi 1',
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
      ),
      title: 'ĐỔI TRẢ DỄ DÀNG',
      subtitle: 'Linh hoạt trong 30 ngày',
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      ),
      title: 'HỖ TRỢ KỸ THUẬT 24/7',
      subtitle: 'Hotline 1900 6750',
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      ),
      title: 'THANH TOÁN AN TOÀN',
      subtitle: 'Bảo mật VietQR & Visa',
    },
  ];

  return (
    <div className="wolf-trust-wrapper">
      <div className="container">
        <div className="trust-grid">
          {commitments.map((item, index) => (
            <div className="trust-card" key={index}>
              <div className="trust-icon">{item.icon}</div>
              <div className="trust-content">
                <strong className="trust-title">{item.title}</strong>
                <span className="trust-subtitle">{item.subtitle}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
