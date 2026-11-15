import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router';

import TrustBar from '../components/TrustBar';
import { listNews, getFeaturedNews } from '../features/news/service';
import { useArticleStore } from '../features/news/store';

const categories = ['Tất cả', 'Đánh giá', 'Công thái học', 'Hướng dẫn', 'Mẹo công nghệ'];

export default function NewsPage() {
  const { articles: allArticles, fetchArticles, isLoading } = useArticleStore();
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const featuredArticle = useMemo(() => {
    return getFeaturedNews(allArticles);
  }, [allArticles]);

  const articles = useMemo(() => {
    return listNews(selectedCategory, searchQuery, allArticles);
  }, [selectedCategory, searchQuery, allArticles]);

  return (
    <div className="news-page-wolf py-4">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb-nav mb-4">
          <Link to="/">Trang chủ</Link>
          <span>/</span>
          <strong>Tin tức & Đánh giá công nghệ</strong>
        </div>

        {/* Hero Header */}
        <div className="news-hero-header">
          <div className="news-hero-badge">TECHGEAR INSIGHTS & REVIEWS</div>
          <h1 className="news-page-title">Tin Tức, Đánh Giá & Xu Hướng Gear 2026</h1>
          <p className="news-page-subtitle">
            Cập nhật những bài viết chuyên sâu về bàn phím cơ custom, chuột công thái học, màn hình đồ họa chuẩn màu và cẩm nang kiến tạo không gian làm việc lý tưởng.
          </p>
        </div>

        {/* Featured Hero Article */}
        {!searchQuery && selectedCategory === 'Tất cả' && featuredArticle && (
          <div className="featured-hero-article shadow-md mb-5">
            <div className="featured-img-col">
              <img
                src={featuredArticle.image_url || featuredArticle.coverImage}
                alt={featuredArticle.title}
                className="featured-cover-img"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/images/akko-5075b-plus-dracula-castle-001-1000x1000.webp';
                }}
              />
              <span className="featured-tag">TIÊU ĐIỂM CÔNG NGHỆ</span>
            </div>
            <div className="featured-content-col">
              <div className="featured-meta-row">
                <span className="article-category-badge">{featuredArticle.category}</span>
                <span className="article-date">📅 {featuredArticle.date || featuredArticle.published_at}</span>
                <span className="article-read-time">⏱️ {featuredArticle.readTime}</span>
              </div>
              <h2 className="featured-title">
                <Link to={`/news/${featuredArticle.slug || featuredArticle.id}`}>{featuredArticle.title}</Link>
              </h2>
              <p className="featured-excerpt">{featuredArticle.excerpt}</p>

              <div className="featured-author-box">
                <div className="author-avatar-badge">{featuredArticle.author.charAt(0).toUpperCase()}</div>
                <div className="author-info">
                  <strong>{featuredArticle.author}</strong>
                  <span>Ban biên tập TechGear</span>
                </div>
              </div>

              <Link to={`/news/${featuredArticle.slug || featuredArticle.id}`} className="btn-wolf-primary mt-3">
                Đọc bài viết chi tiết →
              </Link>
            </div>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="news-filter-bar mb-4">
          <div className="category-pills-row">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`category-pill-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="search-filter-input">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Tìm kiếm tin tức"
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Loading state */}
        {isLoading && allArticles.length === 0 && (
          <div className="text-center py-5">
            <p>Đang tải danh sách bài viết từ hệ thống...</p>
          </div>
        )}

        {/* Articles Grid */}
        {articles.length === 0 ? (
          <div className="empty-state-wolf my-5">
            <div className="empty-icon">📰</div>
            <h2>Không tìm thấy bài viết phù hợp</h2>
            <p>Hãy thử tìm kiếm với từ khóa khác hoặc chuyển sang danh mục "Tất cả".</p>
            <button
              type="button"
              className="btn-wolf-primary mt-3"
              onClick={() => {
                setSelectedCategory('Tất cả');
                setSearchQuery('');
              }}
            >
              Xem tất cả bài viết
            </button>
          </div>
        ) : (
          <div className="news-articles-grid">
            {articles.map((article) => (
              <article key={article.id} className="news-item-card shadow-sm">
                <Link to={`/news/${article.slug || article.id}`} className="news-card-image-link">
                  <img
                    src={article.image_url || article.coverImage}
                    alt={article.title}
                    className="news-card-img"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/images/akko-5075b-plus-dracula-castle-001-1000x1000.webp';
                    }}
                  />
                  <span className="news-category-pill">{article.category}</span>
                </Link>

                <div className="news-card-body">
                  <div className="news-meta-line">
                    <span>📅 {article.date || article.published_at}</span>
                    <span>•</span>
                    <span>⏱️ {article.readTime}</span>
                  </div>

                  <h3 className="news-card-title">
                    <Link to={`/news/${article.slug || article.id}`}>{article.title}</Link>
                  </h3>

                  <p className="news-card-excerpt">{article.excerpt}</p>

                  <div className="news-card-footer">
                    <div className="author-mini">
                      <div className="author-avatar-sm-badge">
                        {article.author.charAt(0).toUpperCase()}
                      </div>
                      <span className="author-name-sm">{article.author}</span>
                    </div>

                    <Link to={`/news/${article.slug || article.id}`} className="read-more-link">
                      Đọc tiếp →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <TrustBar />
    </div>
  );
}
