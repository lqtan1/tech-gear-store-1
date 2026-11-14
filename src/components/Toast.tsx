import { Link } from 'react-router';

export type ToastVariant = 'cart' | 'download' | 'info';

interface ToastProps {
  message: string | null;
  onClose: () => void;
  variant?: ToastVariant;
  title?: string;
  showCartLink?: boolean;
}

const DEFAULT_TITLES: Record<ToastVariant, string> = {
  cart: 'Thành công!',
  download: 'Đang tải xuống...',
  info: 'Thành công!',
};

export default function Toast({
  message,
  onClose,
  variant = 'cart',
  title,
  showCartLink,
}: ToastProps) {
  if (!message) return null;

  const resolvedTitle = title ?? DEFAULT_TITLES[variant];
  const shouldShowCartLink = showCartLink ?? variant === 'cart';

  return (
    <div className="toast-notification" role="status" aria-live="polite">
      <div className={`toast-icon ${variant}`}>{variant === 'download' ? '⬇' : '✓'}</div>
      <div className="toast-content">
        <strong className="toast-title">{resolvedTitle}</strong>
        <p className="toast-message">
          {variant === 'cart' ? (
            <>
              Đã thêm <strong>{message}</strong> vào giỏ hàng.
            </>
          ) : (
            message
          )}
        </p>
      </div>
      {shouldShowCartLink && (
        <Link to="/cart" className="toast-cart-link" onClick={onClose}>
          Xem giỏ
        </Link>
      )}
      <button type="button" className="toast-close" onClick={onClose} aria-label="Đóng thông báo">
        ✕
      </button>
    </div>
  );
}
