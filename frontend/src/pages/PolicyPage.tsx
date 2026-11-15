import { Link, useParams } from 'react-router';

interface PolicyItem {
  slug: string;
  title: string;
  badge: string;
  icon: string;
  summary: string;
  sections: {
    heading: string;
    points: string[];
  }[];
}

const POLICIES: Record<string, PolicyItem> = {
  'bao-hanh': {
    slug: 'bao-hanh',
    title: 'Chính Sách Bảo Hành 24 Tháng 1 Đổi 1',
    badge: 'BẢO HÀNH CHÍNH HÃNG 24T',
    icon: '🛡️',
    summary:
      'Tại TechGear Store, toàn bộ sản phẩm chuột, bàn phím cơ, màn hình và tai nghe được áp dụng chính sách bảo hành 24 tháng chính hãng, cam kết 1 đổi 1 ngay lập tức trong 30 ngày đầu tiên nếu phát sinh lỗi phần cứng từ nhà sản xuất.',
    sections: [
      {
        heading: '1. Điều kiện áp dụng bảo hành',
        points: [
          'Sản phẩm được mua trực tiếp tại TechGear Store (cửa hàng hoặc website techgear.vn), có số điện thoại đặt hàng hoặc hóa đơn điện tử.',
          'Tem niêm phong, số serial / barcode trên thân máy và hộp còn nguyên vẹn, không bị tẩy xóa hoặc rách nát.',
          'Hư hỏng do lỗi kỹ thuật của nhà sản xuất: liệt switch bàn phím, chập mạch vi xử lý, mắt đọc chuột không nhận tín hiệu, màn hình xuất hiện điểm chết (từ 3 điểm chết trở lên), pin không sạc được.',
        ],
      },
      {
        heading: '2. Các trường hợp từ chối bảo hành miễn phí',
        points: [
          'Sản phẩm bị rơi vỡ, móp méo, nứt vỏ, đứt cáp tín hiệu do tác động ngoại lực trong quá trình sử dụng.',
          'Sản phẩm bị vào nước, ẩm mốc, chập cháy do nguồn điện không ổn định hoặc sử dụng củ sạc nhanh công suất quá mức quy định của nhà sản xuất.',
          'Khách hàng tự ý tháo mở, mod switch, thay vỏ, can thiệp vào mạch in (PCB) mà không có hướng dẫn từ kỹ thuật viên TechGear.',
        ],
      },
      {
        heading: '3. Quy trình tiếp nhận & xử lý bảo hành siêu tốc',
        points: [
          'Bước 1: Quý khách gọi Hotline 1900 6750 hoặc nhắn tin Zalo 0335.744.258 để kỹ thuật viên kiểm tra sơ bộ từ xa.',
          'Bước 2: Gửi sản phẩm về Showroom 70 Lữ Gia, P. 15, Q. 11, TP. HCM (TechGear hỗ trợ phí ship 2 chiều trong 30 ngày đầu).',
          'Bước 3: Phòng kỹ thuật kiểm định trong vòng 24 - 48 giờ làm việc và thông báo kết quả đổi mới hoặc sửa chữa.',
        ],
      },
    ],
  },
  'van-chuyen': {
    slug: 'van-chuyen',
    title: 'Chính Sách Vận Chuyển Siêu Tốc',
    badge: 'GIAO HỎA TỐC 2H - FREESHIP TỪ 500K',
    icon: '🚀',
    summary:
      'TechGear Store hợp tác cùng các đối tác vận chuyển uy tín (AhaMove, GrabExpress, Viettel Post, GHTK) để mang sản phẩm đến tay khách hàng nhanh nhất, an toàn nhất và hoàn toàn miễn phí vận chuyển cho đơn hàng từ 500.000đ.',
    sections: [
      {
        heading: '1. Thời gian giao hàng cam kết',
        points: [
          'Giao Hỏa Tốc 2 Giờ: Áp dụng tại khu vực nội thành TP. Hồ Chí Minh cho đơn đặt từ 8:00 đến 18:00 hàng ngày.',
          'Giao Nhanh Toàn Quốc (24 - 48h): Áp dụng cho các tỉnh thành trên cả nước thông qua Viettel Post hoặc GHTK.',
          'Đơn hàng ngoại thành hoặc vùng xa: Thời gian nhận hàng dự kiến từ 2 - 3 ngày làm việc.',
        ],
      },
      {
        heading: '2. Biểu phí vận chuyển',
        points: [
          'FREESHIP 100%: Dành cho tất cả các đơn hàng có giá trị thanh toán từ 500.000đ trở lên.',
          'Đơn hàng dưới 500.000đ: Đồng giá 25.000đ cho khu vực nội thành TP. HCM và 35.000đ cho các tỉnh thành khác.',
          'Dịch vụ Hỏa Tốc 2h TP. HCM: Hỗ trợ tối đa 40.000đ phí ship, khách hàng chỉ thanh toán phần chênh lệch (nếu có).',
        ],
      },
      {
        heading: '3. Quy định đồng kiểm khi nhận hàng',
        points: [
          'Quý khách có quyền mở bưu kiện kiểm tra ngoại quan (đúng mẫu mã, màu sắc, nguyên vẹn hộp) trước khi ký nhận.',
          'Nếu phát hiện hộp hàng bị rách nát, biến dạng hoặc ướt nước, quý khách vui lòng từ chối nhận hàng và gọi ngay Hotline 1900 6750.',
        ],
      },
    ],
  },
  'doi-tra': {
    slug: 'doi-tra',
    title: 'Chính Sách Đổi Trả Trong 30 Ngày',
    badge: '30 NGÀY ĐỔI MỚI AN TÂM',
    icon: '🔄',
    summary:
      'Nhằm mang lại trải nghiệm mua sắm an tâm tuyệt đối, TechGear Store hỗ trợ khách hàng đổi mới sản phẩm miễn phí trong vòng 30 ngày kể từ ngày nhận hàng nếu gặp lỗi do nhà sản xuất hoặc đổi sang mẫu khác nếu chưa ưng ý.',
    sections: [
      {
        heading: '1. Chính sách đổi sản phẩm',
        points: [
          'Đổi mới 100% trong 30 ngày đầu: Áp dụng khi sản phẩm phát sinh lỗi phần cứng từ nhà sản xuất.',
          'Đổi sang mẫu khác theo nhu cầu (trong 7 ngày): Sản phẩm phải còn nguyên vẹn 100%, chưa qua sử dụng, đầy đủ hộp, sách hướng dẫn và phụ kiện kèm theo.',
          'Giá trị sản phẩm đổi mới phải bằng hoặc cao hơn sản phẩm đã mua (khách hàng bù phần chênh lệch giá).',
        ],
      },
      {
        heading: '2. Chính sách hoàn tiền',
        points: [
          'Hoàn tiền 100% nếu sản phẩm phát sinh lỗi phần cứng nhưng TechGear Store không còn sản phẩm tương đương để đổi mới và khách hàng không đồng ý đổi sang mẫu khác.',
          'Thời gian hoàn tiền: Từ 1 - 3 ngày làm việc qua tài khoản ngân hàng hoặc ví điện tử của quý khách.',
        ],
      },
    ],
  },
  'bao-mat': {
    slug: 'bao-mat',
    title: 'Bảo Mật Thông Tin Khách Hàng',
    badge: 'BẢO MẬT TUYỆT ĐỐI THEO CHUẨN SSL',
    icon: '🔒',
    summary:
      'TechGear Store cam kết bảo vệ tuyệt đối thông tin cá nhân của quý khách hàng theo quy định của pháp luật Việt Nam. Chúng tôi không bao giờ bán, cho thuê hoặc chia sẻ dữ liệu của khách hàng cho bất kỳ bên thứ ba nào.',
    sections: [
      {
        heading: '1. Mục đích thu thập thông tin',
        points: [
          'Xử lý đơn hàng: Họ tên, số điện thoại, địa chỉ nhận hàng để giao hàng chính xác.',
          'Chăm sóc khách hàng và bảo hành: Cập nhật tình trạng đơn, tra cứu thời hạn bảo hành điện tử.',
          'Gửi thông báo ưu đãi đặc quyền (chỉ gửi khi khách hàng đăng ký nhận tin khuyến mãi).',
        ],
      },
      {
        heading: '2. Cam kết bảo mật kỹ thuật',
        points: [
          'Mọi giao dịch trên website đều được mã hóa theo tiêu chuẩn an toàn SSL/TLS 256-bit.',
          'Hệ thống lưu trữ dữ liệu an toàn trên nền tảng Supabase với chính sách Row Level Security (RLS) bảo vệ từng tài khoản.',
          'TechGear Store không lưu giữ thông tin thẻ tín dụng hay mật khẩu ngân hàng của khách hàng.',
        ],
      },
    ],
  },
  'dieu-khoan': {
    slug: 'dieu-khoan',
    title: 'Quy Định & Điều Khoản Sử Dụng',
    badge: 'ĐIỀU KHOẢN MUA BÁN MINH BẠCH',
    icon: '📜',
    summary:
      'Khi truy cập và đặt mua sản phẩm tại TechGear Store, quý khách đồng ý tuân thủ các quy định và điều khoản dưới đây nhằm đảm bảo quyền lợi hợp pháp của cả hai bên.',
    sections: [
      {
        heading: '1. Quy định về tài khoản & đơn hàng',
        points: [
          'Khách hàng chịu trách nhiệm cung cấp thông tin liên hệ chính xác (SĐT, địa chỉ) để đơn hàng được giao đúng hạn.',
          'TechGear Store có quyền xác minh đơn hàng qua điện thoại trước khi xuất kho đối với các đơn hàng giá trị cao.',
          'Giá hiển thị trên website là giá bán lẻ cuối cùng đã bao gồm thuế GTGT (VAT) theo quy định hiện hành.',
        ],
      },
      {
        heading: '2. Quyền sở hữu trí tuệ',
        points: [
          'Tất cả hình ảnh, logo, bài viết đánh giá và nội dung trên website đều thuộc quyền sở hữu của TechGear Store hoặc được ủy quyền từ các hãng đối tác.',
          'Nghiêm cấm sao chép, chỉnh sửa hoặc phát tán nội dung vì mục đích thương mại khi chưa có sự đồng ý bằng văn bản của TechGear Store.',
        ],
      },
    ],
  },
  'thanh-toan-vietqr': {
    slug: 'thanh-toan-vietqr',
    title: 'Chính Sách Thanh Toán VietQR & Ngân Hàng',
    badge: 'THANH TOÁN THÔNG MINH - TỰ ĐỘNG KHỚP LỆNH',
    icon: '💳',
    summary:
      'TechGear Store hỗ trợ các phương thức thanh toán không tiền mặt hiện đại, nhanh chóng và an toàn tuyệt đối qua chuẩn VietQR Napas247, ví MoMo và thẻ quốc tế Visa / Mastercard.',
    sections: [
      {
        heading: '1. Thanh toán chuyển khoản tự động qua VietQR',
        points: [
          'Hệ thống tự động tạo mã QR động chứa sẵn số tiền và nội dung đơn hàng tương ứng với giỏ hàng của bạn.',
          'Mở ứng dụng ngân hàng bất kỳ (Vietcombank, MB, Techcombank, VPBank, TPBank...) quét mã QR để chuyển khoản tức thì.',
          'Hệ thống tự động xác nhận đã nhận tiền trong vòng 10 giây và chuyển trạng thái đơn hàng sang "Đã thanh toán".',
        ],
      },
      {
        heading: '2. Thanh toán khi nhận hàng (COD)',
        points: [
          'Quý khách thanh toán tiền mặt trực tiếp cho nhân viên giao hàng khi nhận và kiểm tra bưu kiện.',
          'Áp dụng cho tất cả các đơn hàng trên toàn quốc có giá trị dưới 15.000.000đ.',
        ],
      },
    ],
  },
};

