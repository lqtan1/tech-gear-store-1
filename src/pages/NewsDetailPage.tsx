import { Link, useParams } from 'react-router';

import TrustBar from '../components/TrustBar';
import { getNewsById, getRelatedNews } from '../features/news/service';
import { useProductStore } from '../features/products/store';
import { getProductPrimaryImage } from '../features/products/utils';

const formatPrice = (price: number) => `${price.toLocaleString('vi-VN')} đ`;

export default function NewsDetailPage() {
  const { id } = useParams();
  const newsId = Number(id);
  const article = Number.isInteger(newsId) ? getNewsById(newsId) : undefined;
  const products = useProductStore((state) => state.products);

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

  const relatedArticles = getRelatedNews(article.id, 3);
  const relatedProduct = article.relatedProductId
    ? products.find((p) => p.id === article.relatedProductId)
    : undefined;

  return (
    <div className="news-detail-page-wolf">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb-nav">
          <Link to="/">Trang chủ</Link>
          <span>/</span>
          <Link to="/news">Tin tức</Link>
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
                  <img
                    src={article.author.avatar}
                    alt={article.author.name}
                    className="author-avatar"
                  />
                  <div>
                    <strong className="author-name-text">{article.author.name}</strong>
                    <span className="author-role-text">{article.author.role}</span>
                  </div>
                </div>

                <div className="article-meta-tags">
                  <span className="meta-pill">📅 {article.date}</span>
                  <span className="meta-pill">⏱️ {article.readTime}</span>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="article-banner-wrap">
              <img
                src={article.coverImage}
                alt={article.title}
                className="article-hero-img"
              />
            </div>

            {/* Excerpt Lead */}
            <div className="article-excerpt-lead">
              <p>{article.excerpt}</p>
            </div>

            {/* Body Content */}
            <div className="article-body-content">
              <p className="article-paragraph intro-text">{article.content.intro}</p>

              {article.content.sections.map((section, idx) => (
                <section key={idx} className="article-section-block">
                  <h2 className="article-subheading">{section.heading}</h2>
                  <p className="article-paragraph">{section.text}</p>

                  {section.image && (
                    <div className="article-inline-image">
                      <img src={section.image} alt={section.heading} />
                    </div>
                  )}

                  {section.quote && (
                    <blockquote className="article-quote-box">
                      <span className="quote-mark">“</span>
                      <p>{section.quote}</p>
                    </blockquote>
                  )}

                  {section.bullets && section.bullets.length > 0 && (
                    <ul className="article-bullets-list">
                      {section.bullets.map((bullet, bIdx) => (
                        <li key={bIdx}>
                          <span className="bullet-check">✓</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}

              {/* Conclusion */}
              <div className="article-conclusion-box">
                <h3 className="conclusion-heading">💡 Lời kết từ TechGear</h3>
                <p>{article.content.conclusion}</p>
              </div>

              {/* Tags Row */}
              <div className="article-tags-row">
                <span className="tags-label">Thẻ chủ đề:</span>
                {article.tags.map((tag) => (
                  <span key={tag} className="article-tag-chip">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="news-sidebar-col">
            {/* Mentioned Product Card */}
            {relatedProduct && (
              <div className="sidebar-product-card shadow-sm">
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

            {/* Newsletter / TechGear Consultation Box */}
            <div className="sidebar-promo-card shadow-sm">
              <div className="promo-card-icon">🎧</div>
              <h3>Cần tư vấn setup góc máy?</h3>
              <p>
                Đội ngũ kỹ thuật viên của TechGear luôn sẵn sàng tư vấn cấu hình phím chuột phù hợp nhất với cỡ tay và thói quen của bạn.
              </p>
              <a href="tel:19006750" className="btn-wolf-outline full-width mt-2">
                📞 Hotline: 1900 6750
              </a>
            </div>
          </aside>
        </div>

        {/* Related News Section */}
        {relatedArticles.length > 0 && (
          <div className="related-news-section mt-5">
            <div className="section-head-between mb-4">
              <div>
                <span className="section-eyebrow">KHÁM PHÁ THÊM</span>
                <h2 className="section-main-heading">Bài viết cùng chủ đề</h2>
              </div>
              <Link to="/news" className="link-view-all">
                Xem tất cả bài viết →
              </Link>
            </div>

            <div className="news-articles-grid">
              {relatedArticles.map((rel) => (
                <article key={rel.id} className="news-item-card shadow-sm">
                  <Link to={`/news/${rel.id}`} className="news-card-image-link">
                    <img src={rel.coverImage} alt={rel.title} className="news-card-img" />
                    <span className="news-category-pill">{rel.category}</span>
                  </Link>

                  <div className="news-card-body">
                    <div className="news-meta-line">
                      <span>📅 {rel.date}</span>
                      <span>•</span>
                      <span>⏱️ {rel.readTime}</span>
                    </div>

                    <h3 className="news-card-title">
                      <Link to={`/news/${rel.id}`}>{rel.title}</Link>
                    </h3>

                    <p className="news-card-excerpt">{rel.excerpt}</p>

                    <div className="news-card-footer">
                      <span className="author-name-sm">Tác giả: {rel.author.name}</span>
                      <Link to={`/news/${rel.id}`} className="read-more-link">
                        Đọc bài →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>

      <TrustBar />
    </div>
  );
}

