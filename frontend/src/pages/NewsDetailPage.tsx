import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router';

import TrustBar from '../components/TrustBar';
import { getNewsById, getNewsBySlug, getRelatedNews } from '../features/news/service';
import { useArticleStore } from '../features/news/store';
import { useProductStore } from '../features/products/store';
import { getProductPrimaryImage } from '../features/products/utils';

const formatPrice = (price: number) => `${price.toLocaleString('vi-VN')} đ`;

function renderFormattedContent(rawContent: string) {
  const blocks = rawContent.split(/\n\s*\n/);

  return blocks.map((block, idx) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith('### ')) {
      return (
        <h3 key={idx} className="article-subheading small">
          {trimmed.replace(/^###\s+/, '')}
        </h3>
      );
    }

    if (trimmed.startsWith('## ')) {
      return (
        <h2 key={idx} className="article-subheading">
          {trimmed.replace(/^##\s+/, '')}
        </h2>
      );
    }

    if (trimmed.startsWith('> ')) {
      return (
        <blockquote key={idx} className="article-quote-box">
          <span className="quote-mark">“</span>
          <p>{trimmed.replace(/^>\s+/, '')}</p>
        </blockquote>
      );
    }

    const lines = trimmed.split('\n');
    const isBulletList = lines.every((line) => line.trim().startsWith('•') || line.trim().startsWith('-'));
    if (isBulletList) {
      return (
        <ul key={idx} className="article-bullets-list">
          {lines.map((line, lIdx) => (
            <li key={lIdx}>
              <span className="bullet-check">✓</span>
              <span>{line.replace(/^[•-]\s*/, '')}</span>
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p key={idx} className="article-paragraph">
        {trimmed}
      </p>
    );
  });
}

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { articles, fetchArticles } = useArticleStore();
  const products = useProductStore((state) => state.products);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const article = useMemo(() => {
    if (!id) return undefined;
    return (
      getNewsBySlug(id, articles) ||
      (Number.isInteger(Number(id)) ? getNewsById(Number(id), articles) : undefined)
    );
  }, [id, articles]);

  if (!article) {
    return (
      <div className="container empty-state-wolf my-5">
        <div className="empty-icon">⚠️</div>
        <h1>Không tìm thấy bài viết</h1>
        <p>Bài viết bạn tìm kiếm không tồn tại hoặc đã bị gỡ bỏ.</p>
        <Link to="/news" className="btn-wolf-primary mt-3">
          ← Quay lại trang Tin tức
        </Link>
      </div>
    );
  }

  const relatedArticles = getRelatedNews(article.id, 3, articles);
  const relatedProduct = article.relatedProductId
    ? products.find((p) => p.id === article.relatedProductId)
    : undefined;

  const authorName = article.author || 'TechGear Editorial';
  const authorInitial = authorName.charAt(0).toUpperCase();

  return (
    <div className="news-detail-page-wolf py-4">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb-nav mb-4">
          <Link to="/">Trang chủ</Link>
          <span>/</span>
          <Link to="/news">Tin tức & Đánh giá</Link>
          <span>/</span>
          <span>{article.category}</span>
          <span>/</span>
          <strong>{article.title}</strong>
        </div>

        {/* Article Layout */}
        <div className="news-detail-layout">
          {/* Main Article Content */}
          <article className="news-main-article shadow-sm">
            {/* Header */}
            <div className="article-header">
              <span className="article-category-badge">{article.category}</span>
              <h1 className="article-detail-title">{article.title}</h1>

              <div className="article-author-row">
                <div className="author-card-box">
                  <div className="author-avatar-badge">{authorInitial}</div>
                  <div>
                    <strong className="author-name-text">{authorName}</strong>
                    <span className="author-role-text">Ban biên tập TechGear</span>
                  </div>
                </div>

                <div className="article-meta-tags">
                  <span className="meta-pill">📅 {article.date || article.published_at}</span>
                  <span className="meta-pill">⏱️ {article.readTime || '5 phút đọc'}</span>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="article-banner-wrap">
              <img
                src={article.image_url || article.coverImage}
                alt={article.title}
                className="article-hero-img"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/images/akko-5075b-plus-dracula-castle-001-1000x1000.webp';
                }}
              />
            </div>

            {/* Excerpt Lead */}
            <div className="article-excerpt-lead">
              <p>{article.excerpt}</p>
            </div>

            {/* Body Content */}
            <div className="article-body-content">
              {renderFormattedContent(article.content)}

              {/* Tags Row */}
              {article.tags && article.tags.length > 0 && (
                <div className="article-tags-row mt-4">
                  <span className="tags-label">Thẻ chủ đề:</span>
                  {article.tags.map((tag) => (
                    <span key={tag} className="article-tag-chip">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </article>

          {/* Sidebar */}
          <aside className="news-sidebar-col">
            {/* Mentioned Product Card */}
            {relatedProduct && (
              <div className="sidebar-product-card shadow-sm mb-4">
                <span className="sidebar-badge">SẢN PHẨM TRONG BÀI</span>
                <Link to={`/products/${relatedProduct.id}`} className="sidebar-prod-img-wrap">
                  <img src={getProductPrimaryImage(relatedProduct)} alt={relatedProduct.name} />
                </Link>
                <div className="sidebar-prod-info">
                  <span className="sidebar-prod-cat">{relatedProduct.category}</span>
                  <h4 className="sidebar-prod-name">
                    <Link to={`/products/${relatedProduct.id}`}>{relatedProduct.name}</Link>
                  </h4>
                  <div className="sidebar-prod-price">
                    <strong>{formatPrice(relatedProduct.price)}</strong>
                    {relatedProduct.originalPrice && (
                      <del>{formatPrice(relatedProduct.originalPrice)}</del>
                    )}
                  </div>
                  <p className="sidebar-prod-specs">{relatedProduct.specs}</p>
                  <Link
                    to={`/products/${relatedProduct.id}`}
                    className="btn-wolf-primary full-width mt-3"
                  >
                    Xem chi tiết sản phẩm →
                  </Link>
                </div>
              </div>
            )}

            {/* Related Articles */}
            <div className="sidebar-related-articles shadow-sm">
              <h3 className="sidebar-heading">Bài viết liên quan</h3>
              <div className="related-items-list">
                {relatedArticles.map((rel) => (
                  <Link
                    key={rel.id}
                    to={`/news/${rel.slug || rel.id}`}
                    className="related-item-row"
                  >
                    <img
                      src={rel.image_url || rel.coverImage}
                      alt={rel.title}
                      className="related-item-thumb"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/images/akko-5075b-plus-dracula-castle-001-1000x1000.webp';
                      }}
                    />
                    <div className="related-item-meta">
                      <span className="related-cat">{rel.category}</span>
                      <h4 className="related-title">{rel.title}</h4>
                      <span className="related-date">📅 {rel.date || rel.published_at}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <TrustBar />
    </div>
  );
}
