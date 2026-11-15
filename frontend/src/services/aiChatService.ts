import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { MOCK_PRODUCTS } from '../features/products/mock-data';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  productIds?: number[];
  timestamp: number;
}

export interface ProductSummary {
  id: number;
  name: string;
  category: string;
  segment: string;
  price: number;
  originalPrice?: number;
  specs: string;
  desc: string;
  stock: number;
  imageUrl: string;
}

export interface AIChatResponse {
  text: string;
  productIds: number[];
  isRateLimited?: boolean;
}

let cachedCatalog: ProductSummary[] | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes

export async function getProductCatalog(): Promise<ProductSummary[]> {
  const now = Date.now();
  if (cachedCatalog && now - lastCacheTime < CACHE_TTL_MS) {
    return cachedCatalog;
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, category, segment, price, original_price, specs, description, stock, image_url')
        .order('id', { ascending: true });

      if (!error && data && data.length > 0) {
        cachedCatalog = data.map((item) => ({
          id: Number(item.id),
          name: item.name,
          category: item.category,
          segment: item.segment,
          price: Number(item.price),
          originalPrice: item.original_price ? Number(item.original_price) : undefined,
          specs: item.specs || '',
          desc: item.description || '',
          stock: typeof item.stock === 'number' ? item.stock : 50,
          imageUrl: item.image_url,
        }));
        lastCacheTime = now;
        return cachedCatalog;
      }
    } catch (err) {
      console.warn('[TechGear AI] Không thể tải danh mục từ Supabase, chuyển sang fallback:', err);
    }
  }

  // Fallback to local catalog
  cachedCatalog = MOCK_PRODUCTS.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    segment: p.segment,
    price: p.price,
    originalPrice: p.originalPrice,
    specs: p.specs,
    desc: p.desc,
    stock: p.stockQuantity,
    imageUrl: p.images[0] || '',
  }));
  lastCacheTime = now;
  return cachedCatalog;
}

