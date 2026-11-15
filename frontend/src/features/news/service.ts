import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import type { Article, ArticleInput } from './types';

export const formatDateVi = (dateStr?: string): string => {
  if (!dateStr) return 'Mới cập nhật';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    return `${day} Tháng ${month}, ${year}`;
  } catch {
    return dateStr;
  }
};

export const calculateReadTime = (text?: string): string => {
  if (!text) return '4 phút đọc';
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(2, Math.ceil(words / 180));
  return `${minutes} phút đọc`;
};

export interface SupabaseArticleRow {
  id: number;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  image_url: string;
  author?: string | null;
  published_at?: string | null;
  created_at?: string | null;
}

export function mapSupabaseRowToArticle(row: SupabaseArticleRow): Article {
  const publishedAt = row.published_at || new Date().toISOString().split('T')[0];
  const dateVi = formatDateVi(publishedAt);
  const readTime = calculateReadTime(row.content);
  let imageUrl = row.image_url || '/images/akko-5075b-plus-dracula-castle-001-1000x1000.webp';
  if (!imageUrl || imageUrl.includes('hstatic.net')) {
    imageUrl = '/images/akko-5075b-plus-dracula-castle-001-1000x1000.webp';
  }

  return {
    id: Number(row.id),
    title: row.title,
    slug: row.slug,
    category: row.category || 'Đánh giá',
    excerpt: row.excerpt,
    content: row.content,
    image_url: imageUrl,
    coverImage: imageUrl,
    author: row.author || 'TechGear Editorial',
    published_at: publishedAt,
    date: dateVi,
    readTime,
    created_at: row.created_at || undefined,
    tags: [row.category || 'Gear', 'TechGear', 'Công nghệ'],
  };
}

