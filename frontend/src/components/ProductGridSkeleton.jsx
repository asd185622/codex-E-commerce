// 在商品資料載入期間顯示固定數量的骨架卡片，避免版面跳動。
function ProductGridSkeleton({ count = 4 }) {
  return (
    <div className="product-grid" aria-label="商品載入中" aria-busy="true">
      {Array.from({ length: count }, (_, index) => (
        <div className="product-skeleton" key={index}>
          <div className="skeleton-block skeleton-image" />
          <div className="skeleton-block skeleton-line-short" />
          <div className="skeleton-block skeleton-line" />
          <div className="skeleton-block skeleton-line-price" />
        </div>
      ))}
    </div>
  );
}

export default ProductGridSkeleton;