function buildSystemInstruction(products: ProductSummary[]): string {
  const productLines = products
    .map(
      (p) =>
        `- [ID: ${p.id}] ${p.name} | Danh mục: ${p.category} (${p.segment}) | Giá: ${p.price.toLocaleString('vi-VN')} đ ${
          p.originalPrice ? `(Gốc: ${p.originalPrice.toLocaleString('vi-VN')} đ)` : ''
        } | Tồn kho: ${p.stock} | Thông số: ${p.specs}`,
    )
    .join('\n');

  return `Bạn là Trợ lý ảo AI - Chuyên viên tư vấn bán hàng cao cấp của TechGear Store (Chuyên thiết bị ngoại vi & phụ kiện công nghệ cao cấp: Bàn phím cơ, Chuột, Màn hình, Tai nghe).

4 QUY TẮC BẤT DI BẤT DỊCH (STRICT GUARDRAILS):
1. PHẠM VI DUY NHẤT:
- Bạn là chuyên viên tư vấn của TechGear Store. Chỉ được tư vấn, so sánh dựa trên danh sách sản phẩm từ Supabase và chính sách của shop (Freeship đơn từ 500.000đ, Bảo hành 24 tháng 1 đổi 1, Đổi trả 30 ngày, Hotline 1900 6750).
- Không tự ý bịa thêm chính sách khác ngoài 4 chính sách trên.

2. KHÔNG BỊA SẢN PHẨM:
- Chỉ được giới thiệu các sản phẩm CÓ TRONG DANH SÁCH DƯỚI ĐÂY. Tuyệt đối KHÔNG BỊA ĐẶT mẫu mã, thông số kỹ thuật hay mức giá.
- Nếu khách hàng hỏi mẫu shop không bán hoặc sản phẩm không có trong danh sách (như iPhone, máy lạnh, laptop, hoặc thương hiệu không kinh doanh), hãy lịch sự thông báo shop chưa kinh doanh hoặc đang tạm hết mẫu đó, sau đó gợi ý mẫu tương đương có trong danh sách.

3. CHẶN ĐỐI THỦ CẠNH TRANH:
- Nếu khách nhắc tên các cửa hàng khác (GearVN, Phong Vũ, An Phát, CellphoneS, Hacom, MemoryZone...), tuyệt đối KHÔNG bình luận hay so sánh giá với họ.
- Hãy khéo léo chuyển hướng nhấn mạnh ưu điểm bảo hành 24 tháng 1 đổi 1, 100% hàng mới chính hãng và dịch vụ hỗ trợ tận tâm tại TechGear Store.

4. TỪ CHỐI LẠC ĐỀ (STRICT OUT-OF-SCOPE):
- Nếu khách hỏi bất kỳ chủ đề nào ngoài thiết bị ngoại vi, góc máy tính hoặc đơn hàng (như viết code, làm thơ, toán học, thời tiết, tin tức xã hội...), bắt buộc từ chối bằng mẫu câu sau:
"Dạ, mình là trợ lý tư vấn của TechGear Store nên chỉ hỗ trợ các thông tin về thiết bị ngoại vi và mua sắm tại cửa hàng thôi ạ. Bạn đang quan tâm đến bàn phím, chuột, màn hình hay tai nghe để mình tư vấn nhé?"

TRÍ NHỚ HỘI THOẠI & ĐẠI TỪ THAY THẾ (CONVERSATION CONTEXT):
- BẮT BUỘC ghi nhớ ngữ cảnh các lượt hỏi đáp trước đó. Khi khách hỏi tiếp nối bằng các câu ngắn như "cấu hình không mạnh bằng à?", "cái nào rẻ hơn?", "con này có bluetooth không?", "mẫu đó nặng bao nhiêu?", "so sánh 2 con này"... bạn PHẢI tự động hiểu khách đang đề cập đến sản phẩm mà hai bên vừa trao đổi ngay phía trên để so sánh và giải thích chi tiết, thông minh.

ĐỊNH DẠNG TRẢ LỜI & GỢI Ý SẢN PHẨM:
- Trả lời bằng tiếng Việt lịch sự, nhiệt tình, ngắn gọn và súc tích (khoảng 2-4 câu), luôn hoàn chỉnh câu (tuyệt đối không bỏ dở câu giữa chừng).
- QUY TẮC LIỆT KÊ & ĐỊNH DẠNG BẮT BUỘC:
  + Khi liệt kê các lựa chọn hoặc tính năng sản phẩm, BẮT BUỘC sử dụng biểu tượng dấu chấm tròn "• " ở đầu mỗi dòng gạch đầu dòng. TUYỆT ĐỐI KHÔNG dùng dấu sao "*" hay dấu gạch ngang "-" khi liệt kê để tin nhắn hiển thị sạch sẽ, trang nhã nhất.
  + Dùng cú pháp **tên sản phẩm** hoặc **tính năng** để in đậm các từ khóa nổi bật.
- BẮT BUỘC: Khi nhắc tới bất kỳ sản phẩm cụ thể nào có trong danh sách, hãy kèm mã định danh theo cú pháp:
  [PRODUCT_ID: <id>]
  (Ví dụ: "• **Samsung ViewFinity S8 32\\" 4K** [PRODUCT_ID: 14]: Màn hình IPS HDR600 chuyên đồ họa cao cấp.")
  Giao diện sẽ tự động phân tích mã này thành thẻ sản phẩm thu gọn để khách mua nhanh.

DANH SÁCH TOÀN BỘ SẢN PHẨM TỪ SUPABASE:
${productLines}
`;
}

export function extractProductIds(text: string): number[] {
  const matches = text.matchAll(/\[PRODUCT_ID:\s*(\d+)\]/gi);
  const ids: number[] = [];
  for (const match of matches) {
    const id = Number(match[1]);
    if (Number.isInteger(id) && !ids.includes(id)) {
      ids.push(id);
    }
  }
  return ids;
}

/**
 * Xây dựng danh sách contents gửi sang Gemini API:
 * - Chuẩn hóa role 'user' và 'model'
 * - Lấy tối đa 6-8 lượt trao đổi gần nhất
 * - Tuân thủ nghiêm ngặt quy tắc của Gemini API:
 *   + Lượt đầu tiên BẮT BUỘC là 'user'
 *   + Các lượt phải xen kẽ 'user' -> 'model' -> 'user' -> 'model'
 *   + Lượt cuối cùng BẮT BUỘC là câu hỏi hiện tại của 'user'
 */