export const MOCK_ARTICLES: Article[] = [
  {
    id: 1,
    title: 'Top 5 bàn phím cơ êm ái cho dân văn phòng và lập trình viên 2026',
    slug: 'top-5-ban-phim-co-em-ai-van-phong-lap-trinh-vien',
    category: 'Đánh giá',
    excerpt: 'Tổng hợp những mẫu bàn phím cơ có cảm giác gõ mượt mà, âm thanh đầm ấm, gasket mount cách âm và khả năng kết nối không dây đa thiết bị cho công việc bền bỉ.',
    image_url: '/images/akko-5075b-plus-dracula-castle-001-1000x1000.webp',
    coverImage: '/images/akko-5075b-plus-dracula-castle-001-1000x1000.webp',
    author: 'Nguyễn Minh Tuấn',
    published_at: '2026-10-26',
    date: '26 Tháng 10, 2026',
    readTime: '6 phút đọc',
    relatedProductId: 2,
    tags: ['Bàn phím cơ', 'Keychron', 'NuPhy', 'Lập trình viên', 'Văn phòng'],
    content: `Đối với những ai phải gõ máy tính từ 8 đến 10 tiếng mỗi ngày như lập trình viên, biên tập viên hay chuyên viên tài chính, một chiếc bàn phím cơ êm ái, đầm chắc không chỉ nâng cao tốc độ gõ phím mà còn bảo vệ các khớp ngón tay khỏi tình trạng mỏi mệt lâu dài. Dưới đây là những mẫu bàn phím cơ dẫn đầu xu hướng năm 2026.

## 1. Keychron K2 Pro QMK/VIA – Chuẩn mực công thái học cho Mac & Windows
Keychron K2 Pro là bản nâng cấp vượt bậc với layout 75% gọn gàng nhưng vẫn giữ đầy đủ hàng phím F và cụm điều hướng. Khả năng kết nối Bluetooth 5.1 cùng lúc 3 thiết bị và chuyển đổi nhanh giữa macOS/Windows giúp không gian làm việc luôn thông minh và không vướng víu dây cáp.
• Hỗ trợ custom keymap chuyên sâu qua trình duyệt web bằng phần mềm QMK/VIA.
• Keycap PBT OSA profile chịu mòn cực tốt, không bị bóng nhờn sau nhiều năm sử dụng.
• Switch Gateron Pro được lube sẵn tại nhà máy, cho hành trình phím mượt mà không sạn.
> Cảm giác gõ đầm ấm nhờ foam tiêu âm silicone đúc nguyên khối bên trong giúp triệt tiêu tiếng vang kim loại khó chịu.

## 2. NuPhy Air75 V2 – Bàn phím cơ siêu mỏng cho phong cách làm việc di động
Nếu bạn là người thường xuyên mang laptop ra quán cà phê hoặc đi công tác, NuPhy Air75 V2 với thiết kế low-profile siêu mỏng là chân ái. Cụm phím mỏng giảm thiểu góc nâng cổ tay, loại bỏ hoàn toàn nhu cầu sử dụng kê tay rời.
• Độ dày chỉ 13.5mm tại điểm mỏng nhất, dễ dàng bỏ gọn vào balo cùng laptop.
• Polling rate 1000Hz ở chế độ kết nối 2.4GHz không dây cho độ phản hồi tương đương dây cắm.
• Pin 4.000mAh bền bỉ lên đến 220 giờ làm việc liên tục khi tắt đèn nền LED.

## 3. MonsGeek M1W V3 – Vỏ nhôm CNC cao cấp và cấu trúc Gasket Mount
Với những người dùng yêu thích âm thanh gõ dạng "thocky" trầm bổng và trọng lượng đầm chắc để phím không xê dịch trên bàn làm việc, MonsGeek M1W V3 là lựa chọn hàng đầu phân khúc dưới 3 triệu đồng.
> Khung nhôm anodized nguyên khối cho cảm giác sang trọng và đẳng cấp ngang tầm các mẫu custom phím cao cấp hàng chục triệu.

## Lời kết từ TechGear
Đầu tư vào một chiếc bàn phím cơ chất lượng cao là quyết định thông minh cho năng suất làm việc và sức khỏe đôi tay. Tùy theo nhu cầu di chuyển hay cố định tại văn phòng, bạn có thể chọn Keychron K2 Pro để tối ưu đa nền tảng hoặc NuPhy Air75 V2 cho sự gọn nhẹ tối đa.`,
  },
  {
    id: 2,
    title: 'Chuột công thái học vs chuột truyền thống: Bí quyết bảo vệ cổ tay cho dân công nghệ',
    slug: 'chuot-cong-thai-hoc-vs-chuot-truyen-thong-bao-ve-co-tay',
    category: 'Công thái học',
    excerpt: 'Tìm hiểu cơ chế giải phóng áp lực thần kinh giữa và giảm 20% căng cơ cánh tay khi chuyển đổi sang góc cầm tự nhiên với chuột công thái học chuyên dụng.',
    image_url: 'https://resource.logitech.com/w_1200,c_limit,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/logitech/en/products/mice/mx-master-3s/gallery/mx-master-3s-mouse-top-view-graphite.png',
    coverImage: 'https://resource.logitech.com/w_1200,c_limit,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/logitech/en/products/mice/mx-master-3s/gallery/mx-master-3s-mouse-top-view-graphite.png',
    author: 'BS. Lê Hoàng Nam',
    published_at: '2026-10-24',
    date: '24 Tháng 10, 2026',
    readTime: '5 phút đọc',
    relatedProductId: 1,
    tags: ['Chuột công thái học', 'Logitech MX Master', 'Sức khỏe', 'Setup tối giản'],
    content: `Hội chứng ống cổ tay (Carpal Tunnel Syndrome) đang trở thành "căn bệnh thời đại" đối với những người làm việc trước máy vi tính. Việc xoay úp bàn tay liên tục trên những con chuột phẳng truyền thống tạo ra áp lực đè nén lên dây thần kinh giữa và các bó gân gập ngón.

## Góc nghiêng tự nhiên: Điểm tựa giải phóng căng thẳng cơ học
Chuột công thái học được thiết kế dựa trên tư thế bắt tay tự nhiên (handshake position) của con người với góc nghiêng khoảng 57 độ. Khi giữ tư thế này, hai xương cẳng tay (xương quay và xương trụ) nằm song song tự nhiên chứ không bị vặn chéo như khi dùng chuột dẹt.
• Hạn chế tối đa tình trạng chai sạn cổ tay do cọ xát với mặt bàn.
• Đỡ toàn bộ lòng bàn tay với đệm ngón cái mở rộng, giảm sức ép trọng lượng bàn tay.
• Các nút bấm được bố trí theo góc với ngón tay giúp bấm nhẹ hơn, không cần gồng cơ.
> Các nghiên cứu y sinh học chỉ ra rằng chuột dáng công thái học giúp giảm tới 20% hoạt động cơ bắp không cần thiết ở vùng cẳng tay và cổ tay.

## Logitech MX Master 3S – Đỉnh cao của chuột công thái học hiện đại
Không chỉ sở hữu hình thể nâng đỡ lòng bàn tay tuyệt vời, MX Master 3S còn trang bị con lăn điện từ MagSpeed cuộn 1.000 dòng trong 1 giây nhưng dừng chính xác đến từng pixel khi cần. Nút bấm Silent Switches giảm 90% tiếng ồn click, giữ cho không gian làm việc luôn yên tĩnh.
• Cảm biến Darkfield 8.000 DPI hoạt động mượt mà trên mọi bề mặt, kể cả mặt kính trong suốt.
• Con lăn phụ cạnh ngón cái cuộn ngang timeline video hoặc bảng tính Excel hàng nghìn cột cực kỳ nhẹ nhàng.
• Thời lượng pin 70 ngày chỉ với một lần sạc USB-C và tính năng sạc nhanh 1 phút dùng cả ngày.

## Lời kết từ TechGear
Nếu bạn bắt đầu cảm thấy tê nhẹ đầu ngón tay hoặc mỏi cơ cánh tay sau một ngày làm việc dài, việc nâng cấp lên một con chuột công thái học đạt chuẩn như Logitech MX Master 3S chính là khoản đầu tư quý giá nhất cho sức khỏe thể chất lâu dài của bạn.`,
  },
  {
    id: 3,
    title: 'Cách chọn màn hình đồ họa chuẩn màu cho dân thiết kế & sáng tạo nội dung',
    slug: 'cach-chon-man-hinh-do-hoa-chuan-mau-sang-tao-noi-dung',
    category: 'Hướng dẫn',
    excerpt: 'Tiêu chí độ bao phủ màu sRGB, DCI-P3, độ sai lệch màu Delta E < 2, độ tương phản IPS Black và cổng kết nối USB-C Power Delivery 90W một dây tiện lợi.',
    image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80',
    author: 'Trần Đăng Khoa',
    published_at: '2026-10-20',
    date: '20 Tháng 10, 2026',
    readTime: '7 phút đọc',
    relatedProductId: 3,
    tags: ['Màn hình', 'Dell UltraSharp', 'Thiết kế đồ họa', 'Chuẩn màu sRGB', 'USB-C Hub'],
    content: `Đối với một nhà thiết kế đồ họa, nhiếp ảnh gia hay người dựng phim, màu sắc hiển thị trên màn hình chính là "ngôn ngữ" giao tiếp tác phẩm với người xem. Một chiếc màn hình sai lệch màu có thể khiến sản phẩm in ấn bị lệch tông hoặc video đăng tải trên các nền tảng mạng xã hội không đạt hiệu ứng mong muốn.

## 1. Không gian màu và chỉ số sai lệch Delta E (ΔE)
Màn hình chuyên nghiệp cần đạt tối thiểu 99% dải màu sRGB cho ấn phẩm số trên web và 95% - 98% DCI-P3 cho dựng phim điện ảnh. Đặc biệt, chỉ số sai lệch màu sắc Delta E phải nhỏ hơn 2 (ΔE < 2), nghĩa là mắt người thông thường không thể nhận biết được sự sai lệch sắc thái.
> Mỗi chiếc màn hình Dell UltraSharp khi xuất xưởng đều được cân chỉnh màu (Factory Calibrated) kèm chứng chỉ kiểm định chất lượng riêng biệt trong hộp.

## 2. Công nghệ tấm nền IPS Black – Bước tiến về độ tương phản
Nhược điểm cố hữu của màn hình IPS truyền thống là độ tương phản chỉ ở mức 1000:1, khiến các vùng tối có xu hướng bị ám xám. Với công nghệ IPS Black mới nhất trên các mẫu cao cấp, độ tương phản đạt tới 2000:1, mang lại sắc đen sâu thẳm và chi tiết rõ rệt trong vùng tối.
• Góc nhìn siêu rộng 178/178 độ mà không bị biến đổi màu sắc dù nhìn nghiêng.
• Lớp phủ chống chói tán xạ ánh sáng tự nhiên, bảo vệ mắt khi làm việc ban ngày.
• Độ sâu màu 1.07 tỷ màu (10-bit), loại bỏ hoàn toàn hiện tượng dải màu bị gãy khúc (color banding).

## 3. Kết nối USB-C Type-C 90W: Một sợi cáp cho tất cả
Thời đại của mớ dây nhợ lằng nhằng đã qua. Một cổng USB-C chuẩn Power Delivery 90W trên màn hình cho phép vừa truyền tín hiệu hình ảnh 4K HDR, vừa sạc nhanh cho MacBook/laptop, vừa biến màn hình thành USB Hub kết nối chuột, bàn phím và tai nghe.

## Lời kết từ TechGear
Màn hình là cửa sổ thị giác quan trọng nhất trên bàn làm việc của bạn. Hãy ưu tiên độ phân giải 4K cùng tấm nền chuẩn màu như Dell UltraSharp 27 inch 4K IPS để mọi ý tưởng sáng tạo được hiển thị chân thực và sắc nét đến từng đường nét.`,
  },
  {
    id: 4,
    title: 'Đánh giá tai nghe chống ồn Sony WH-1000XM5: Tối ưu không gian làm việc tập trung',
    slug: 'danh-gia-tai-nghe-chong-on-sony-wh1000xm5',
    category: 'Đánh giá',
    excerpt: 'Trải nghiệm thực tế công nghệ khử ồn kép Auto NC Optimizer trong văn phòng mở ồn ào và quán cà phê, khả năng đàm thoại 8 micro lọc gió và chất âm chuẩn Hi-Res Audio.',
    image_url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80',
    author: 'Vũ Hải Đăng',
    published_at: '2026-10-18',
    date: '18 Tháng 10, 2026',
    readTime: '6 phút đọc',
    relatedProductId: 4,
    tags: ['Tai nghe', 'Sony WH-1000XM5', 'Chống ồn ANC', 'Hi-Res Audio'],
    content: `Trong thời đại văn phòng mở (open space) và xu hướng làm việc linh hoạt từ quán cà phê, tiếng ồn trò chuyện, tiếng còi xe và tiếng bàn phím gõ lách cách là kẻ thù số một của sự tập trung. Sony WH-1000XM5 ra đời để định nghĩa lại sự yên tĩnh tuyệt đối.

## Khả năng chống ồn vô song với 2 vi xử lý và 8 micro chuyên dụng
Sony trang bị bộ đôi chip V1 và QN1 độc quyền, kiểm soát 8 micro thu âm liên tục để phân tích tần số âm thanh từ môi trường xung quanh và tạo ra sóng âm triệt tiêu theo thời gian thực.
• Auto NC Optimizer tự động điều chỉnh mức độ chống ồn theo áp suất khí quyển và kiểu tóc/kính đeo của bạn.
• Cảm giác đeo êm ái như mây với đệm da mềm Soft Fit Leather thế hệ mới ôm khít vành tai.
• Chất âm Hi-Res Audio không dây đỉnh cao qua codec Sony LDAC truyền tải lượng dữ liệu gấp 3 lần Bluetooth thông thường.
> Chỉ cần đeo tai nghe lên và bật tính năng chống ồn ANC, cả thế giới ồn ào dường như lập tức lùi lại sau cánh cửa cách âm dày dặn.

## Lời kết từ TechGear
Nếu bạn cần một không gian tĩnh lặng tuyệt đối để bước vào trạng thái dòng chảy tập trung cao độ (Deep Work), Sony WH-1000XM5 chắc chắn là người bạn đồng hành không thể thay thế.`,
  },
  {
    id: 5,
    title: 'So sánh chuột siêu nhẹ dưới 60g: Razer DeathAdder V3 Pro vs Logitech Superlight 2',
    slug: 'so-sanh-chuot-gaming-sieu-nhe-deathadder-v3-pro-superlight-2',
    category: 'Đánh giá',
    excerpt: 'Hai "ông hoàng" chuột thi đấu Esports đối đầu trực tiếp: Cảm biến Focus Pro 30K vs HERO 2 32.000 DPI, switch quang học chống double-click và độ trễ phản hồi dưới 0.25ms.',
    image_url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1200&q=80',
    author: 'Nguyễn Minh Tuấn',
    published_at: '2026-10-15',
    date: '15 Tháng 10, 2026',
    readTime: '8 phút đọc',
    relatedProductId: 8,
    tags: ['Chuột gaming', 'Logitech G Pro', 'Razer DeathAdder', 'Esports'],
    content: `Trọng lượng nhẹ không chỉ là xu hướng nhất thời mà đã trở thành tiêu chuẩn vàng của các vận động viên thể thao điện tử chuyên nghiệp. Ở mức cân nặng 60 gram, đôi tay bạn di chuyển vẩy chuột (flick shot) nhanh hơn và cổ tay ít chịu quán tính dư thừa.

## Thiết kế công thái học bất đối xứng vs Dáng đối xứng cân bằng
Razer DeathAdder V3 Pro sở hữu form cầm công thái học kinh điển tối ưu cho kiểu cầm Palm grip và Claw grip tay phải, trong khi Logitech G Pro X Superlight 2 lại mang thiết kế đối xứng an toàn, phù hợp với hầu hết mọi kích thước bàn tay.
• DeathAdder V3 Pro: Nặng 63g, cảm biến Focus Pro 30K, switch quang Gen 3 không bao giờ bị lỗi double click.
• Superlight 2: Nặng 60g, switch hybrid cơ quang LIGHTFORCE, cảm biến HERO 2 hỗ trợ Polling Rate lên đến 4.000Hz.

## Lời kết từ TechGear
Cả hai mẫu chuột đều đại diện cho công nghệ đỉnh cao nhất thế giới chuột gaming hiện nay. Nếu bạn thích form cầm ôm lòng bàn tay, hãy chọn Razer DeathAdder V3 Pro; nếu bạn cần sự linh hoạt tuyệt đối cho mọi góc cầm, Logitech Superlight 2 là người chiến thắng.`,
  },
  {
    id: 6,
    title: 'Cẩm nang tối ưu góc làm việc Minimalist: Đẹp mắt, công năng và ngăn nắp',
    slug: 'cam-nang-toi-uu-goc-lam-viec-minimalist',
    category: 'Mẹo công nghệ',
    excerpt: 'Cách lựa chọn arm màn hình nâng đỡ không trọng lực, khay giấu dây thông minh, lót chuột da lộn và kết hợp đèn chiếu sáng màn hình bảo vệ mắt.',
    image_url: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=1200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=1200&q=80',
    author: 'Trần Đăng Khoa',
    published_at: '2026-10-10',
    date: '10 Tháng 10, 2026',
    readTime: '5 phút đọc',
    relatedProductId: 3,
    tags: ['Workspace', 'Minimalist', 'Setup bàn làm việc', 'Ngoại vi'],
    content: `Một chiếc bàn làm việc gọn gàng, sạch sẽ không chỉ đem lại tính thẩm mỹ cao mà còn trực tiếp giải phóng tâm trí, giúp bạn giảm tải căng thẳng và kích hoạt sự sáng tạo tối đa.

## Nguyên tắc "Không dây thừa" trên mặt bàn
Tất cả các thiết bị ngoại vi hiện đại như chuột, bàn phím và tai nghe đều đã có phiên bản không dây tốc độ cao ngang ngửa dây cắm. Hãy tận dụng khay đi dây kẹp gầm bàn kết hợp sạc không dây nam châm để giữ mặt bàn luôn phẳng phiu.

## Lời kết từ TechGear
Góc làm việc là nơi bạn dành một phần ba cuộc đời mỗi ngày. Hãy chăm chút cho từng món đồ ngoại vi để mỗi ngày ngồi vào bàn đều là một niềm cảm hứng bất tận.`,
  },
];

