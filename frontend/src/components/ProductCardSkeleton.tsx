export default function ProductCardSkeleton() {
  return (
    <article className="wolf-product-card skeleton-card" aria-hidden="true">
      <div className="product-image-container">
        <div className="skeleton-box w-full h-full" style={{ width: '100%', height: '180px' }} />
      </div>

      <div className="product-card-info" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Spec line skeleton */}
        <div className="skeleton-box" style={{ height: '12px', width: '65%' }} />

        {/* Title skeleton (2 lines) */}
        <div className="skeleton-box" style={{ height: '18px', width: '90%' }} />
        <div className="skeleton-box" style={{ height: '18px', width: '50%' }} />

        {/* Rating row skeleton */}
        <div className="skeleton-box" style={{ height: '14px', width: '40%' }} />

        {/* Price row skeleton */}
        <div className="skeleton-box" style={{ height: '22px', width: '55%', marginTop: '4px' }} />

        {/* Button skeleton */}
        <div className="skeleton-box" style={{ height: '36px', width: '100%', marginTop: '8px', borderRadius: '8px' }} />
      </div>
    </article>
  );
}
