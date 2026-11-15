import { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router';

import { useCartStore } from '../features/cart/store';
import { useProductStore } from '../features/products/store';
import type { Product } from '../features/products/types';
import { getProductPrimaryImage } from '../features/products/utils';
import { sendAIChatMessage, type ChatMessage } from '../services/aiChatService';

const QUICK_PROMPTS = [
  'Chuột không dây dưới 2 triệu',
  'Bàn phím cơ êm cho văn phòng',
  'Màn hình 4K làm đồ họa',
  'Tai nghe chống ồn tốt nhất',
];

const INITIAL_MESSAGE: ChatMessage = {
  id: 'init-msg',
  role: 'assistant',
  content:
    '👋 Xin chào! Mình là Trợ lý ảo AI của **TechGear Store**.\nBạn đang cần tư vấn chuột, bàn phím cơ, màn hình hay tai nghe nào để mình hỗ trợ nhé?',
  timestamp: Date.now(),
};

const formatPrice = (price: number) => `${price.toLocaleString('vi-VN')} đ`;

/**
 * Chuyển đổi cú pháp **text** thành thẻ <strong>text</strong>
 */
export function renderInlineMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

/**
 * Định dạng tin nhắn Markdown:
 * - Biến các dòng bắt đầu bằng `* `, `- `, hoặc `• ` thành danh sách gạch đầu dòng gọn gàng với `• `
 * - Chuyển đổi cú pháp **text** thành <strong>
 * - Giữ nguyên phân dòng và thụt lề
 */
export function formatMessageContent(content: string): React.ReactNode {
  const lines = content.split('\n');

  return (
    <div className="ai-formatted-content">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Dòng trống -> tạo khoảng cách nhẹ giữa các đoạn
        if (!trimmed) {
          return <div key={idx} className="ai-content-spacer" />;
        }

        // Kiểm tra dòng bắt đầu bằng gạch đầu dòng (*, -, hoặc •)
        const bulletMatch = line.match(/^(\s*)([*•-])\s+(.+)$/);
        if (bulletMatch) {
          const [, indent, , bulletText] = bulletMatch;
          const isNested = indent.length >= 2;

          return (
            <div
              key={idx}
              className={`ai-bullet-row ${isNested ? 'nested' : ''}`}
            >
              <span className="ai-bullet-icon" aria-hidden="true">•</span>
              <span className="ai-bullet-body">
                {renderInlineMarkdown(bulletText)}
              </span>
            </div>
          );
        }

        // Dòng văn bản bình thường
        return (
          <div key={idx} className="ai-prose-row">
            {renderInlineMarkdown(line)}
          </div>
        );
      })}
    </div>
  );
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [addedProductId, setAddedProductId] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSendTimeRef = useRef<number>(0);

  const allProducts = useProductStore((state) => state.products);
  const addItem = useCartStore((state) => state.addItem);

  const productMap = useMemo(() => {
    return new Map<number, Product>(allProducts.map((p) => [p.id, p]));
  }, [allProducts]);

  // Bộ đếm ngược thời gian chờ hạ nhiệt khi gặp Rate Limit (429)
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? inputVal).trim();
    if (!text || isLoading || cooldownSeconds > 0) return;

    // Chống spam request: chặn thao tác gửi liên tục trong vòng 1.2s
    const now = Date.now();
    if (now - lastSendTimeRef.current < 1200) {
      return;
    }
    lastSendTimeRef.current = now;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    if (!textToSend) setInputVal('');
    setIsLoading(true);

    try {
      const response = await sendAIChatMessage(newHistory, text);
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.text,
        productIds: response.productIds,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // Kích hoạt cơ chế đếm ngược 5 giây nếu gặp lỗi rate-limit (429)
      if (
        response.isRateLimited ||
        response.text.includes('Trợ lý AI đang xử lý hơi nhiều yêu cầu cùng lúc')
      ) {
        setCooldownSeconds(5);
      }
    } catch (err: unknown) {
      const is429 =
        String(err).includes('429') ||
        String(err).includes('RESOURCE_EXHAUSTED');

      if (is429) {
        setCooldownSeconds(5);
      }

      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: is429
          ? 'Trợ lý AI đang xử lý hơi nhiều yêu cầu cùng lúc, bạn đợi 5 giây rồi hỏi lại nhé!'
          : 'Dạ, hệ thống kết nối AI đang bận một chút. Bạn có thể gọi hotline **1900 6750** hoặc thử lại sau giây lát nhé!',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    addItem(product);
    setAddedProductId(product.id);
    setTimeout(() => {
      setAddedProductId((current) => (current === product.id ? null : current));
    }, 2000);
  };

  const handleResetChat = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  // Helper to remove [PRODUCT_ID: x] from the displayed text bubble
  const cleanMessageContent = (content: string) => {
    return content.replace(/\[PRODUCT_ID:\s*\d+\]/gi, '').trim();
  };

  return (
    <>
      {/* 1. FLOATING AI TRIGGER BUTTON (Synchronized with Floating Action Buttons) */}
      <button
        type="button"
        className={`floating-widget-btn ai-chat-fab ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        title="Trợ lý ảo AI tư vấn TechGear Store"
        aria-label="Mở Trợ lý AI tư vấn"
        aria-expanded={isOpen}
      >
        <span className="ai-fab-badge">AI</span>
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
          <path d="m4.93 10.93 1.41 1.41" />
          <path d="M2 18h2" />
          <path d="M20 18h2" />
          <path d="m19.07 10.93-1.41 1.41" />
          <path d="M22 22H2" />
          <path d="m16 6-4 4-4-4" />
          <path d="M16 18a4 4 0 0 0-8 0" />
        </svg>
        <span className="fab-tooltip">Trợ lý AI</span>
      </button>

      {/* 2. CHAT WINDOW MODAL */}
      {isOpen && (
        <div className="ai-chat-window shadow-xl" role="dialog" aria-label="Khung chat Trợ lý AI">
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-chat-header-brand">
              <div className="ai-chat-avatar" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                </svg>
              </div>
              <div className="ai-chat-header-info">
                <strong className="ai-chat-name">Trợ lý AI TechGear</strong>
                <span className="ai-chat-status">
                  <span className="status-dot-pulse" /> Sẵn sàng tư vấn 24/7
                </span>
              </div>
            </div>

            <div className="ai-chat-header-actions">
              <button
                type="button"
                className="ai-chat-header-btn"
                onClick={handleResetChat}
                title="Làm mới cuộc trò chuyện"
                aria-label="Làm mới"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                  <path d="M16 16h5v5" />
                </svg>
              </button>
              <button
                type="button"
                className="ai-chat-header-btn"
                onClick={() => setIsOpen(false)}
                title="Thu nhỏ khung chat"
                aria-label="Đóng chat"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className="ai-quick-prompts-wrap">
            <span className="ai-quick-prompts-label">Gợi ý nhanh:</span>
            <div className="ai-quick-prompts-list">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="ai-quick-prompt-pill"
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isLoading || cooldownSeconds > 0}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Body */}
          <div className="ai-chat-body">
            {messages.map((msg) => {
              const isAssistant = msg.role === 'assistant';
              const cleanText = cleanMessageContent(msg.content);
              const mentionedProductIds = msg.productIds || [];

              return (
                <div
                  key={msg.id}
                  className={`ai-message-row ${isAssistant ? 'assistant' : 'user'}`}
                >
                  {isAssistant && (
                    <div className="ai-msg-avatar" aria-hidden="true">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 8V4H8" />
                        <rect width="16" height="12" x="4" y="8" rx="2" />
                        <path d="M2 14h2" />
                        <path d="M20 14h2" />
                        <path d="M15 13v2" />
                        <path d="M9 13v2" />
                      </svg>
                    </div>
                  )}

                  <div className="ai-message-bubble-wrap">
                    {cleanText && (
                      <div className="ai-message-bubble">
                        {formatMessageContent(cleanText)}
                      </div>
                    )}

                    {/* MINI PRODUCT CARDS (parsed from [PRODUCT_ID: <id>]) */}
                    {isAssistant && mentionedProductIds.length > 0 && (
                      <div className="ai-mini-products-list">
                        {mentionedProductIds.map((id) => {
                          const product = productMap.get(id);
                          if (!product) return null;

                          const isAdded = addedProductId === product.id;

                          return (
                            <div key={product.id} className="ai-mini-product-card">
                              <Link
                                to={`/products/${product.id}`}
                                className="ai-mini-card-thumb"
                                onClick={() => setIsOpen(false)}
                              >
                                <img
                                  src={getProductPrimaryImage(product)}
                                  alt={product.name}
                                />
                              </Link>

                              <div className="ai-mini-card-details">
                                <Link
                                  to={`/products/${product.id}`}
                                  className="ai-mini-card-title"
                                  onClick={() => setIsOpen(false)}
                                  title={product.name}
                                >
                                  {product.name}
                                </Link>

                                <div className="ai-mini-card-price-row">
                                  <strong className="ai-mini-price">
                                    {formatPrice(product.price)}
                                  </strong>
                                  {product.originalPrice && product.originalPrice > product.price && (
                                    <del className="ai-mini-price-old">
                                      {formatPrice(product.originalPrice)}
                                    </del>
                                  )}
                                </div>

                                <span className="ai-mini-card-spec">
                                  {product.specs.split(',').slice(0, 1)[0] || product.category}
                                </span>

                                <div className="ai-mini-card-actions">
                                  <button
                                    type="button"
                                    className={`ai-mini-add-cart-btn ${isAdded ? 'added' : ''}`}
                                    onClick={() => handleAddToCart(product)}
                                    disabled={!product.inStock}
                                  >
                                    {isAdded ? '✓ Đã thêm vào giỏ' : 'Thêm vào giỏ'}
                                  </button>
                                  <Link
                                    to={`/products/${product.id}`}
                                    className="ai-mini-view-btn"
                                    onClick={() => setIsOpen(false)}
                                  >
                                    Xem chi tiết →
                                  </Link>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing / Loading indicator */}
            {isLoading && (
              <div className="ai-message-row assistant">
                <div className="ai-msg-avatar" aria-hidden="true">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 8V4H8" />
                    <rect width="16" height="12" x="4" y="8" rx="2" />
                    <path d="M2 14h2" />
                    <path d="M20 14h2" />
                    <path d="M15 13v2" />
                    <path d="M9 13v2" />
                  </svg>
                </div>
                <div className="ai-typing-indicator">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <form
            className="ai-chat-footer"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <input
              ref={inputRef}
              type="text"
              className="ai-chat-input"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={
                cooldownSeconds > 0
                  ? `Vui lòng đợi ${cooldownSeconds}s để tiếp tục...`
                  : 'Hỏi về chuột, bàn phím, màn hình...'
              }
              disabled={isLoading || cooldownSeconds > 0}
              maxLength={200}
            />
            <button
              type="submit"
              className="ai-chat-send-btn"
              disabled={!inputVal.trim() || isLoading || cooldownSeconds > 0}
              aria-label={cooldownSeconds > 0 ? `Chờ ${cooldownSeconds}s` : 'Gửi tin nhắn'}
              title={cooldownSeconds > 0 ? `Vui lòng đợi ${cooldownSeconds} giây` : 'Gửi tin nhắn'}
            >
              {cooldownSeconds > 0 ? (
                <span style={{ fontSize: '0.72rem', fontWeight: 800 }}>{cooldownSeconds}s</span>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </form>

          {/* Policy micro-notice */}
          <div className="ai-chat-notice">
            <span>🛡️ Freeship từ 500k • Đổi mới 24 tháng • Hotline 1900 6750</span>
          </div>
        </div>
      )}
    </>
  );
}