export async function fetchArticlesFromSupabase(): Promise<{
  data: Article[];
  source: 'supabase' | 'fallback';
  error?: string;
}> {
  if (!isSupabaseConfigured()) {
    return { data: MOCK_ARTICLES, source: 'fallback' };
  }

  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.warn('[TechGear Supabase] Lỗi tải bài viết (fallback mock):', error.message);
      return { data: MOCK_ARTICLES, source: 'fallback', error: error.message };
    }

    if (Array.isArray(data) && data.length > 0) {
      const articles = data.map((row) => mapSupabaseRowToArticle(row as SupabaseArticleRow));
      return { data: articles, source: 'supabase' };
    }

    return { data: MOCK_ARTICLES, source: 'fallback' };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Ngoại lệ khi tải bài viết';
    return { data: MOCK_ARTICLES, source: 'fallback', error: msg };
  }
}

export function listNews(category?: string, query?: string, list?: Article[]): Article[] {
  const source = list && list.length > 0 ? list : MOCK_ARTICLES;
  const normCategory = category?.trim().toLowerCase();
  const normQuery = query?.trim().toLowerCase();

  return source.filter((article) => {
    const matchesCategory =
      !normCategory ||
      normCategory === 'tất cả' ||
      article.category.toLowerCase() === normCategory;

    const matchesQuery =
      !normQuery ||
      article.title.toLowerCase().includes(normQuery) ||
      article.excerpt.toLowerCase().includes(normQuery) ||
      (article.tags && article.tags.some((tag) => tag.toLowerCase().includes(normQuery)));

    return matchesCategory && matchesQuery;
  });
}

export function getNewsById(id: number, list?: Article[]): Article | undefined {
  const source = list && list.length > 0 ? list : MOCK_ARTICLES;
  return source.find((article) => article.id === id);
}

export function getNewsBySlug(slug: string, list?: Article[]): Article | undefined {
  const source = list && list.length > 0 ? list : MOCK_ARTICLES;
  return source.find((article) => article.slug === slug || String(article.id) === slug);
}

export function getFeaturedNews(list?: Article[]): Article {
  const source = list && list.length > 0 ? list : MOCK_ARTICLES;
  return source[0];
}

export function getRelatedNews(currentId: number, limit = 3, list?: Article[]): Article[] {
  const source = list && list.length > 0 ? list : MOCK_ARTICLES;
  return source.filter((article) => article.id !== currentId).slice(0, limit);
}
