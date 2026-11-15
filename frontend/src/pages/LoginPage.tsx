import { useState, useEffect, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';

import { useAuth } from '../app/AuthContext';

interface LoginLocationState {
  from?: string;
}

type AuthMode = 'login' | 'register';

export default function LoginPage() {
  const { signIn, signUp, loginWithGoogle, resendVerificationEmail, isConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<AuthMode>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('admin@techgear.vn');
  const [loginPassword, setLoginPassword] = useState('admin');

  // Register form state
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Status & error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Email confirmation view state
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const requestedPath = (location.state as LoginLocationState | null)?.from;

  // Countdown timer for resend email
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const result = await signIn(loginEmail, loginPassword);
      if (!result.success) {
        setError(result.error || 'Đăng nhập không thành công.');
        if (result.needsEmailConfirmation) {
          setPendingVerificationEmail(loginEmail);
        }
        return;
      }

      // Successful sign in
      const destination = requestedPath ?? '/';
      navigate(destination, { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (regPassword !== regConfirmPassword) {
      setError('Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Mật khẩu phải có độ dài tối thiểu 6 ký tự.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signUp(regEmail, regPassword, fullName);
      if (!result.success) {
        setError(result.error || 'Đăng ký không thành công.');
        return;
      }

      if (result.needsEmailConfirmation) {
        setPendingVerificationEmail(regEmail);
        setResendCooldown(60);
      } else {
        setSuccessMsg('Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay.');
        setMode('login');
        setLoginEmail(regEmail);
        setLoginPassword(regPassword);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendEmail = async () => {
    if (!pendingVerificationEmail || resendCooldown > 0) return;
    setResendStatus('Đang gửi lại email xác nhận...');
    const result = await resendVerificationEmail(pendingVerificationEmail);
    setResendStatus(result.message);
    if (result.success) {
      setResendCooldown(60);
    }
  };

  const fillDemoAccount = (account: 'admin' | 'customer') => {
    setMode('login');
    setPendingVerificationEmail(null);
    if (account === 'admin') {
      setLoginEmail('admin@techgear.vn');
      setLoginPassword('admin');
    } else {
      setLoginEmail('customer@techgear.vn');
      setLoginPassword('customer');
    }
    setError(null);
    setSuccessMsg(null);
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMsg(null);
    setIsGoogleSubmitting(true);

    try {
      const result = await loginWithGoogle();
      if (!result.success) {
        setError(result.error || 'Đăng nhập bằng tài khoản Google không thành công.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi kết nối khi đăng nhập bằng Google.');
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <div className="login-page-wolf">
      <div className="container auth-layout">
        <div className="auth-card shadow-sm">
          {/* Brand Header */}
          <div className="auth-brand-head">
            <div className="brand-icon-box small">
              <img src="/images/logo-transparent.png" alt="TechGear Logo" className="brand-logo-img" />
            </div>
            <span className="auth-brand-name">TECH<span>GEAR</span></span>
          </div>

          <span className="section-eyebrow text-center d-block">TÀI KHOẢN & XÁC THỰC</span>
          <h1 className="auth-title">
            {mode === 'login' ? 'Chào mừng trở lại!' : 'Tạo tài khoản mới'}
          </h1>
          <p className="auth-desc">
            {mode === 'login'
              ? 'Đăng nhập để quản lý đơn hàng, lưu sản phẩm và nhận ưu đãi độc quyền.'
              : 'Trải nghiệm mua sắm thiết bị ngoại vi công nghệ cao cấp hàng đầu.'}
          </p>

          {/* Dual Tabs: Đăng nhập / Đăng ký */}
          <div className="auth-tabs-nav" role="tablist">
            <button
              type="button"
              className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccessMsg(null);
              }}
              role="tab"
              aria-selected={mode === 'login'}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
              onClick={() => {
                setMode('register');
                setError(null);
                setSuccessMsg(null);
              }}
              role="tab"
              aria-selected={mode === 'register'}
            >
              Đăng ký tài khoản
            </button>
          </div>

          {/* Pending Email Verification Notice Box */}
          {pendingVerificationEmail && (
            <div className="email-verify-box" role="alert">
              <div className="email-verify-icon">✉️</div>
              <h3 className="email-verify-title">Xác thực Email tài khoản</h3>
              <p className="email-verify-desc">
                Chúng tôi đã gửi một liên kết kích hoạt đến địa chỉ{' '}
                <strong className="email-verify-target">{pendingVerificationEmail}</strong>.
                <br />
                Vui lòng kiểm tra hộp thư của bạn (bao gồm cả thư mục <em>Spam / Thư rác</em>) và nhấn vào liên kết xác nhận để kích hoạt tài khoản.
              </p>

              <button
                type="button"
                className="resend-btn"
                onClick={handleResendEmail}
                disabled={resendCooldown > 0}
              >
                {resendCooldown > 0
                  ? `Gửi lại sau ${resendCooldown}s`
                  : 'Gửi lại email xác nhận'}
              </button>

              {resendStatus && (
                <p className="mt-2 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  {resendStatus}
                </p>
              )}
            </div>
          )}

          {error && <p className="form-error-msg" role="alert">{error}</p>}
          {successMsg && <p className="form-success-msg" role="status">{successMsg}</p>}

          {/* TAB 1: FORM ĐĂNG NHẬP */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group mb-3">
                <label htmlFor="login-email">Địa chỉ Email *</label>
                <input
                  id="login-email"
                  value={loginEmail}
                  onChange={(event) => setLoginEmail(event.target.value)}
                  type="email"
                  required
                  className="wolf-input"
                  placeholder="name@example.com"
                  autoComplete="email"
                />
              </div>

              <div className="form-group mb-3">
                <label htmlFor="login-password">Mật khẩu *</label>
                <input
                  id="login-password"
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  type="password"
                  required
                  className="wolf-input"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              <button
                className="btn-wolf-primary full-width mt-2"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang xử lý...' : 'Đăng nhập ngay'}
              </button>
            </form>
          ) : (
            /* TAB 2: FORM ĐĂNG KÝ */
            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group mb-3">
                <label htmlFor="reg-fullname">Họ và tên *</label>
                <input
                  id="reg-fullname"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  type="text"
                  required
                  className="wolf-input"
                  placeholder="Nguyễn Văn A"
                  autoComplete="name"
                />
              </div>

              <div className="form-group mb-3">
                <label htmlFor="reg-email">Địa chỉ Email *</label>
                <input
                  id="reg-email"
                  value={regEmail}
                  onChange={(event) => setRegEmail(event.target.value)}
                  type="email"
                  required
                  className="wolf-input"
                  placeholder="email@domain.com"
                  autoComplete="email"
                />
              </div>

              <div className="form-group mb-3">
                <label htmlFor="reg-password">Mật khẩu * (Tối thiểu 6 ký tự)</label>
                <input
                  id="reg-password"
                  value={regPassword}
                  onChange={(event) => setRegPassword(event.target.value)}
                  type="password"
                  required
                  minLength={6}
                  className="wolf-input"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>

              <div className="form-group mb-3">
                <label htmlFor="reg-confirmpassword">Xác nhận mật khẩu *</label>
                <input
                  id="reg-confirmpassword"
                  value={regConfirmPassword}
                  onChange={(event) => setRegConfirmPassword(event.target.value)}
                  type="password"
                  required
                  minLength={6}
                  className="wolf-input"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>

              <button
                className="btn-wolf-primary full-width mt-2"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản'}
              </button>
            </form>
          )}

          {/* Dải phân cách "Hoặc tiếp tục với" */}
          <div className="auth-divider">
            <span>Hoặc tiếp tục với</span>
          </div>

          {/* Nút bấm Google OAuth */}
          <button
            type="button"
            className="btn-google-auth"
            onClick={handleGoogleSignIn}
            disabled={isGoogleSubmitting || isSubmitting}
            title={mode === 'login' ? 'Đăng nhập bằng tài khoản Google' : 'Đăng ký bằng tài khoản Google'}
          >
            {isGoogleSubmitting ? (
              <span className="google-btn-spinner" aria-hidden="true" />
            ) : (
              <svg className="google-logo-svg" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>
              {isGoogleSubmitting
                ? 'Đang kết nối Google...'
                : mode === 'login'
                ? 'Đăng nhập bằng Google'
                : 'Đăng ký bằng Google'}
            </span>
          </button>

          {/* Quick Demo Accounts Helper */}
          <div className="demo-accounts-box">
            <span className="demo-title">
              {isConfigured ? 'Hoặc đăng nhập nhanh bằng tài khoản thử nghiệm:' : 'Tài khoản demo sẵn có (chế độ offline):'}
            </span>
            <div className="demo-btn-group">
              <button
                className="demo-account-pill"
                type="button"
                onClick={() => fillDemoAccount('admin')}
              >
                👑 Tài khoản Quản trị viên (admin@techgear.vn)
              </button>
              <button
                className="demo-account-pill"
                type="button"
                onClick={() => fillDemoAccount('customer')}
              >
                👤 Tài khoản Khách hàng (customer@techgear.vn)
              </button>
            </div>
          </div>

          <div className="auth-footer-nav">
            <Link to="/" className="back-home-link">
              ← Quay về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
