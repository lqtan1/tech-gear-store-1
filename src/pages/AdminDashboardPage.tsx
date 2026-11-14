import { useState, useMemo } from 'react';
import { Link } from 'react-router';

import Toast from '../components/Toast';
import { useAuthStore } from '../features/auth/store';
import { ORDER_STATUS_LABELS as statusLabels } from '../features/orders/constants';
import { useOrderStore } from '../features/orders/store';
import type { OrderStatus } from '../features/orders/types';
import { useProductStore } from '../features/products/store';
import type { Product, ProductInput } from '../features/products/types';
import { getMockProductImages, getProductPrimaryImage } from '../features/products/utils';

const formatPrice = (price: number) => `${price.toLocaleString('vi-VN')} đ`;

const categories = ['Bàn phím', 'Chuột', 'Màn hình', 'Tai nghe'];

const parseImageUrls = (raw: string): string[] =>
  raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

const isValidHttpUrl = (value: string): boolean =>
  value.startsWith('http://') || value.startsWith('https://');

const escapeCsvField = (value: string | number): string =>
  `"${String(value).replace(/"/g, '""')}"`;

interface ProductFormErrors {
  name?: string;
  category?: string;
  price?: string;
  stockQuantity?: string;
  images?: string;
  specs?: string;
  desc?: string;
}