export function buildGeminiContents(
  history: ChatMessage[],
  currentUserMessage: string,
): Array<{ role: 'user' | 'model'; parts: [{ text: string }] }> {
  const trimmedUser = currentUserMessage.trim();

  // 1. Lọc bỏ tin nhắn khởi tạo chào mừng và các thông báo lỗi/hạ nhiệt hệ thống
  const validHistory = history.filter((msg) => {
    if (!msg.content || !msg.content.trim()) return false;
    if (msg.id === 'init-msg') return false;
    if (msg.content.includes('Trợ lý AI đang xử lý hơi nhiều yêu cầu')) return false;
    if (msg.content.includes('hệ thống kết nối AI đang bận')) return false;
    return true;
  });

  // 2. Lấy tối đa 7 tin nhắn gần nhất từ lịch sử (để thêm câu hỏi hiện tại là tối đa 8 tin nhắn)
  const windowedHistory = validHistory.slice(-7);

  const turns: Array<{ role: 'user' | 'model'; parts: [{ text: string }] }> = [];

  for (const msg of windowedHistory) {
    const role: 'user' | 'model' = msg.role === 'user' ? 'user' : 'model';
    const text = msg.content.trim();
    if (!text) continue;

    if (turns.length === 0) {
      // Gemini API bắt buộc: turn đầu tiên phải là 'user'
      if (role === 'user') {
        turns.push({ role: 'user', parts: [{ text }] });
      }
      // Nếu tin đầu trong window là 'model', bỏ qua để bắt đầu từ 'user' kế tiếp
    } else {
      const lastTurn = turns[turns.length - 1];
      if (lastTurn.role === role) {
        // Gộp nếu 2 turn cùng role liên tiếp
        lastTurn.parts[0].text += `\n${text}`;
      } else {
        turns.push({ role, parts: [{ text }] });
      }
    }
  }

  // 3. Đưa câu hỏi hiện tại vào cuối cùng với role 'user'
  if (turns.length === 0) {
    turns.push({ role: 'user', parts: [{ text: trimmedUser }] });
  } else {
    const lastTurn = turns[turns.length - 1];
    if (lastTurn.role === 'user') {
      // Nếu turn cuối đã là user (ví dụ history đã bao gồm userMsg hiện tại)
      if (lastTurn.parts[0].text !== trimmedUser) {
        lastTurn.parts[0].text = trimmedUser;
      }
    } else {
      turns.push({ role: 'user', parts: [{ text: trimmedUser }] });
    }
  }

  return turns;
}

