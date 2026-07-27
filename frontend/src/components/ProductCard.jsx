// 顯示商品列表中的單張商品卡片與庫存狀態。
import { Link } from "react-router";
import { getCategoryLabel } from "../utils/categories";
import { formatPrice } from "../utils/formatters";
import { getProductImageUrl } from "../utils/productImages";
import ProductImage from "./ProductImage";

function ProductCard({ product }) {
  const soldOut = product.stock <= 0;

  return (
    <article className="product-card">
      <Link className="product-card-image" to={`/products/${product.productId}`}>
        <ProductImage src={getProductImageUrl(product)} alt={product.productName} />
        {soldOut ? <span className="stock-badge">暫時售罄</span> : null}
      </Link>
      <div className="product-card-body">
        <p className="product-category">{getCategoryLabel(product.category)}</p>
        <h3>
          <Link to={`/products/${product.productId}`}>{product.productName}</Link>
        </h3>
        <div className="product-card-meta">
          <p className="product-price">{formatPrice(product.price)}</p>
          <p className={soldOut ? "stock-text sold-out" : "stock-text"}>
            {soldOut ? "補貨中" : `現貨 ${product.stock} 件`}
          </p>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