export default function AdminDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const { orders, updateStatus } = useOrderStore();
  const { products, addProduct, updateProduct, deleteProduct, resetProducts } = useProductStore();

  const [activeTab, setActiveTab] = useState<'analytics' | 'products'>('analytics');
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('Tất cả');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) ?? null,
    [orders, selectedOrderId],
  );

  // Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Bàn phím');
  const [formSegment, setFormSegment] = useState<'gaming' | 'office'>('gaming');
  const [formSoftwareId, setFormSoftwareId] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formOriginalPrice, setFormOriginalPrice] = useState('');
  const [formStock, setFormStock] = useState('10');
  const [formImagesText, setFormImagesText] = useState('');
  const [formSpecs, setFormSpecs] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formIsFlashSale, setFormIsFlashSale] = useState(false);
  const [formBadge, setFormBadge] = useState('');
  const [formErrors, setFormErrors] = useState<ProductFormErrors>({});

  const validPreviewUrls = useMemo(
    () => parseImageUrls(formImagesText).filter(isValidHttpUrl),
    [formImagesText],
  );

  // 1. Analytics Computations
  const totalRevenue = useMemo(() => {
    return orders
      .filter((order) => order.status !== 'cancelled')
      .reduce((sum, order) => sum + order.total, 0);
  }, [orders]);

  const completedRevenue = useMemo(() => {
    return orders
      .filter((order) => order.status === 'completed' || order.status === 'confirmed')
      .reduce((sum, order) => sum + order.total, 0);
  }, [orders]);

  const pendingCount = useMemo(
    () => orders.filter((order) => order.status === 'pending').length,
    [orders],
  );

  const confirmedCount = useMemo(
    () => orders.filter((order) => order.status === 'confirmed').length,
    [orders],
  );

  const completedCount = useMemo(
    () => orders.filter((order) => order.status === 'completed').length,
    [orders],
  );

  const shippingCount = useMemo(
    () => orders.filter((order) => order.status === 'shipping').length,
    [orders],
  );

  const totalStockUnits = useMemo(
    () => products.reduce((sum, p) => sum + p.stockQuantity, 0),
    [products],
  );

  const lowStockProducts = useMemo(
    () => products.filter((p) => p.stockQuantity <= 5),
    [products],
  );

  // Category Revenue Structure
  const categoryRevenueStats = useMemo(() => {
    const stats: Record<string, { total: number; count: number }> = {
      'Bàn phím': { total: 0, count: 0 },
      'Chuột': { total: 0, count: 0 },
      'Màn hình': { total: 0, count: 0 },
      'Tai nghe': { total: 0, count: 0 },
    };

    for (const order of orders) {
      for (const item of order.items) {
        const cat = item.product.category;
        const subtotal = item.product.price * item.quantity;
        if (stats[cat]) {
          stats[cat].total += subtotal;
          stats[cat].count += item.quantity;
        } else {
          stats[cat] = { total: subtotal, count: item.quantity };
        }
      }
    }

    const grandTotal = Object.values(stats).reduce((acc, curr) => acc + curr.total, 0) || 1;

    return Object.entries(stats).map(([name, data]) => ({
      name,
      total: data.total,
      count: data.count,
      percent: Math.round((data.total / grandTotal) * 100),
    }));
  }, [orders]);

  // Filtered Products for CRUD table
  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    const cat = selectedCategoryFilter.trim().toLowerCase();

    return products.filter((p) => {
      const matchQuery = !q || p.name.toLowerCase().includes(q) || String(p.id).includes(q);
      const matchCat = !cat || cat === 'tất cả' || p.category.toLowerCase() === cat;
      return matchQuery && matchCat;
    });
  }, [products, productSearch, selectedCategoryFilter]);

  // Modal Handlers
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory('Bàn phím');
    setFormSegment('gaming');
    setFormSoftwareId('');
    setFormPrice('');
    setFormOriginalPrice('');
    setFormStock('15');
    setFormImagesText(getMockProductImages(2).join('\n'));
    setFormSpecs('');
    setFormDesc('');
    setFormIsFlashSale(false);
    setFormBadge('');
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormCategory(product.category);
    setFormSegment(product.segment ?? 'gaming');
    setFormSoftwareId(product.softwareId ?? '');
    setFormPrice(String(product.price));
    setFormOriginalPrice(product.originalPrice ? String(product.originalPrice) : '');
    setFormStock(String(product.stockQuantity));
    setFormImagesText(product.images.join('\n'));
    setFormSpecs(product.specs);
    setFormDesc(product.desc);
    setFormIsFlashSale(Boolean(product.isFlashSale));
    setFormBadge(product.badge ?? '');
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: ProductFormErrors = {};

    if (!formName.trim() || formName.trim().length < 3) {
      errors.name = 'Tên sản phẩm phải có tối thiểu 3 ký tự.';
    }

    if (!formCategory.trim()) {
      errors.category = 'Vui lòng chọn danh mục hợp lệ.';
    }

    const priceNum = Number(formPrice);
    if (!formPrice.trim() || Number.isNaN(priceNum) || priceNum <= 0) {
      errors.price = 'Giá bán phải là số dương lớn hơn 0.';
    }

    const stockNum = Number(formStock);
    if (!formStock.trim() || Number.isNaN(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) {
      errors.stockQuantity = 'Số lượng tồn kho phải là số nguyên không âm (≥ 0).';
    }

    const parsedImages = parseImageUrls(formImagesText);
    if (parsedImages.length === 0 || !parsedImages.every(isValidHttpUrl)) {
      errors.images = 'Vui lòng nhập ít nhất 1 URL ảnh hợp lệ (bắt đầu bằng http:// hoặc https://, mỗi dòng 1 ảnh).';
    }

    if (!formSpecs.trim()) {
      errors.specs = 'Vui lòng nhập thông số kỹ thuật nổi bật.';
    }

    if (!formDesc.trim()) {
      errors.desc = 'Vui lòng nhập mô tả chi tiết sản phẩm.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const price = Number(formPrice);
    const originalPrice = formOriginalPrice.trim() ? Number(formOriginalPrice) : undefined;
    const stockQuantity = Number(formStock);
    const discountPercent =
      originalPrice && originalPrice > price
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : undefined;

    const productPayload: ProductInput = {
      name: formName.trim(),
      segment: formSegment,
      category: formCategory.trim(),
      price,
      originalPrice,
      discountPercent,
      stockQuantity,
      inStock: stockQuantity > 0,
      images: parseImageUrls(formImagesText),
      specs: formSpecs.trim(),
      desc: formDesc.trim(),
      isFlashSale: formIsFlashSale,
      badge: formBadge.trim() ? formBadge.trim() : undefined,
      softwareId: formSoftwareId.trim() ? formSoftwareId.trim() : undefined,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productPayload);
      setToastMessage(`✓ Đã cập nhật sản phẩm "${productPayload.name}" thành công!`);
    } else {
      addProduct(productPayload);
      setToastMessage(`✓ Đã thêm mới sản phẩm "${productPayload.name}" vào cửa hàng!`);
    }

    setIsFormModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deletingProduct) return;
    deleteProduct(deletingProduct.id);
    setToastMessage(`✓ Đã xóa sản phẩm "${deletingProduct.name}" khỏi hệ thống.`);
    setDeletingProduct(null);
  };

  const handleResetData = () => {
    if (window.confirm('Khôi phục danh sách sản phẩm về cài đặt gốc ban đầu?')) {
      resetProducts();
      setToastMessage('Đã khôi phục dữ liệu sản phẩm gốc thành công.');
    }
  };

  const handleExportOrdersCsv = () => {
    if (orders.length === 0) return;

    const headers = [
      'Mã đơn',
      'Ngày đặt',
      'Khách hàng',
      'Số điện thoại',
      'Địa chỉ giao hàng',
      'Ghi chú đơn hàng',
      'Danh sách sản phẩm',
      'Tổng tiền (VNĐ)',
      'Phương thức thanh toán',
      'Trạng thái đơn',
    ];

    const rows = orders.map((order) => {
      const createdAtText = new Date(order.createdAt).toLocaleString('vi-VN');
      const itemsText = order.items
        .map(
          (item) =>
            `${item.product.name} (SL: ${item.quantity}, Đơn giá: ${formatPrice(item.product.price)})`,
        )
        .join('; ');
      const paymentText =
        order.paymentMethod === 'vietqr'
          ? 'VietQR (Chuyển khoản)'
          : 'COD (Thanh toán khi nhận hàng)';
      const statusText = statusLabels[order.status] ?? order.status;
      const noteText = order.shipping.note?.trim() || 'Không có ghi chú';

      return [
        order.id,
        createdAtText,
        order.shipping.name,
        order.shipping.phone,
        order.shipping.address,
        noteText,
        itemsText,
        order.total,
        paymentText,
        statusText,
      ]
        .map(escapeCsvField)
        .join(',');
    });

    const csvContent = `\uFEFF${[headers.map(escapeCsvField).join(','), ...rows].join('\r\n')}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'danh-sach-don-hang.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-page-wolf">
      <div className="container">
        {/* Admin Header */}
        <div className="admin-header-card shadow-sm">
          <div className="admin-welcome-info">
            <span className="section-eyebrow">HỆ THỐNG QUẢN TRỊ TRUNG TÂM</span>
            <h1 className="admin-title">Bảng Điều Khiển TechGear, {user?.name} 👋</h1>
            <p className="admin-sub">
              Giám sát doanh thu trực tuyến, xử lý đơn đặt hàng và quản lý kho hàng thời gian thực.
            </p>
          </div>
          <div className="admin-actions-group">
            <Link className="btn-wolf-outline" to="/">
              🏪 Xem trang khách hàng
            </Link>
            <button className="btn-wolf-secondary" onClick={logout}>
              Đăng xuất
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="admin-tabs-nav">
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📊 Thống Kê & Đơn Hàng ({orders.length})
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            📦 Quản Lý Sản Phẩm CRUD ({products.length})
          </button>
        </div>

        {/* TAB 1: ANALYTICS & ORDERS */}
        {activeTab === 'analytics' && (
          <div className="admin-tab-content">
            {/* 4 Stats Cards */}
            <div className="admin-stats-grid">
              {/* Card 1: Revenue */}
              <div className="stat-card-wolf shadow-sm">
                <div className="stat-icon-wrap revenue">💰</div>
                <div className="stat-content">
                  <span className="stat-label">Tổng doanh thu đơn hàng</span>
                  <strong className="stat-value">{formatPrice(totalRevenue)}</strong>
                  <small className="stat-hint">
                    Đã thanh toán / Hoàn thành: <strong>{formatPrice(completedRevenue)}</strong>
                  </small>
                </div>
              </div>

              {/* Card 2: Orders Count Breakdown */}
              <div className="stat-card-wolf shadow-sm">
                <div className="stat-icon-wrap">📋</div>
                <div className="stat-content">
                  <span className="stat-label">Tổng số đơn hàng</span>
                  <strong className="stat-value">{orders.length} đơn</strong>
                  <div className="order-status-mini-pills">
                    <span className="pill-status-count pending" title="Chờ xử lý">
                      ⏳ {pendingCount} Chờ xử lý
                    </span>
                    <span className="pill-status-count confirmed" title="Đã thanh toán">
                      💳 {confirmedCount} Đã TT
                    </span>
                    <span className="pill-status-count completed" title="Hoàn thành">
                      ✓ {completedCount} Hoàn tất
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: Stock Units */}
              <div className="stat-card-wolf shadow-sm">
                <div className="stat-icon-wrap in-stock">📦</div>
                <div className="stat-content">
                  <span className="stat-label">Tổng sản phẩm trong kho</span>
                  <strong className="stat-value">{products.length} mẫu gear</strong>
                  <small className="stat-hint">
                    Tổng tồn kho: <strong>{totalStockUnits} chiếc</strong>
                  </small>
                </div>
              </div>

              {/* Card 4: Low Stock Alert */}
              <div className="stat-card-wolf shadow-sm">
                <div className="stat-icon-wrap alert">⚠️</div>
                <div className="stat-content">
                  <span className="stat-label">Sắp hết hàng (Low stock ≤ 5)</span>
                  <strong className="stat-value alert-text">{lowStockProducts.length} sản phẩm</strong>
                  <small className="stat-hint">
                    Cần lên kế hoạch nhập hàng thêm
                  </small>
                </div>
              </div>
            </div>

            {/* Low Stock Warning Banner if any */}
            {lowStockProducts.length > 0 && (
              <div className="low-stock-alert-box shadow-sm mb-4">
                <div className="alert-box-header">
                  <span className="alert-badge">CẢNH BÁO TỒN KHO THẤP</span>
                  <span>Có {lowStockProducts.length} sản phẩm sắp hết hàng (tồn ≤ 5 món):</span>
                </div>
                <div className="low-stock-chips-row">
                  {lowStockProducts.map((p) => (
                    <div key={p.id} className="low-stock-chip">
                      <img src={getProductPrimaryImage(p)} alt={p.name} />
                      <span className="chip-name">{p.name}</span>
                      <strong className="chip-qty">Còn {p.stockQuantity} cái</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Revenue Structure by Category */}
            <div className="admin-category-revenue-card shadow-sm mb-4">
              <div className="table-card-head">
                <div>
                  <h2 className="card-title">Cơ Cấu Doanh Thu Theo Danh Mục Thiết Bị</h2>
                  <span className="table-sub">
                    Phân tích tỷ trọng doanh số giữa Bàn phím, Chuột, Màn hình và Tai nghe
                  </span>
                </div>
              </div>

              {/* Visual Multi-segment Progress Bar */}
              <div className="category-revenue-progress-bar">
                {categoryRevenueStats.map((item, index) => {
                  const colors = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899'];
                  return (
                    <div
                      key={item.name}
                      className="progress-segment"
                      style={{
                        width: `${Math.max(item.percent, 3)}%`,
                        backgroundColor: colors[index % colors.length],
                      }}
                      title={`${item.name}: ${item.percent}% (${formatPrice(item.total)})`}
                    />
                  );
                })}
              </div>

              {/* Category Breakdown Grid */}
              <div className="category-breakdown-grid">
                {categoryRevenueStats.map((item, index) => {
                  const colors = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899'];
                  const icons: Record<string, string> = {
                    'Bàn phím': '⌨️',
                    'Chuột': '🖱️',
                    'Màn hình': '🖥️',
                    'Tai nghe': '🎧',
                  };
                  return (
                    <div key={item.name} className="cat-breakdown-item">
                      <div className="cat-breakdown-top">
                        <span className="cat-bullet" style={{ backgroundColor: colors[index % colors.length] }} />
                        <span className="cat-title-text">
                          {icons[item.name] ?? '📦'} {item.name}
                        </span>
                        <strong className="cat-percent">{item.percent}%</strong>
                      </div>
                      <div className="cat-breakdown-bottom">
                        <span className="cat-revenue-val">{formatPrice(item.total)}</span>
                        <small className="cat-qty-sold">{item.count} sản phẩm đã bán</small>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Orders List Table */}
            <div className="admin-table-card shadow-sm">
              <div className="table-card-head">
                <div>
                  <h2>Danh Sách Đơn Đặt Hàng ({orders.length})</h2>
                  <span className="table-sub">Quản lý, xem chi tiết và cập nhật trạng thái đơn hàng trực tiếp</span>
                </div>
                <button
                  type="button"
                  className="btn-wolf-outline export-csv-btn"
                  onClick={handleExportOrdersCsv}
                  disabled={orders.length === 0}
                  title="Xuất danh sách đơn hàng ra file CSV tương thích Excel"
                >
                  📥 Xuất Excel
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="empty-state-wolf compact">
                  <p>Chưa có đơn hàng nào được ghi nhận.</p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="admin-table admin-orders-table">
                    <thead>
                      <tr>
                        <th>Mã đơn</th>
                        <th>Khách hàng & Địa chỉ</th>
                        <th>Sản phẩm đặt</th>
                        <th>Ngày tạo</th>
                        <th>Tổng tiền</th>
                        <th>Thanh toán</th>
                        <th>Trạng thái đơn</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td>
                            <button
                              type="button"
                              className="order-id-btn"
                              onClick={() => setSelectedOrderId(order.id)}
                              title={`Xem chi tiết đơn hàng ${order.id}`}
                            >
                              <strong className="order-id-code">{order.id}</strong>
                              <span className="order-view-hint" aria-hidden="true">👁️</span>
                            </button>
                          </td>
                          <td>
                            <div className="customer-info-cell">
                              <strong title={order.shipping.name}>{order.shipping.name}</strong>
                              <small>{order.shipping.phone}</small>
                              <small className="address-text" title={order.shipping.address}>
                                {order.shipping.address}
                              </small>
                            </div>
                          </td>
                          <td>
                            <div className="order-items-mini-list">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="order-item-chip" title={item.product.name}>
                                  <span>{item.product.name}</span>
                                  <strong className="chip-badge">x{item.quantity}</strong>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                          <td>
                            <strong className="order-price">{formatPrice(order.total)}</strong>
                          </td>
                          <td>
                            <span className={`payment-pill ${order.paymentMethod}`}>
                              {order.paymentMethod === 'vietqr' ? 'VietQR' : 'COD'}
                            </span>
                          </td>
                          <td>
                            <select
                              className={`status-select ${order.status}`}
                              value={order.status}
                              onChange={(event) =>
                                updateStatus(order.id, event.target.value as OrderStatus)
                              }
                              aria-label={`Trạng thái ${order.id}`}
                            >
                              {Object.entries(statusLabels).map(([value, label]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCT MANAGEMENT (CRUD) */}
        {activeTab === 'products' && (
          <div className="admin-tab-content">
            {/* Toolbar */}
            <div className="admin-product-toolbar shadow-sm">
              <div className="toolbar-left-group">
                {/* Search */}
                <div className="search-filter-input">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Tìm theo tên sản phẩm hoặc ID..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                  {productSearch && (
                    <button type="button" className="clear-search-btn" onClick={() => setProductSearch('')}>
                      ✕
                    </button>
                  )}
                </div>

                {/* Category filter */}
                <select
                  className="filter-select"
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                >
                  <option value="Tất cả">Danh mục: Tất cả</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="toolbar-actions-group">
                <button
                  type="button"
                  className="btn-wolf-primary"
                  onClick={handleOpenCreateModal}
                >
                  + Thêm sản phẩm mới
                </button>
                <button
                  type="button"
                  className="btn-wolf-outline"
                  onClick={handleResetData}
                  title="Khôi phục danh sách sản phẩm mẫu ban đầu"
                >
                  🔄 Khôi phục dữ liệu gốc
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="admin-table-card shadow-sm">
              <div className="table-card-head">
                <div>
                  <h2>Danh Sách Sản Phẩm Trong Cửa Hàng ({filteredProducts.length})</h2>
                  <span className="table-sub">Các thay đổi sẽ lập tức cập nhật ra trang chủ và trang sản phẩm</span>
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="empty-state-wolf compact">
                  <p>Không tìm thấy sản phẩm nào khớp với bộ lọc.</p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="admin-table admin-products-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Ảnh</th>
                        <th>Tên sản phẩm</th>
                        <th>Danh mục</th>
                        <th>Giá bán</th>
                        <th>Tồn kho</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => {
                        const isLowStock = product.stockQuantity <= 5 && product.stockQuantity > 0;
                        const isOutOfStock = product.stockQuantity <= 0;

                        return (
                          <tr key={product.id}>
                            <td>
                              <span className="sku-badge">#{product.id}</span>
                            </td>
                            <td>
                              <img
                                src={getProductPrimaryImage(product)}
                                alt={product.name}
                                className="table-product-thumbnail"
                              />
                            </td>
                            <td>
                              <div className="product-title-cell">
                                <Link
                                  to={`/products/${product.id}`}
                                  className="product-table-name"
                                  title={product.name}
                                >
                                  {product.name}
                                </Link>
                                <small className="product-table-specs" title={product.specs}>
                                  {product.specs}
                                </small>
                              </div>
                            </td>
                            <td>
                              <span className="cat-table-badge">{product.category}</span>
                              <span
                                className={`cat-table-badge ${product.segment === 'gaming' ? 'gaming' : 'office'}`}
                                style={{ display: 'block', marginTop: '4px', fontSize: '0.72rem' }}
                              >
                                {product.segment === 'gaming' ? '🎮 Gaming' : '💼 Văn phòng'}
                              </span>
                            </td>
                            <td>
                              <div className="price-table-cell">
                                <strong>{formatPrice(product.price)}</strong>
                                {product.originalPrice && product.originalPrice > product.price && (
                                  <del>{formatPrice(product.originalPrice)}</del>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="stock-table-cell">
                                {isOutOfStock ? (
                                  <span className="stock-badge out-of-stock">Hết hàng (0)</span>
                                ) : isLowStock ? (
                                  <span className="stock-badge low-stock">
                                    ⚠️ Còn {product.stockQuantity} (Sắp hết)
                                  </span>
                                ) : (
                                  <span className="stock-badge in-stock">
                                    ✓ Còn {product.stockQuantity}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="product-status-badges">
                                {product.isFlashSale && <span className="status-chip flash">⚡ Flash</span>}
                                {product.badge && <span className="status-chip badge">{product.badge}</span>}
                                {!product.isFlashSale && !product.badge && (
                                  <span className="status-chip normal">Bình thường</span>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="table-actions-cell">
                                <button
                                  type="button"
                                  className="action-btn edit"
                                  onClick={() => handleOpenEditModal(product)}
                                  title="Chỉnh sửa sản phẩm"
                                >
                                  ✏️ Sửa
                                </button>
                                <button
                                  type="button"
                                  className="action-btn delete"
                                  onClick={() => setDeletingProduct(product)}
                                  title="Xóa sản phẩm"
                                >
                                  🗑️ Xóa
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL: THÊM MỚI / CHỈNH SỬA SẢN PHẨM (CRUD) */}
        {isFormModalOpen && (
          <div className="admin-modal-overlay" onClick={() => setIsFormModalOpen(false)}>
            <div className="admin-modal-card shadow-lg" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingProduct ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Mới Sản Phẩm Vào Cửa Hàng'}</h2>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setIsFormModalOpen(false)}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="admin-modal-form">
                <div className="form-grid-2">
                  {/* Name */}
                  <div className="form-group span-2">
                    <label className="form-label">
                      Tên sản phẩm <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-input ${formErrors.name ? 'input-error' : ''}`}
                      placeholder="Ví dụ: Bàn phím cơ không dây NuPhy Air75 V2"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                    />
                    {formErrors.name && <span className="error-message">{formErrors.name}</span>}
                  </div>

                  {/* Category */}
                  <div className="form-group">
                    <label className="form-label">
                      Danh mục <span className="required">*</span>
                    </label>
                    <select
                      className={`form-input ${formErrors.category ? 'input-error' : ''}`}
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    {formErrors.category && <span className="error-message">{formErrors.category}</span>}
                  </div>

                  {/* Segment */}
                  <div className="form-group">
                    <label className="form-label">
                      Phân khúc mục tiêu <span className="required">*</span>
                    </label>
                    <select
                      className="form-input"
                      value={formSegment}
                      onChange={(e) => setFormSegment(e.target.value as 'gaming' | 'office')}
                    >
                      <option value="gaming">🎮 Gaming Gear</option>
                      <option value="office">💼 Thiết bị văn phòng</option>
                    </select>
                  </div>

                  {/* Software Driver */}
                  <div className="form-group">
                    <label className="form-label">Phần mềm điều khiển đi kèm</label>
                    <select
                      className="form-input"
                      value={formSoftwareId}
                      onChange={(e) => setFormSoftwareId(e.target.value)}
                    >
                      <option value="">-- Không có / Driver tự nhận Plug & Play --</option>
                      <option value="logitech-ghub">Logitech G HUB</option>
                      <option value="logi-options-plus">Logi Options+</option>
                      <option value="keychron-launcher">Keychron Launcher / VIA</option>
                      <option value="razer-synapse">Razer Synapse</option>
                      <option value="nuphy-console">NuPhy Console</option>
                    </select>
                  </div>

                  {/* Stock */}
                  <div className="form-group">
                    <label className="form-label">
                      Số lượng tồn kho <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      className={`form-input ${formErrors.stockQuantity ? 'input-error' : ''}`}
                      placeholder="Số lượng tồn kho (chiếc)"
                      value={formStock}
                      onChange={(e) => setFormStock(e.target.value)}
                    />
                    {formErrors.stockQuantity && (
                      <span className="error-message">{formErrors.stockQuantity}</span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="form-group">
                    <label className="form-label">
                      Giá bán (VNĐ) <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      className={`form-input ${formErrors.price ? 'input-error' : ''}`}
                      placeholder="Ví dụ: 2290000"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                    />
                    {formErrors.price && <span className="error-message">{formErrors.price}</span>}
                  </div>

                  {/* Original Price */}
                  <div className="form-group">
                    <label className="form-label">Giá niêm yết cũ (Tùy chọn)</label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      className="form-input"
                      placeholder="Ví dụ: 2890000"
                      value={formOriginalPrice}
                      onChange={(e) => setFormOriginalPrice(e.target.value)}
                    />
                  </div>

                  {/* Gallery Image URLs */}
                  <div className="form-group span-2">
                    <label className="form-label">
                      Link ảnh sản phẩm (mỗi dòng 1 URL, dòng đầu là ảnh đại diện){' '}
                      <span className="required">*</span>
                    </label>
                    <textarea
                      rows={4}
                      className={`form-input form-textarea url-textarea ${formErrors.images ? 'input-error' : ''}`}
                      placeholder="https://example.com/hero.jpg&#10;https://example.com/top.jpg"
                      value={formImagesText}
                      onChange={(e) => setFormImagesText(e.target.value)}
                    />
                    {formErrors.images && <span className="error-message">{formErrors.images}</span>}
                    {validPreviewUrls.length > 0 && (
                      <div className="form-image-preview mt-2">
                        <div className="form-image-preview-list">
                          {validPreviewUrls.map((url, idx) => (
                            <img
                              key={`${url}-${idx}`}
                              src={url}
                              alt={`Xem trước ${idx + 1}`}
                              title={idx === 0 ? 'Ảnh đại diện' : `Ảnh ${idx + 1}`}
                            />
                          ))}
                        </div>
                        <small>{validPreviewUrls.length} ảnh hợp lệ</small>
                      </div>
                    )}
                  </div>

                  {/* Specs */}
                  <div className="form-group span-2">
                    <label className="form-label">
                      Thông số kỹ thuật nổi bật <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-input ${formErrors.specs ? 'input-error' : ''}`}
                      placeholder="Ví dụ: Cảm biến 30K DPI, nặng 63g, kết nối không dây 2.4GHz"
                      value={formSpecs}
                      onChange={(e) => setFormSpecs(e.target.value)}
                    />
                    {formErrors.specs && <span className="error-message">{formErrors.specs}</span>}
                  </div>

                  {/* Description */}
                  <div className="form-group span-2">
                    <label className="form-label">
                      Mô tả chi tiết sản phẩm <span className="required">*</span>
                    </label>
                    <textarea
                      rows={3}
                      className={`form-input ${formErrors.desc ? 'input-error' : ''}`}
                      placeholder="Giới thiệu chi tiết tính năng, cảm giác sử dụng và đối tượng phù hợp..."
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                    />
                    {formErrors.desc && <span className="error-message">{formErrors.desc}</span>}
                  </div>

                  {/* Badge & Flash sale options */}
                  <div className="form-group">
                    <label className="form-label">Nhãn nổi bật (Badge)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ví dụ: Bán chạy, Mới về, Top 1"
                      value={formBadge}
                      onChange={(e) => setFormBadge(e.target.value)}
                    />
                  </div>

                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formIsFlashSale}
                        onChange={(e) => setFormIsFlashSale(e.target.checked)}
                      />
                      <span>Đánh dấu hiển thị mục Flash Sale ⚡</span>
                    </label>
                  </div>
                </div>

                <div className="modal-actions-row">
                  <button
                    type="button"
                    className="btn-wolf-secondary"
                    onClick={() => setIsFormModalOpen(false)}
                  >
                    Hủy bỏ
                  </button>
                  <button type="submit" className="btn-wolf-primary">
                    {editingProduct ? 'Cập nhật sản phẩm' : 'Lưu sản phẩm mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: HỘP THOẠI XÁC NHẬN TRƯỚC KHI XÓA (CONFIRM DELETE) */}
        {deletingProduct && (
          <div className="admin-modal-overlay" onClick={() => setDeletingProduct(null)}>
            <div className="admin-modal-card confirm-delete shadow-lg" onClick={(e) => e.stopPropagation()}>
              <div className="confirm-icon-box">⚠️</div>
              <h2 className="confirm-title">Xác nhận xóa sản phẩm?</h2>
              <p className="confirm-desc">
                Bạn có chắc chắn muốn xóa sản phẩm <strong>"{deletingProduct.name}"</strong> (Mã SKU: #{deletingProduct.id}) khỏi cửa hàng? Hành động này sẽ lập tức loại bỏ sản phẩm khỏi danh sách bán hàng.
              </p>
              <div className="modal-actions-row center">
                <button
                  type="button"
                  className="btn-wolf-secondary"
                  onClick={() => setDeletingProduct(null)}
                >
                  Không, giữ lại
                </button>
                <button
                  type="button"
                  className="btn-danger-confirm"
                  onClick={handleConfirmDelete}
                >
                  Đồng ý xóa sản phẩm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: CHI TIẾT ĐƠN HÀNG */}
        {selectedOrder && (
          <div className="admin-modal-overlay" onClick={() => setSelectedOrderId(null)}>
            <div
              className="admin-modal-card order-detail-modal shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div>
                  <h2>Chi tiết đơn hàng {selectedOrder.id}</h2>
                  <p className="order-modal-date">
                    Ngày đặt: {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setSelectedOrderId(null)}
                  aria-label="Đóng chi tiết đơn hàng"
                >
                  ✕
                </button>
              </div>

              <div className="order-modal-status-bar">
                <div className="order-meta-pill-group">
                  <span className="order-meta-label">Thanh toán:</span>
                  <span className={`payment-pill ${selectedOrder.paymentMethod}`}>
                    {selectedOrder.paymentMethod === 'vietqr'
                      ? 'VietQR (Chuyển khoản)'
                      : 'COD (Thanh toán khi nhận hàng)'}
                  </span>
                </div>
                <div className="order-meta-pill-group">
                  <span className="order-meta-label">Trạng thái:</span>
                  <select
                    className={`status-select compact ${selectedOrder.status}`}
                    value={selectedOrder.status}
                    onChange={(event) =>
                      updateStatus(selectedOrder.id, event.target.value as OrderStatus)
                    }
                    aria-label={`Cập nhật trạng thái đơn ${selectedOrder.id}`}
                  >
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="order-detail-info-grid">
                <div className="order-detail-field">
                  <span className="order-detail-label">Tên khách hàng</span>
                  <strong>{selectedOrder.shipping.name}</strong>
                </div>
                <div className="order-detail-field">
                  <span className="order-detail-label">Số điện thoại</span>
                  <strong>{selectedOrder.shipping.phone}</strong>
                </div>
                <div className="order-detail-field span-2">
                  <span className="order-detail-label">Địa chỉ giao hàng đầy đủ</span>
                  <p className="order-detail-value">{selectedOrder.shipping.address}</p>
                </div>
                <div className="order-detail-field span-2">
                  <span className="order-detail-label">Ghi chú đơn hàng</span>
                  <p className="order-detail-value muted">
                    {selectedOrder.shipping.note?.trim() || 'Không có ghi chú'}
                  </p>
                </div>
              </div>

              <div className="order-detail-items-section">
                <h3 className="order-detail-section-title">
                  Sản phẩm đã đặt ({selectedOrder.items.length})
                </h3>
                <div className="order-detail-items-list">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={`${item.product.id}-${idx}`} className="order-detail-item-row">
                      <img
                        src={getProductPrimaryImage(item.product)}
                        alt={item.product.name}
                        className="order-detail-item-thumb"
                      />
                      <div className="order-detail-item-info">
                        <strong>{item.product.name}</strong>
                        <span className="order-detail-item-meta">
                          Đơn giá: {formatPrice(item.product.price)} × {item.quantity}
                        </span>
                      </div>
                      <strong className="order-detail-item-subtotal">
                        {formatPrice(item.product.price * item.quantity)}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="order-detail-footer">
                <div className="order-detail-total-box">
                  <span>Tổng thanh toán:</span>
                  <strong className="order-detail-total-price">{formatPrice(selectedOrder.total)}</strong>
                </div>
                <button
                  type="button"
                  className="btn-wolf-secondary"
                  onClick={() => setSelectedOrderId(null)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Feedback */}
        <Toast message={toastMessage} variant="info" onClose={() => setToastMessage(null)} />
      </div>
    </div>
  );
}