function generateLocalFallbackResponse(
  history: ChatMessage[],
  message: string,
  catalog: ProductSummary[],
): AIChatResponse {
  const query = message.toLowerCase().trim();

  // Out of scope check
  const outOfScopePatterns = [
    'code', 'python', 'javascript', 'lập trình', 'làm thơ', 'bài thơ',
    'toán', 'thời tiết', 'nấu ăn', 'chính trị', 'tin tức', 'kể chuyện', 'hát', 'dịch tiếng',
  ];
  if (outOfScopePatterns.some((pattern) => query.includes(pattern))) {
    return {
      text: 'Dạ, mình là trợ lý tư vấn của TechGear Store nên chỉ hỗ trợ các thông tin về thiết bị ngoại vi và mua sắm tại cửa hàng thôi ạ. Bạn đang quan tâm đến bàn phím, chuột, màn hình hay tai nghe để mình tư vấn nhé?',
      productIds: [],
    };
  }

  // Competitor check
  const competitorPatterns = [
    'gearvn', 'phong vũ', 'an phát', 'cellphones', 'hacom', 'memoryzone',
    'hoàng hà', 'fpt shop', 'thế giới di động',
  ];
  if (competitorPatterns.some((pattern) => query.includes(pattern))) {
    return {
      text: 'Dạ, TechGear Store luôn cam kết cung cấp 100% sản phẩm chính hãng tuyển chọn, kèm chính sách Bảo hành 24 tháng 1 đổi 1 tận nơi, Đổi trả 30 ngày và Freeship từ 500.000đ. Bạn đang quan tâm đến dòng sản phẩm nào để shop tư vấn chi tiết ạ?',
      productIds: [],
    };
  }

  // Policy check
  if (query.includes('bảo hành') || query.includes('đổi trả') || query.includes('freeship') || query.includes('giao hàng') || query.includes('hotline')) {
    return {
      text: 'Chính sách mua hàng tại TechGear Store:\n• 🚚 Miễn phí vận chuyển toàn quốc cho đơn hàng từ 500.000đ.\n• 🛡️ Bảo hành chính hãng 24 tháng (lỗi 1 đổi 1 trong 30 ngày).\n• 🔄 Đổi trả miễn phí 30 ngày nếu chưa qua sử dụng.\n• 📞 Hotline tư vấn kỹ thuật 24/7: 1900 6750.',
      productIds: [],
    };
  }

  // Contextual follow-up check: Check if user asks comparison or follow-up question
  if (query.includes('rẻ hơn') || query.includes('cấu hình') || query.includes('mạnh hơn') || query.includes('con này') || query.includes('mẫu này')) {
    // Find previously mentioned products from history
    const recentAssistantMsgs = [...history].reverse().filter((m) => m.role === 'assistant' && m.productIds && m.productIds.length > 0);
    if (recentAssistantMsgs.length > 0 && recentAssistantMsgs[0].productIds) {
      const prevIds = recentAssistantMsgs[0].productIds;
      const prevProducts = catalog.filter((p) => prevIds.includes(p.id));
      if (prevProducts.length >= 2) {
        const sortedByPrice = [...prevProducts].sort((a, b) => a.price - b.price);
        const cheaper = sortedByPrice[0];
        const pricier = sortedByPrice[1];
        return {
          text: `Dạ, so sánh giữa các mẫu bạn đang quan tâm:\n• **${cheaper.name}** [PRODUCT_ID: ${cheaper.id}] có giá tốt hơn là **${cheaper.price.toLocaleString('vi-VN')} đ**.\n• **${pricier.name}** [PRODUCT_ID: ${pricier.id}] có giá **${pricier.price.toLocaleString('vi-VN')} đ** với ưu điểm: ${pricier.specs}.\nTùy nhu cầu tối ưu ngân sách hay hiệu năng cao bạn có thể chọn mẫu phù hợp ạ!`,
          productIds: [cheaper.id, pricier.id],
        };
      } else if (prevProducts.length === 1) {
        const p = prevProducts[0];
        return {
          text: `Dạ, mẫu **${p.name}** [PRODUCT_ID: ${p.id}] hiện có giá **${p.price.toLocaleString('vi-VN')} đ** với thông số nổi bật: ${p.specs}. Mẫu này rất bền và được bảo hành chính hãng 24 tháng 1 đổi 1 tại shop ạ!`,
          productIds: [p.id],
        };
      }
    }
  }

  // Product searches
  let matched = catalog.filter((p) => {
    return (
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.specs.toLowerCase().includes(query)
    );
  });

  if (query.includes('chuột')) {
    matched = catalog.filter((p) => p.category.toLowerCase().includes('chuột') || p.category === 'mice');
    if (query.includes('2 triệu') || query.includes('dưới 2m') || query.includes('dưới 2')) {
      matched = matched.filter((p) => p.price <= 2000000);
    }
  } else if (query.includes('bàn phím')) {
    matched = catalog.filter((p) => p.category.toLowerCase().includes('bàn phím') || p.category === 'keyboards');
    if (query.includes('văn phòng') || query.includes('êm')) {
      matched = matched.filter((p) => p.segment === 'office' || p.specs.toLowerCase().includes('êm') || p.name.includes('Keychron') || p.name.includes('NuPhy') || p.name.includes('MX Keys'));
    }
  } else if (query.includes('màn hình')) {
    matched = catalog.filter((p) => p.category.toLowerCase().includes('màn hình') || p.category === 'monitors');
    if (query.includes('4k') || query.includes('đồ họa')) {
      matched = matched.filter((p) => p.specs.toLowerCase().includes('4k') || p.segment === 'office');
    }
  } else if (query.includes('tai nghe')) {
    matched = catalog.filter((p) => p.category.toLowerCase().includes('tai nghe') || p.category === 'audio');
    if (query.includes('chống ồn') || query.includes('tốt nhất')) {
      matched = matched.filter((p) => p.specs.toLowerCase().includes('anc') || p.name.includes('Sony') || p.name.includes('Razer'));
    }
  }

  if (matched.length > 0) {
    const topPicks = matched.slice(0, 2);
    const productTags = topPicks.map((p) => `[PRODUCT_ID: ${p.id}]`).join(' ');
    const names = topPicks.map((p) => `**${p.name}** (${p.price.toLocaleString('vi-VN')} đ)`).join(' và ');
    return {
      text: `Dạ, TechGear Store xin gợi ý cho bạn ${names} rất phù hợp với tiêu chí của bạn ạ: ${productTags}`,
      productIds: topPicks.map((p) => p.id),
    };
  }

  return {
    text: 'Dạ, hiện tại TechGear Store đang kinh doanh các dòng Bàn phím cơ, Chuột không dây/gaming, Màn hình đồ họa/gaming và Tai nghe chống ồn cao cấp. Bạn đang cần tìm thiết bị trong khoảng giá bao nhiêu để mình gợi ý mẫu tốt nhất ạ?',
    productIds: [],
  };
}