export default function PolicyPage() {
  const { slug } = useParams<{ slug?: string }>();
  const activeSlug = slug && POLICIES[slug] ? slug : 'bao-hanh';
  const policy = POLICIES[activeSlug];

  return (
    <div className="policy-page-wolf py-4">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb-nav mb-4">
          <Link to="/">Trang chủ</Link>
          <span>/</span>
          <Link to="/policy/bao-hanh">Chính sách cửa hàng</Link>
          <span>/</span>
          <strong>{policy.title}</strong>
        </div>

        {/* Header Hero */}
        <div className="policy-hero-card shadow-sm mb-4">
          <span className="policy-badge">{policy.badge}</span>
          <h1 className="policy-main-title">
            <span>{policy.icon}</span> {policy.title}
          </h1>
          <p className="policy-summary-lead">{policy.summary}</p>
        </div>

        {/* Layout with Sidebar Tabs */}
        <div className="policy-layout-grid">
          {/* Sidebar Nav */}
          <aside className="policy-sidebar shadow-sm">
            <h3 className="policy-nav-heading">Danh mục chính sách</h3>
            <ul className="policy-nav-list">
              {Object.values(POLICIES).map((item) => (
                <li key={item.slug}>
                  <Link
                    to={`/policy/${item.slug}`}
                    className={`policy-nav-link ${item.slug === activeSlug ? 'active' : ''}`}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-text">{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="policy-hotline-box mt-4">
              <span className="hotline-tag">CẦN HỖ TRỢ NGAY?</span>
              <p className="hotline-desc">Bộ phận CSKH TechGear sẵn sàng giải đáp thắc mắc 24/7:</p>
              <a href="tel:19006750" className="policy-hotline-btn">
                📞 Hotline: 1900 6750
              </a>
              <a
                href="https://zalo.me/0335744258"
                target="_blank"
                rel="noreferrer"
                className="policy-zalo-btn mt-2"
              >
                💬 Chat Zalo hỗ trợ
              </a>
            </div>
          </aside>

          {/* Main Policy Content */}
          <main className="policy-content-article shadow-sm">
            {policy.sections.map((section, idx) => (
              <section key={idx} className="policy-section-block">
                <h2 className="policy-section-title">{section.heading}</h2>
                <ul className="policy-points-list">
                  {section.points.map((pt, pIdx) => (
                    <li key={pIdx}>
                      <span className="point-icon">✓</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            <div className="policy-footer-note mt-4">
              <p>
                * Mọi thắc mắc hoặc trường hợp cần hỗ trợ đặc biệt, quý khách vui lòng liên hệ trực tiếp tại
                showroom: <strong>70 Lữ Gia, P. 15, Q. 11, TP. Hồ Chí Minh</strong> hoặc gọi hotline{' '}
                <strong>1900 6750</strong>. TechGear luôn đồng hành cùng trải nghiệm của bạn!
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
