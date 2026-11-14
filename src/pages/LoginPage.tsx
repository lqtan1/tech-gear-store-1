import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';

import { useAuthStore } from '../features/auth/store';

interface LoginLocationState {
  from?: string;
}

export default function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('admin@techgear.vn');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');
  const requestedPath = (location.state as LoginLocationState | null)?.from;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!login(email, password)) {
      setError('Email hoặc mật khẩu không chính xác.');
      return;
    }

    const authenticatedUser = useAuthStore.getState().user;
    const destination =
      authenticatedUser?.role === 'admin'
        ? requestedPath ?? '/admin'
        : requestedPath && requestedPath !== '/admin'
          ? requestedPath
          : '/';
    navigate(destination, { replace: true });
  };

  const fillDemoAccount = (account: 'admin' | 'customer') => {
    if (account === 'admin') {
      setEmail('admin@techgear.vn');
      setPassword('admin');
    } else {
      setEmail('customer@techgear.vn');
      setPassword('customer');
    }
    setError('');
  };

  return (
    <div className="login-page-wolf">
      <div className="container auth-layout">
        <form className="auth-card shadow-sm" onSubmit={handleSubmit}>
          <div className="auth-brand-head">
            <div className="brand-icon-box small">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
            <span className="auth-brand-name">TECH<span>GEAR</span></span>
          </div>

          <span className="section-eyebrow text-center d-block">HỆ THỐNG ĐĂNG NHẬP</span>
          <h1 className="auth-title">Chào mừng trở lại!</h1>
          <p className="auth-desc">Đăng nhập để quản lý đơn hàng và nhận ưu đãi độc quyền.</p>

          <div className="form-group mb-3">
            <label htmlFor="login-email">Địa chỉ Email *</label>
            <input
              id="login-email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
              className="wolf-input"
              placeholder="admin@techgear.vn"
            />
          </div>

          <div className="form-group mb-3">
            <label htmlFor="login-password">Mật khẩu *</label>
            <input
              id="login-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              required
              className="wolf-input"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="form-error-msg" role="alert">{error}</p>}

          <button className="btn-wolf-primary full-width mt-2" type="submit">
            Đăng nhập ngay
          </button>

          <div className="demo-accounts-box">
            <span className="demo-title">Tài khoản demo sẵn có:</span>
            <div className="demo-btn-group">
              <button
                className="demo-account-pill"
                type="button"
                onClick={() => fillDemoAccount('admin')}
              >
                👑 Tài khoản Admin
              </button>
              <button
                className="demo-account-pill"
                type="button"
                onClick={() => fillDemoAccount('customer')}
              >
                👤 Tài khoản Khách hàng
              </button>
            </div>
          </div>

          <div className="auth-footer-nav">
            <Link to="/" className="back-home-link">
              ← Quay về trang chủ
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