export async function sendAIChatMessage(
  history: ChatMessage[],
  userMessage: string,
): Promise<AIChatResponse> {
  const catalog = await getProductCatalog();
  const apiKey = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();

  // Nếu chưa có API key hoặc key mặc định, sử dụng bộ fallback cục bộ thông minh
  if (!apiKey || apiKey === 'your-gemini-api-key' || apiKey.length < 15) {
    return generateLocalFallbackResponse(history, userMessage, catalog);
  }

  const systemInstructionText = buildSystemInstruction(catalog);
  const formattedContents = buildGeminiContents(history, userMessage);

  // Danh sách model ưu tiên: gemini-2.5-flash (chính) và fallback sang gemini-2.0-flash
  const CANDIDATE_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash'];

  for (let i = 0; i < CANDIDATE_MODELS.length; i++) {
    const modelName = CANDIDATE_MODELS[i];
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstructionText }],
          },
          contents: formattedContents,
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1024,
          },
        }),
      });

      // Xử lý riêng biệt khi gặp lỗi 429 Too Many Requests
      if (response.status === 429) {
        console.warn(`[TechGear AI] ${modelName} gặp lỗi 429 TooManyRequests.`);

        // Nếu còn model dự phòng, thử gọi model kế tiếp
        if (i < CANDIDATE_MODELS.length - 1) {
          console.info(`[TechGear AI] Đang chuyển đổi sang model dự phòng ${CANDIDATE_MODELS[i + 1]}...`);
          continue;
        }

        // Nếu cả hai model đều bị giới hạn tốc độ (429), trả về thông báo thân thiện theo yêu cầu
        return {
          text: 'Trợ lý AI đang xử lý hơi nhiều yêu cầu cùng lúc, bạn đợi 5 giây rồi hỏi lại nhé!',
          productIds: [],
          isRateLimited: true,
        };
      }

      if (response.ok) {
        const result = await response.json();
        const candidateText =
          result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

        if (candidateText) {
          const productIds = extractProductIds(candidateText);
          return {
            text: candidateText,
            productIds,
          };
        }
      } else {
        const errJson = await response.json().catch(() => null);
        const isExhausted =
          response.status === 429 ||
          errJson?.error?.code === 429 ||
          errJson?.error?.status === 'RESOURCE_EXHAUSTED';

        if (isExhausted) {
          return {
            text: 'Trợ lý AI đang xử lý hơi nhiều yêu cầu cùng lúc, bạn đợi 5 giây rồi hỏi lại nhé!',
            productIds: [],
            isRateLimited: true,
          };
        }

        console.warn(`[TechGear AI] ${modelName} phản hồi lỗi ${response.status}:`, errJson);
      }
    } catch (err: unknown) {
      const errString = String(err);
      if (errString.includes('429') || errString.includes('RESOURCE_EXHAUSTED')) {
        return {
          text: 'Trợ lý AI đang xử lý hơi nhiều yêu cầu cùng lúc, bạn đợi 5 giây rồi hỏi lại nhé!',
          productIds: [],
          isRateLimited: true,
        };
      }
      console.warn(`[TechGear AI] Lỗi kết nối tới ${modelName}:`, err);
    }
  }

  // Fallback nếu cả hai model gặp lỗi không mong muốn khác
  return generateLocalFallbackResponse(history, userMessage, catalog);
}
