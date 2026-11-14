import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';

import ProductCard from '../components/ProductCard';
import ProductQuickViewModal from '../components/ProductQuickViewModal';
import Toast from '../components/Toast';
import TrustBar from '../components/TrustBar';
import { useProductStore } from '../features/products/store';
import type { Product } from '../features/products/types';

const categories = ['Tất cả', 'Chuột', 'Bàn phím', 'Màn hình', 'Tai nghe'];

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'rating-desc';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const category = searchParams.get('category') ?? 'Tất cả';
  const segmentParam = searchParams.get('segment');
  const selectedSegment: 'all' | 'gaming' | 'office' =
    segmentParam === 'gaming' || segmentParam === 'office' ? segmentParam : 'all';

  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [onlyFlashSale, setOnlyFlashSale] = useState<boolean>(false);
  const [selectedQuickViewProduct, setSelectedQuickViewProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const allProducts = useProductStore((state) => state.products);

  const rawProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const normalizedCategory = category.trim().toLowerCase();

    return allProducts.filter((product) => {
      const matchesQuery =
        !normalizedQuery ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.category.toLowerCase().includes(normalizedQuery);
      const matchesCategory =
        !normalizedCategory ||
        normalizedCategory === 'tất cả' ||
        product.category.toLowerCase() === normalizedCategory;

      return matchesQuery && matchesCategory;
    });
  }, [allProducts, query, category]);

  const filteredAndSortedProducts = useMemo(() => {
    let list = [...rawProducts];

    // Segment filter
    if (selectedSegment !== 'all') {
      list = list.filter((p) => p.segment === selectedSegment);
    }

    // In-stock filter
    if (onlyInStock) {
      list = list.filter((p) => p.inStock && p.stockQuantity > 0);
    }

    // Flash sale filter
    if (onlyFlashSale) {
      list = list.filter((p) => p.isFlashSale || (p.discountPercent && p.discountPercent >= 18));
    }

    // Price filter
    if (priceRange === 'under-2m') {
      list = list.filter((p) => p.price < 2000000);
    } else if (priceRange === '2m-5m') {
      list = list.filter((p) => p.price >= 2000000 && p.price <= 5000000);
    } else if (priceRange === 'over-5m') {
      list = list.filter((p) => p.price > 5000000);
    }

    // Sort
    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating-desc') {
      list.sort((a, b) => (b.rating ?? 5) - (a.rating ?? 5));
    }

    return list;
  }, [rawProducts, onlyInStock, onlyFlashSale, priceRange, sortBy, selectedSegment]);

  const updateSegment = (seg: 'all' | 'gaming' | 'office') => {
    const next = new URLSearchParams(searchParams);
    if (seg !== 'all') {
      next.set('segment', seg);
    } else {
      next.delete('segment');
    }
    setSearchParams(next);
  };

  const updateFilter = (key: 'q' | 'category', value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== 'Tất cả') {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  };

  const resetAllFilters = () => {
    setOnlyInStock(false);
    setOnlyFlashSale(false);
    setPriceRange('all');
    setSortBy('default');
    setSearchParams(new URLSearchParams());
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((cur) => (cur === message ? null : cur));
    }, 3500);
  };

  return (
    <div className="products-page-wolf">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb-nav">
          <Link to="/">Trang chủ</Link>
          <span>/</span>
          <strong>Tất cả sản phẩm</strong>
        </div>

        {/* Page Banner Header */}
        <div className="products-banner-header">
          <div>
            <span className="section-eyebrow">DANH MỤC THIẾT BỊ</span>
            <h1 className="page-heading">Thiết Bị Công Nghệ & Gaming Gear</h1>
            <p className="page-subheading">
              Bộ sưu tập thiết bị ngoại vi chính hãng bảo hành 24 tháng, cam kết chất lượng hàng đầu.
            </p>
          </div>
          <div className="products-counter-badge">
            Hiển thị <strong>{filteredAndSortedProducts.length}</strong> sản phẩm
          </div>
        </div>

        {/* Filter & Toolbar Row */}
        <div className="products-filter-toolbar">
          {/* Segment Tabs */}
          <div className="segment-filter-row">
            <button
              type="button"
              className={`segment-pill ${selectedSegment === 'all' ? 'active' : ''}`}
              onClick={() => updateSegment('all')}
            >
              Tất cả
            </button>
            <button
              type="button"
              className={`segment-pill gaming ${selectedSegment === 'gaming' ? 'active' : ''}`}
              onClick={() => updateSegment('gaming')}
            >
              🎮 Gaming Gear
            </button>
            <button
              type="button"
              className={`segment-pill office ${selectedSegment === 'office' ? 'active' : ''}`}
              onClick={() => updateSegment('office')}
            >
              💼 Thiết bị văn phòng
            </button>
          </div>

          <div className="category-pills-row">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className={`category-pill-btn ${category === item ? 'active' : ''}`}
                onClick={() => updateFilter('category', item)}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Quick status filter pills */}
          <div className="quick-filters-row">
            <button
              type="button"
              className={`quick-pill-btn ${onlyInStock ? 'active' : ''}`}
              onClick={() => setOnlyInStock(!onlyInStock)}
            >
              {onlyInStock ? '✓' : '+'} Chỉ còn hàng
            </button>
            <button
              type="button"
              className={`quick-pill-btn flash ${onlyFlashSale ? 'active' : ''}`}
              onClick={() => setOnlyFlashSale(!onlyFlashSale)}
            >
              ⚡ Flash Sale
            </button>
            {(onlyInStock || onlyFlashSale || priceRange !== 'all' || sortBy !== 'default' || query || selectedSegment !== 'all' || category !== 'Tất cả') && (
              <button
                type="button"
                className="quick-pill-reset"
                onClick={resetAllFilters}
              >
                ✕ Xóa bộ lọc
              </button>
            )}
          </div>

          <div className="filters-control-group">
            <div className="search-filter-input">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                aria-label="Tìm kiếm sản phẩm"
                value={query}
                onChange={(event) => updateFilter('q', event.target.value)}
                placeholder="Lọc theo tên..."
              />
              {query && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => updateFilter('q', '')}
                >
                  ✕
                </button>
              )}
            </div>

            <select
              className="filter-select"
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              aria-label="Lọc theo mức giá"
            >
              <option value="all">Mức giá: Tất cả</option>
              <option value="under-2m">Dưới 2.000.000 đ</option>
              <option value="2m-5m">Từ 2.000.000 - 5.000.000 đ</option>
              <option value="over-5m">Trên 5.000.000 đ</option>
            </select>

            <select
              className="filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label="Sắp xếp sản phẩm"
            >
              <option value="default">Sắp xếp: Mặc định</option>
              <option value="price-asc">Giá: Thấp đến Cao</option>
              <option value="price-desc">Giá: Cao đến Thấp</option>
              <option value="rating-desc">Đánh giá cao nhất</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {filteredAndSortedProducts.length === 0 ? (
          <div className="empty-state-wolf">
            <div className="empty-icon">🔍</div>
            <h2>Không tìm thấy sản phẩm phù hợp</h2>
            <p>Hãy thử thay đổi từ khóa hoặc điều chỉnh khoảng giá khác.</p>
            <button
              type="button"
              className="btn-wolf-primary mt-3"
              onClick={resetAllFilters}
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="products-grid-wolf">
            {filteredAndSortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(p) => setSelectedQuickViewProduct(p)}
                onAddToCartToast={showToast}
              />
            ))}
          </div>
        )}
      </div>

      <TrustBar />

      {selectedQuickViewProduct && (
        <ProductQuickViewModal
          product={selectedQuickViewProduct}
          onClose={() => setSelectedQuickViewProduct(null)}
          onSuccessToast={showToast}
        />
      )}

      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
