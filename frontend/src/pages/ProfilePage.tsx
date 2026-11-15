import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { Link } from 'react-router';

import { useAuth } from '../app/AuthContext';
import { useAuthStore } from '../features/auth/store';
import { useCartStore } from '../features/cart/store';
import { useOrderStore } from '../features/orders/store';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export default function ProfilePage() {
  const { profile, user: supabaseUser, updateProfile } = useAuth();
  const storeUser = useAuthStore((state) => state.user);
  const orders = useOrderStore((state) => state.orders);
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Tab State: 'info' | 'password'
  const [activeTab, setActiveTab] = useState<'info' | 'password'>('info');

  // Tab 1: Form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [preferredPayment, setPreferredPayment] = useState<'vietqr' | 'cod'>('vietqr');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Tab 2: Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Feedback states
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Avatar URL modal / prompt toggle
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');

  // Initialize form when profile or user loads
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setCity(profile.city || '');
      setDistrict(profile.district || '');
      setAddress(profile.address || '');
      setPreferredPayment(profile.preferred_payment || 'vietqr');
      setAvatarUrl(profile.avatar_url || '');
    } else if (storeUser) {
      setFullName(storeUser.name || '');
      setPhone(storeUser.phone || '');
      setCity(storeUser.city || '');
      setDistrict(storeUser.district || '');
      setAddress(storeUser.address || '');
      setPreferredPayment(storeUser.preferred_payment || 'vietqr');
      setAvatarUrl(storeUser.avatar_url || '');
    }
  }, [profile, storeUser]);

  // Count user orders
  const currentUserId = profile?.id || storeUser?.id;
  const currentUserEmail = profile?.email || storeUser?.email;
  const userOrdersCount = orders.filter(
    (order) =>
      (currentUserId && order.userId === currentUserId) ||
      (currentUserEmail && order.customerEmail === currentUserEmail),
  ).length;

  // Handle Tab 1: Save Profile & Address
  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const result = await updateProfile({
      full_name: fullName.trim(),
      phone: phone.trim(),
      city: city.trim(),
      district: district.trim(),
      address: address.trim(),
      preferred_payment: preferredPayment,
      avatar_url: avatarUrl.trim(),
    });

    setIsSaving(false);

    if (result.success) {
      setSuccessMessage('Đã cập nhật hồ sơ cá nhân và địa chỉ giao hàng thành công!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } else {
      setErrorMessage(result.error || 'Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại.');
    }
  };

  // Handle Tab 2: Change Password
  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (newPassword.length < 6) {
      setErrorMessage('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Xác nhận mật khẩu mới không khớp.');
      return;
    }

    setIsChangingPassword(true);

    try {
      if (isSupabaseConfigured() && supabaseUser) {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (error) {
          setErrorMessage(error.message || 'Không thể đổi mật khẩu. Vui lòng thử lại sau.');
        } else {
          setSuccessMessage('Đổi mật khẩu thành công! Bạn có thể sử dụng mật khẩu mới trong lần đăng nhập tới.');
          setNewPassword('');
          setConfirmPassword('');
          setTimeout(() => setSuccessMessage(null), 4000);
        }
      } else {
        // Demo account simulation
        setSuccessMessage('Đổi mật khẩu tài khoản thành công (chế độ Demo)!');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Lỗi hệ thống khi cập nhật mật khẩu.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle Avatar File Upload
  const handleAvatarFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 3MB)
    if (file.size > 3 * 1024 * 1024) {
      setErrorMessage('Kích thước ảnh đại diện tối đa là 3MB.');
      return;
    }

    setIsUploadingAvatar(true);
    setErrorMessage(null);

    try {
      if (isSupabaseConfigured()) {
        const fileExt = file.name.split('.').pop();
        const fileName = `avatar-${currentUserId || Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file, { upsert: true });

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        const newUrl = publicUrlData.publicUrl;
        setAvatarUrl(newUrl);
        await updateProfile({ avatar_url: newUrl });
        setSuccessMessage('Đã tải lên và cập nhật ảnh đại diện thành công!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        // Fallback local object URL
        const localUrl = URL.createObjectURL(file);
        setAvatarUrl(localUrl);
        await updateProfile({ avatar_url: localUrl });
        setSuccessMessage('Đã cập nhật ảnh đại diện (Preview)!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Lỗi tải ảnh lên storage.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Handle custom URL save
  const handleApplyCustomUrl = async () => {
    if (!customUrlInput.trim()) return;
    setAvatarUrl(customUrlInput.trim());
    await updateProfile({ avatar_url: customUrlInput.trim() });
    setShowUrlInput(false);
    setCustomUrlInput('');
    setSuccessMessage('Đã cập nhật ảnh đại diện từ URL!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const displayName = fullName || storeUser?.name || 'Khách hàng';
  const displayEmail = profile?.email || storeUser?.email || 'Chưa cập nhật email';
  const roleName = (profile?.role || storeUser?.role) === 'admin' ? 'Quản trị viên' : 'Khách hàng thân thiết';

  return (
    <div className="profile-page-wolf py-8">
      <div className="container max-w-[1220px] mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="profile-breadcrumb mb-6 text-sm flex items-center gap-2">
          <Link to="/" className="text-muted hover:underline">
            Trang chủ
          </Link>
          <span className="text-muted">/</span>
          <span className="text-muted">Tài khoản</span>
          <span className="text-muted">/</span>
          <span className="font-semibold text-main">Hồ sơ & Cài đặt</span>
        </nav>

        {/* Global Notifications */}
        {successMessage && (
          <div className="profile-alert success mb-4 flex items-center justify-between p-3.5 rounded-lg">
            <div className="flex items-center gap-2.5">
              <span className="alert-icon">✓</span>
              <span>{successMessage}</span>
            </div>
            <button
              type="button"
              className="alert-close-btn"
              onClick={() => setSuccessMessage(null)}
            >
              ✕
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="profile-alert error mb-4 flex items-center justify-between p-3.5 rounded-lg">
            <div className="flex items-center gap-2.5">
              <span className="alert-icon">⚠️</span>
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              className="alert-close-btn"
              onClick={() => setErrorMessage(null)}
            >
              ✕
            </button>
          </div>
        )}

        {/* 2-Column Layout */}
        <div className="profile-layout-grid">
          {/* CỘT TRÁI: THẺ TỔNG QUAN TÀI KHOẢN */}
          <aside className="profile-overview-card">
            <div className="profile-avatar-wrap">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="profile-avatar-img"
                  onError={() => setAvatarUrl('')}
                />
              ) : (
                <div className="profile-avatar-placeholder">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Upload actions */}
              <div className="avatar-action-buttons">
                <label className="avatar-btn upload-btn" title="Tải ảnh mới từ máy">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    disabled={isUploadingAvatar}
                    style={{ display: 'none' }}
                  />
                  <span>{isUploadingAvatar ? '⏳' : '📷'} Đổi ảnh</span>
                </label>
                <button
                  type="button"
                  className="avatar-btn link-btn"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  title="Nhập URL ảnh"
                >
                  🔗 URL
                </button>
              </div>

              {showUrlInput && (
                <div className="avatar-url-popover">
                  <input
                    type="url"
                    placeholder="https://... ảnh đại diện"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    className="wolf-input text-xs w-full mb-2"
                  />
                  <div className="avatar-url-btns flex gap-2 justify-center">
                    <button
                      type="button"
                      className="btn-wolf-primary small"
                      onClick={handleApplyCustomUrl}
                    >
                      Áp dụng
                    </button>
                    <button
                      type="button"
                      className="btn-wolf-outline small"
                      onClick={() => setShowUrlInput(false)}
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="profile-user-headline">
              <h2 className="profile-display-name">{displayName}</h2>
              <div className="profile-email-text">{displayEmail}</div>
              {/* Hai nhãn trạng thái nằm ngang hàng nhau */}
              <div className="profile-badges-row">
                <span className="verified-badge" title="Tài khoản đã xác thực">
                  ✓ Đã xác thực
                </span>
                <span className={`role-pill ${(profile?.role || storeUser?.role) === 'admin' ? 'admin' : 'customer'}`}>
                  {(profile?.role || storeUser?.role) === 'admin' ? '⚙️ Quản trị viên' : '🛍️ Khách hàng'}
                </span>
              </div>
            </div>

            <hr className="profile-card-divider" />

            {/* Thống kê nhanh */}
            <div className="profile-quick-stats">
              <div className="stat-item">
                <span className="stat-label">Đơn hàng đã đặt</span>
                <strong className="stat-value">
                  <Link to="/orders" className="stat-link">
                    {userOrdersCount} đơn hàng
                  </Link>
                </strong>
              </div>
              <div className="stat-item">
                <span className="stat-label">Thanh toán mặc định</span>
                <span className="stat-value">
                  {preferredPayment === 'vietqr' ? '⚡ VietQR' : '💵 COD'}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Bảo mật mật khẩu</span>
                <span className="stat-value stat-val-secure">● An toàn</span>
              </div>
            </div>

            {/* Quick Actions (Nút bấm đầy đủ chiều rộng rõ ràng) */}
            <div className="profile-aside-actions">
              <Link to="/orders" className="profile-action-btn primary" title="Xem lịch sử đơn hàng">
                <div className="btn-left-content">
                  <span className="btn-icon">📋</span>
                  <span>Lịch sử đơn hàng</span>
                </div>
                <div className="btn-right-content">
                  <span className="btn-badge">{userOrdersCount} đơn</span>
                  <span className="btn-arrow">→</span>
                </div>
              </Link>

              <Link to="/cart" className="profile-action-btn secondary" title="Xem giỏ hàng hiện tại">
                <div className="btn-left-content">
                  <span className="btn-icon">🛒</span>
                  <span>Giỏ hàng hiện tại</span>
                </div>
                <div className="btn-right-content">
                  <span className="btn-badge">{cartCount} món</span>
                  <span className="btn-arrow">→</span>
                </div>
              </Link>

              {storeUser?.role === 'admin' && (
                <Link to="/admin" className="profile-action-btn admin" title="Truy cập Trang Quản Trị">
                  <div className="btn-left-content">
                    <span className="btn-icon">⚙️</span>
                    <span>Trang Quản Trị Admin</span>
                  </div>
                  <div className="btn-right-content">
                    <span className="btn-arrow">→</span>
                  </div>
                </Link>
              )}
            </div>
          </aside>

          {/* CỘT PHẢI: TABS CÀI ĐẶT */}
          <main className="profile-tabs-card">
            {/* Tab navigation headers */}
            <div className="profile-tabs-header flex gap-2 border-b">
              <button
                type="button"
                className={`profile-tab-btn ${activeTab === 'info' ? 'active' : ''}`}
                onClick={() => setActiveTab('info')}
              >
                <span>👤 Thông tin & Địa chỉ giao hàng</span>
              </button>
              <button
                type="button"
                className={`profile-tab-btn ${activeTab === 'password' ? 'active' : ''}`}
                onClick={() => setActiveTab('password')}
              >
                <span>🔒 Đổi mật khẩu</span>
              </button>
            </div>

            {/* TAB 1: THÔNG TIN CÁ NHÂN & ĐỊA CHỈ GIAO HÀNG */}
            {activeTab === 'info' && (
              <form className="profile-form-body p-6" onSubmit={handleSaveProfile}>
                <div className="form-intro mb-5">
                  <h3 className="text-base font-bold text-main">Thông tin cá nhân & Địa chỉ nhận hàng</h3>
                  <p className="text-sm text-muted">
                    Các thông tin dưới đây sẽ được tự động điền sẵn khi bạn thanh toán đơn hàng tại TechGear Store.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-fullname">
                      Họ và tên *
                    </label>
                    <input
                      id="profile-fullname"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Văn An"
                      className="wolf-input w-full"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-phone">
                      Số điện thoại nhận hàng *
                    </label>
                    <input
                      id="profile-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ví dụ: 0987654321"
                      className="wolf-input w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-email">
                      Email đăng nhập (Chỉ đọc)
                    </label>
                    <input
                      id="profile-email"
                      type="email"
                      disabled
                      value={displayEmail}
                      className="wolf-input w-full bg-slate-100 dark:bg-slate-800 cursor-not-allowed opacity-75"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-city">
                      Tỉnh / Thành phố
                    </label>
                    <input
                      id="profile-city"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ví dụ: TP. Hồ Chí Minh, Hà Nội, Đà Nẵng..."
                      className="wolf-input w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-district">
                      Quận / Huyện
                    </label>
                    <input
                      id="profile-district"
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="Ví dụ: Quận 1, Quận 11, Cầu Giấy..."
                      className="wolf-input w-full"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Phương thức thanh toán ưu tiên
                    </label>
                    <div className="payment-radio-group flex gap-3 mt-1.5">
                      <label className={`pref-payment-option ${preferredPayment === 'vietqr' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="preferred_payment"
                          checked={preferredPayment === 'vietqr'}
                          onChange={() => setPreferredPayment('vietqr')}
                        />
                        <span>⚡ VietQR tức thì</span>
                      </label>
                      <label className={`pref-payment-option ${preferredPayment === 'cod' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="preferred_payment"
                          checked={preferredPayment === 'cod'}
                          onChange={() => setPreferredPayment('cod')}
                        />
                        <span>💵 COD khi nhận</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-group mb-6">
                  <label className="form-label" htmlFor="profile-address">
                    Địa chỉ nhận hàng chi tiết (Số nhà, tên đường, tòa nhà...)
                  </label>
                  <textarea
                    id="profile-address"
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ví dụ: 70 Lữ Gia, Phường 15..."
                    className="wolf-textarea w-full"
                  />
                </div>

                <div className="form-submit-row flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="btn-wolf-primary py-2.5 px-6 font-semibold"
                  >
                    {isSaving ? '⏳ Đang lưu...' : '💾 Lưu thay đổi hồ sơ'}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: ĐỔI MẬT KHẨU */}
            {activeTab === 'password' && (
              <form className="profile-form-body p-6 max-w-lg" onSubmit={handleChangePassword}>
                <div className="form-intro mb-5">
                  <h3 className="text-base font-bold text-main">Đổi mật khẩu tài khoản</h3>
                  <p className="text-sm text-muted">
                    Để đảm bảo an toàn cho tài khoản, hãy đặt mật khẩu có độ dài tối thiểu 6 ký tự.
                  </p>
                </div>

                <div className="form-group mb-4">
                  <label className="form-label" htmlFor="new-password">
                    Mật khẩu mới *
                  </label>
                  <div className="profile-password-field">
                    <input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="wolf-input password-input-inner"
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      title={showNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      aria-label={showNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showNewPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="form-group mb-6">
                  <label className="form-label" htmlFor="confirm-password">
                    Xác nhận mật khẩu mới *
                  </label>
                  <div className="profile-password-field">
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                      className="wolf-input password-input-inner"
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      title={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showConfirmPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="form-submit-row">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="btn-wolf-primary py-2.5 px-6 font-semibold"
                  >
                    {isChangingPassword ? '⏳ Đang xử lý...' : '🔒 Cập nhật mật khẩu'}
                  </button>
                </div>
              </form>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
