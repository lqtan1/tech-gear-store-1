import { getMockProductImages } from '../products/utils';
import type { NewsArticle } from './types';

export const newsArticles: NewsArticle[] = [
  {
    id: 1,
    title: 'Top 5 bàn phím cơ êm ái cho dân văn phòng và lập trình viên 2026',
    slug: 'top-5-ban-phim-co-em-ai-van-phong-lap-trinh-vien',
    date: '26 Tháng 10, 2026',
    category: 'Đánh giá',
    coverImage: getMockProductImages(2)[0],
    excerpt: 'Tổng hợp những mẫu bàn phím cơ có cảm giác gõ mượt mà, âm thanh đầm ấm, gasket mount cách âm và khả năng kết nối không dây đa thiết bị cho công việc bền bỉ.',
    readTime: '6 phút đọc',
    author: {
      name: 'Nguyễn Minh Tuấn',
      role: 'Chuyên gia Gear & Custom Keyboard',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    },
    relatedProductId: 2,
    tags: ['Bàn phím cơ', 'Keychron', 'NuPhy', 'Lập trình viên', 'Văn phòng'],
    content: {
      intro: 'Đối với những ai phải gõ máy tính từ 8 đến 10 tiếng mỗi ngày như lập trình viên, biên tập viên hay chuyên viên tài chính, một chiếc bàn phím cơ êm ái, đầm chắc không chỉ nâng cao tốc độ gõ phím mà còn bảo vệ các khớp ngón tay khỏi tình trạng mỏi mệt lâu dài. Dưới đây là 5 mẫu bàn phím cơ dẫn đầu xu hướng năm 2026.',
      sections: [
        {
          heading: '1. Keychron K2 Pro QMK/VIA – Chuẩn mực công thái học cho Mac & Windows',
          text: 'Keychron K2 Pro là bản nâng cấp vượt bậc với layout 75% gọn gàng nhưng vẫn giữ đầy đủ hàng phím F và cụm điều hướng. Khả năng kết nối Bluetooth 5.1 cùng lúc 3 thiết bị và chuyển đổi nhanh giữa macOS/Windows giúp không gian làm việc luôn thông minh và không vướng víu dây cáp.',
          image: getMockProductImages(2)[1],
          quote: 'Cảm giác gõ đầm ấm nhờ foam tiêu âm silicone đúc nguyên khối bên trong giúp triệt tiêu tiếng vang kim loại khó chịu.',
          bullets: [
            'Hỗ trợ custom keymap chuyên sâu qua trình duyệt web bằng phần mềm QMK/VIA.',
            'Keycap PBT OSA profile chịu mòn cực tốt, không bị bóng nhờn sau nhiều năm sử dụng.',
            'Switch Gateron Pro được lube sẵn tại nhà máy, cho hành trình phím mượt mà không sạn.',
          ],
        },
        {
          heading: '2. NuPhy Air75 V2 – Bàn phím cơ siêu mỏng cho phong cách làm việc di động',
          text: 'Nếu bạn là người thường xuyên mang laptop ra quán cà phê hoặc đi công tác, NuPhy Air75 V2 với thiết kế low-profile siêu mỏng là chân ái. Cụm phím mỏng giảm thiểu góc nâng cổ tay, loại bỏ hoàn toàn nhu cầu sử dụng kê tay rời.',
          bullets: [
            'Độ dày chỉ 13.5mm tại điểm mỏng nhất, dễ dàng bỏ gọn vào balo cùng laptop.',
            'Polling rate 1000Hz ở chế độ kết nối 2.4GHz không dây cho độ phản hồi tương đương dây cắm.',
            'Pin 4.000mAh bền bỉ lên đến 220 giờ làm việc liên tục khi tắt đèn nền LED.',
          ],
        },
        {
          heading: '3. MonsGeek M1W V3 – Vỏ nhôm CNC cao cấp và cấu trúc Gasket Mount',
          text: 'Với những người dùng yêu thích âm thanh gõ dạng "thocky" trầm bổng và trọng lượng đầm chắc để phím không xê dịch trên bàn làm việc, MonsGeek M1W V3 là lựa chọn hàng đầu phân khúc dưới 3 triệu đồng.',
          quote: 'Khung nhôm anodized nguyên khối cho cảm giác sang trọng và đẳng cấp ngang tầm các mẫu custom phím cao cấp hàng chục triệu.',
        },
      ],
      conclusion: 'Đầu tư vào một chiếc bàn phím cơ chất lượng cao là quyết định thông minh cho năng suất làm việc và sức khỏe đôi tay. Tùy theo nhu cầu di chuyển hay cố định tại văn phòng, bạn có thể chọn Keychron K2 Pro để tối ưu đa nền tảng hoặc NuPhy Air75 V2 cho sự gọn nhẹ tối đa.',
    },
  },
  {
    id: 2,
    title: 'Chuột công thái học vs chuột truyền thống: Bí quyết bảo vệ cổ tay cho dân công nghệ',
    slug: 'chuot-cong-thai-hoc-vs-chuot-truyen-thong-bao-ve-co-tay',
    date: '24 Tháng 10, 2026',
    category: 'Công thái học',
    coverImage: getMockProductImages(1)[0],
    excerpt: 'Tìm hiểu cơ chế giải phóng áp lực thần kinh giữa và giảm 20% căng cơ cánh tay khi chuyển đổi sang góc cầm tự nhiên với chuột công thái học chuyên dụng.',
    readTime: '5 phút đọc',
    author: {
      name: 'BS. Lê Hoàng Nam',
      role: 'Cố vấn Ergonomics & Y học vận động',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    },
    relatedProductId: 1,
    tags: ['Chuột công thái học', 'Logitech MX Master', 'Sức khỏe', 'Setup tối giản'],
    content: {
      intro: 'Hội chứng ống cổ tay (Carpal Tunnel Syndrome) đang trở thành "căn bệnh thời đại" đối với những người làm việc trước máy vi tính. Việc xoay úp bàn tay liên tục trên những con chuột phẳng truyền thống tạo ra áp lực đè nén lên dây thần kinh giữa và các bó gân gập ngón.',
      sections: [
        {
          heading: 'Góc nghiêng tự nhiên: Điểm tựa giải phóng căng thẳng cơ học',
          text: 'Chuột công thái học được thiết kế dựa trên tư thế bắt tay tự nhiên (handshake position) của con người với góc nghiêng khoảng 57 độ. Khi giữ tư thế này, hai xương cẳng tay (xương quay và xương trụ) nằm song song tự nhiên chứ không bị vặn chéo như khi dùng chuột dẹt.',
          quote: 'Các nghiên cứu y sinh học chỉ ra rằng chuột dáng công thái học giúp giảm tới 20% hoạt động cơ bắp không cần thiết ở vùng cẳng tay và cổ tay.',
          bullets: [
            'Hạn chế tối đa tình trạng chai sạn cổ tay do cọ xát với mặt bàn.',
            'Đỡ toàn bộ lòng bàn tay với đệm ngón cái mở rộng, giảm sức ép trọng lượng bàn tay.',
            'Các nút bấm được bố trí theo góc với ngón tay giúp bấm nhẹ hơn, không cần gồng cơ.',
          ],
        },
        {
          heading: 'Logitech MX Master 3S – Đỉnh cao của chuột công thái học hiện đại',
          text: 'Không chỉ sở hữu hình thể nâng đỡ lòng bàn tay tuyệt vời, MX Master 3S còn trang bị con lăn điện từ MagSpeed cuộn 1.000 dòng trong 1 giây nhưng dừng chính xác đến từng pixel khi cần. Nút bấm Silent Switches giảm 90% tiếng ồn click, giữ cho không gian làm việc luôn yên tĩnh.',
          image: getMockProductImages(1)[2],
          bullets: [
            'Cảm biến Darkfield 8.000 DPI hoạt động mượt mà trên mọi bề mặt, kể cả mặt kính trong suốt.',
            'Con lăn phụ cạnh ngón cái cuộn ngang timeline video hoặc bảng tính Excel hàng nghìn cột cực kỳ nhẹ nhàng.',
            'Thời lượng pin 70 ngày chỉ với một lần sạc USB-C và tính năng sạc nhanh 1 phút dùng cả ngày.',
          ],
        },
      ],
      conclusion: 'Nếu bạn bắt đầu cảm thấy tê nhẹ đầu ngón tay hoặc mỏi cơ cánh tay sau một ngày làm việc dài, việc nâng cấp lên một con chuột công thái học đạt chuẩn như Logitech MX Master 3S chính là khoản đầu tư quý giá nhất cho sức khỏe thể chất lâu dài của bạn.',
    },
  },
  {
    id: 3,
    title: 'Cách chọn màn hình đồ họa chuẩn màu cho dân thiết kế & sáng tạo nội dung',
    slug: 'cach-chon-man-hinh-do-hoa-chuan-mau-sang-tao-noi-dung',
    date: '20 Tháng 10, 2026',
    category: 'Hướng dẫn',
    coverImage: getMockProductImages(3)[0],
    excerpt: 'Tiêu chí độ bao phủ màu sRGB, DCI-P3, độ sai lệch màu Delta E < 2, độ tương phản IPS Black và cổng kết nối USB-C Power Delivery 90W một dây tiện lợi.',
    readTime: '7 phút đọc',
    author: {
      name: 'Trần Đăng Khoa',
      role: 'Art Director & Visual Designer',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    },
    relatedProductId: 3,
    tags: ['Màn hình', 'Dell UltraSharp', 'Thiết kế đồ họa', 'Chuẩn màu sRGB', 'USB-C Hub'],
    content: {
      intro: 'Đối với một nhà thiết kế đồ họa, nhiếp ảnh gia hay người dựng phim, màu sắc hiển thị trên màn hình chính là "ngôn ngữ" giao tiếp tác phẩm với người xem. Một chiếc màn hình sai lệch màu có thể khiến sản phẩm in ấn bị lệch tông hoặc video đăng tải trên các nền tảng mạng xã hội không đạt hiệu ứng mong muốn.',
      sections: [
        {
          heading: '1. Không gian màu và chỉ số sai lệch Delta E (ΔE)',
          text: 'Màn hình chuyên nghiệp cần đạt tối thiểu 99% dải màu sRGB cho ấn phẩm số trên web và 95% - 98% DCI-P3 cho dựng phim điện ảnh. Đặc biệt, chỉ số sai lệch màu sắc Delta E phải nhỏ hơn 2 (ΔE < 2), nghĩa là mắt người thông thường không thể nhận biết được sự sai lệch sắc thái.',
          quote: 'Mỗi chiếc màn hình Dell UltraSharp khi xuất xưởng đều được cân chỉnh màu (Factory Calibrated) kèm chứng chỉ kiểm định chất lượng riêng biệt trong hộp.',
        },
        {
          heading: '2. Công nghệ tấm nền IPS Black – Bước tiến về độ tương phản',
          text: 'Nhược điểm cố hữu của màn hình IPS truyền thống là độ tương phản chỉ ở mức 1000:1, khiến các vùng tối có xu hướng bị ám xám. Với công nghệ IPS Black mới nhất trên các mẫu cao cấp, độ tương phản đạt tới 2000:1, mang lại sắc đen sâu thẳm và chi tiết rõ rệt trong vùng tối.',
          bullets: [
            'Góc nhìn siêu rộng 178/178 độ mà không bị biến đổi màu sắc dù nhìn nghiêng.',
            'Lớp phủ chống chói tán xạ ánh sáng tự nhiên, bảo vệ mắt khi làm việc ban ngày.',
            'Độ sâu màu 1.07 tỷ màu (10-bit), loại bỏ hoàn toàn hiện tượng dải màu bị gãy khúc (color banding).',
          ],
        },
        {
          heading: '3. Kết nối USB-C Type-C 90W: Một sợi cáp cho tất cả',
          text: 'Thời đại của mớ dây nhợ lằng nhằng đã qua. Một cổng USB-C chuẩn Power Delivery 90W trên màn hình cho phép vừa truyền tín hiệu hình ảnh 4K HDR, vừa sạc nhanh cho MacBook/laptop, vừa biến màn hình thành USB Hub kết nối chuột, bàn phím và tai nghe.',
        },
      ],
      conclusion: 'Màn hình là cửa sổ thị giác quan trọng nhất trên bàn làm việc của bạn. Hãy ưu tiên độ phân giải 4K cùng tấm nền chuẩn màu như Dell UltraSharp 27 inch 4K IPS để mọi ý tưởng sáng tạo được hiển thị chân thực và sắc nét đến từng đường nét.',
    },
  },
  {
    id: 4,
    title: 'Đánh giá tai nghe chống ồn Sony WH-1000XM5: Tối ưu không gian làm việc tập trung',
    slug: 'danh-gia-tai-nghe-chong-on-sony-wh1000xm5',
    date: '18 Tháng 10, 2026',
    category: 'Đánh giá',
    coverImage: getMockProductImages(4)[0],
    excerpt: 'Trải nghiệm thực tế công nghệ khử ồn kép Auto NC Optimizer trong văn phòng mở ồn ào và quán cà phê, khả năng đàm thoại 8 micro lọc gió và chất âm chuẩn Hi-Res Audio.',
    readTime: '6 phút đọc',
    author: {
      name: 'Vũ Hải Đăng',
      role: 'Reviewer m thanh & Thiết bị công nghệ',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80',
    },
    relatedProductId: 4,
    tags: ['Tai nghe', 'Sony WH-1000XM5', 'Chống ồn ANC', 'Hi-Res Audio'],
    content: {
      intro: 'Trong thời đại văn phòng mở (open space) và xu hướng làm việc linh hoạt từ quán cà phê, tiếng ồn trò chuyện, tiếng còi xe và tiếng bàn phím gõ lách cách là kẻ thù số một của sự tập trung. Sony WH-1000XM5 ra đời để định nghĩa lại sự yên tĩnh tuyệt đối.',
      sections: [
        {
          heading: 'Khả năng chống ồn vô song với 2 vi xử lý và 8 micro chuyên dụng',
          text: 'Sony trang bị bộ đôi chip V1 và QN1 độc quyền, kiểm soát 8 micro thu âm liên tục để phân tích tần số âm thanh từ môi trường xung quanh và tạo ra sóng âm triệt tiêu theo thời gian thực.',
          quote: 'Chỉ cần đeo tai nghe lên và bật tính năng chống ồn ANC, cả thế giới ồn ào dường như lập tức lùi lại sau cánh cửa cách âm dày dặn.',
          bullets: [
            'Auto NC Optimizer tự động điều chỉnh mức độ chống ồn theo áp suất khí quyển và kiểu tóc/kính đeo của bạn.',
            'Cảm giác đeo êm ái như mây với đệm da mềm Soft Fit Leather thế hệ mới ôm khít vành tai.',
            'Chất âm Hi-Res Audio không dây đỉnh cao qua codec Sony LDAC truyền tải lượng dữ liệu gấp 3 lần Bluetooth thông thường.',
          ],
        },
      ],
      conclusion: 'Nếu bạn cần một không gian tĩnh lặng tuyệt đối để bước vào trạng thái dòng chảy tập trung cao độ (Deep Work), Sony WH-1000XM5 chắc chắn là người bạn đồng hành không thể thay thế.',
    },
  },
  {
    id: 5,
    title: 'So sánh chuột siêu nhẹ dưới 60g: Razer DeathAdder V3 Pro vs Logitech Superlight 2',
    slug: 'so-sanh-chuot-gaming-sieu-nhe-deathadder-v3-pro-superlight-2',
    date: '15 Tháng 10, 2026',
    category: 'Đánh giá',
    coverImage: getMockProductImages(8)[0],
    excerpt: 'Hai "ông hoàng" chuột thi đấu Esports đối đầu trực tiếp: Cảm biến Focus Pro 30K vs HERO 2 32.000 DPI, switch quang học chống double-click và độ trễ phản hồi dưới 0.25ms.',
    readTime: '8 phút đọc',
    author: {
      name: 'Nguyễn Minh Tuấn',
      role: 'Chuyên gia Gear & Custom Keyboard',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    },
    relatedProductId: 8,
    tags: ['Chuột gaming', 'Logitech G Pro', 'Razer DeathAdder', 'Esports', 'DPI'],
    content: {
      intro: 'Trọng lượng nhẹ không chỉ là xu hướng nhất thời mà đã trở thành tiêu chuẩn vàng của các vận động viên thể thao điện tử chuyên nghiệp. Ở mức cân nặng 60 gram, đôi tay bạn di chuyển vẩy chuột (flick shot) nhanh hơn và cổ tay ít chịu quán tính dư thừa.',
      sections: [
        {
          heading: 'Thiết kế công thái học bất đối xứng vs Dáng đối xứng cân bằng',
          text: 'Razer DeathAdder V3 Pro sở hữu form cầm công thái học kinh điển tối ưu cho kiểu cầm Palm grip và Claw grip tay phải, trong khi Logitech G Pro X Superlight 2 lại mang thiết kế đối xứng an toàn, phù hợp với hầu hết mọi kích thước bàn tay.',
          bullets: [
            'DeathAdder V3 Pro: Nặng 63g, cảm biến Focus Pro 30K, switch quang Gen 3 không bao giờ bị lỗi double click.',
            'Superlight 2: Nặng 60g, switch hybrid cơ quang LIGHTFORCE, cảm biến HERO 2 hỗ trợ Polling Rate lên đến 4.000Hz.',
          ],
        },
      ],
      conclusion: 'Cả hai mẫu chuột đều đại diện cho công nghệ đỉnh cao nhất thế giới chuột gaming hiện nay. Nếu bạn thích form cầm ôm lòng bàn tay, hãy chọn Razer DeathAdder V3 Pro; nếu bạn cần sự linh hoạt tuyệt đối cho mọi góc cầm, Logitech Superlight 2 là người chiến thắng.',
    },
  },
  {
    id: 6,
    title: 'Cẩm nang tối ưu góc làm việc Minimalist: Đẹp mắt, công năng và ngăn nắp',
    slug: 'cam-nang-toi-uu-goc-lam-viec-minimalist',
    date: '10 Tháng 10, 2026',
    category: 'Mẹo công nghệ',
    coverImage: getMockProductImages(7)[1],
    excerpt: 'Cách lựa chọn arm màn hình nâng đỡ không trọng lực, khay giấu dây thông minh, lót chuột da lộn và kết hợp đèn chiếu sáng màn hình bảo vệ mắt.',
    readTime: '5 phút đọc',
    author: {
      name: 'Trần Đăng Khoa',
      role: 'Art Director & Visual Designer',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    },
    relatedProductId: 3,
    tags: ['Workspace', 'Minimalist', 'Setup bàn làm việc', 'Ngoại vi'],
    content: {
      intro: 'Một chiếc bàn làm việc gọn gàng, sạch sẽ không chỉ đem lại tính thẩm mỹ cao mà còn trực tiếp giải phóng tâm trí, giúp bạn giảm tải căng thẳng và kích hoạt sự sáng tạo tối đa.',
      sections: [
        {
          heading: 'Nguyên tắc "Không dây thừa" trên mặt bàn',
          text: 'Tất cả các thiết bị ngoại vi hiện đại như chuột, bàn phím và tai nghe đều đã có phiên bản không dây tốc độ cao ngang ngửa dây cắm. Hãy tận dụng khay đi dây kẹp gầm bàn kết hợp sạc không dây nam châm để giữ mặt bàn luôn phẳng phiu.',
        },
      ],
      conclusion: 'Góc làm việc là nơi bạn dành một phần ba cuộc đời mỗi ngày. Hãy chăm chút cho từng món đồ ngoại vi để mỗi ngày ngồi vào bàn đều là một niềm cảm hứng bất tận.',
    },
  },
];

export function listNews(category?: string, query?: string): NewsArticle[] {
  const normCategory = category?.trim().toLowerCase();
  const normQuery = query?.trim().toLowerCase();

  return newsArticles.filter((article) => {
    const matchesCategory =
      !normCategory ||
      normCategory === 'tất cả' ||
      article.category.toLowerCase() === normCategory;

    const matchesQuery =
      !normQuery ||
      article.title.toLowerCase().includes(normQuery) ||
      article.excerpt.toLowerCase().includes(normQuery) ||
      article.tags.some((tag) => tag.toLowerCase().includes(normQuery));

    return matchesCategory && matchesQuery;
  });
}

export function getNewsById(id: number): NewsArticle | undefined {
  return newsArticles.find((article) => article.id === id);
}

export function getFeaturedNews(): NewsArticle {
  return newsArticles[0];
}

export function getRelatedNews(currentId: number, limit = 3): NewsArticle[] {
  return newsArticles.filter((article) => article.id !== currentId).slice(0, limit);
}

