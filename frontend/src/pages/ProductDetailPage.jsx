// 顯示單一商品資料，並處理購買數量與加入購物車操作。
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { getProduct } from "../api/products";
import ProductImage from "../components/ProductImage";
import StatusPanel from "../components/StatusPanel";
import { useCart } from "../hooks/useCart";
import { getCategoryLabel } from "../utils/categories";
import { getErrorMessage } from "../utils/errors";
import { formatPrice } from "../utils/formatters";
import { getProductImageUrl } from "../utils/productImages";

function ProductDetailPage() {
  const { productId } = useParams();
  const { items, addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [addedMessage, setAddedMessage] = useState("");
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    // 商品編號改變或離開頁面時，取消前一個尚未完成的查詢。
    const controller = new AbortController();

    async function loadProduct() {
      setError("");

      try {
        const data = await getProduct(productId, controller.signal);
        setProduct(data);
      } catch (requestError) {
        const message = getErrorMessage(requestError);
        if (message) setError(message);
      }
    }

    loadProduct();
    return () => controller.abort();
  }, [productId, requestKey]);

  if (error) {
    return (
      <div className="detail-state page-width">
        <StatusPanel
          title="找不到這件選物"
          message={error}
          actionLabel="重新載入"
          onAction={() => setRequestKey((key) => key + 1)}
        />
        <Link className="text-link centered-link" to="/products">返回所有商品</Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-loading page-width" aria-label="商品載入中" aria-busy="true">
        <div className="skeleton-block detail-image-skeleton" />
        <div className="detail-copy-skeleton">
          <div className="skeleton-block skeleton-line-short" />
          <div className="skeleton-block skeleton-title" />
          <div className="skeleton-block skeleton-line" />
          <div className="skeleton-block skeleton-line" />
        </div>
      </div>
    );
  }

  const soldOut = product.stock <= 0;
  const cartQuantity = items.find((item) => item.productId === product.productId)?.quantity ?? 0;
  const remainingQuantity = Math.max(product.stock - cartQuantity, 0);
  const reachedPurchaseLimit = !soldOut && remainingQuantity === 0;
  const quantityToAdd = Math.min(quantity, Math.max(remainingQuantity, 1));
  const feedbackMessage = reachedPurchaseLimit
    ? `購物袋已有 ${cartQuantity} 件，已達此商品的購買上限。`
    : addedMessage;

  function handleAddToCart() {
    // 加入前先依購物袋既有數量限制本次可加購數量。
    addItem(product, quantityToAdd);
    setAddedMessage(`已將 ${quantityToAdd} 件「${product.productName}」加入購物袋。`);
  }

  return (
    <div className="product-detail-page page-width">
      <nav className="breadcrumbs" aria-label="頁面路徑">
        <Link to="/">首頁</Link>
        <span aria-hidden="true">/</span>
        <Link to="/products">所有選物</Link>
        <span aria-hidden="true">/</span>
        <span>{product.productName}</span>
      </nav>

      <article className="product-detail">
        <div className="product-detail-image">
          <ProductImage src={getProductImageUrl(product)} alt={product.productName} />
        </div>
        <div className="product-detail-copy">
          <p className="eyebrow">{getCategoryLabel(product.category)} · SHIWU SELECT</p>
          <h1>{product.productName}</h1>
          <p className="detail-price">{formatPrice(product.price)}</p>
          <p className="detail-description">
            {product.description || "這件選物的詳細介紹正在整理中，商品規格與庫存以本頁資訊為準。"}
          </p>

          <div className={`detail-stock ${soldOut ? "detail-stock-out" : ""}`}>
            <span className="stock-dot" aria-hidden="true" />
            {soldOut ? "目前售罄，暫時無法加入購物袋" : `現貨供應，共 ${product.stock} 件`}
          </div>

          {!soldOut ? (
            <div className={`purchase-panel ${reachedPurchaseLimit ? "purchase-panel-limit" : ""}`}>
              {!reachedPurchaseLimit ? (
                <div className="quantity-field">
                  <label htmlFor="quantity">數量</label>
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    max={remainingQuantity}
                    value={quantityToAdd}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      setQuantity(Math.max(1, Math.min(value || 1, remainingQuantity)));
                      setAddedMessage("");
                    }}
                  />
                </div>
              ) : null}
              <button
                className="button button-primary add-to-cart"
                type="button"
                onClick={handleAddToCart}
                disabled={reachedPurchaseLimit}
              >
                {reachedPurchaseLimit ? "已達購買上限" : "加入購物袋"}
              </button>
            </div>
          ) : null}

          <p className={`cart-feedback ${reachedPurchaseLimit ? "cart-feedback-limit" : ""}`} aria-live="polite">
            {feedbackMessage}
          </p>

          <dl className="product-facts">
            <div>
              <dt>商品編號</dt>
              <dd>SW-{String(product.productId).padStart(4, "0")}</dd>
            </div>
            <div>
              <dt>分類</dt>
              <dd>{getCategoryLabel(product.category)}</dd>
            </div>
            <div>
              <dt>付款說明</dt>
              <dd>此專案為作品集展示，不串接真實金流。</dd>
            </div>
          </dl>
        </div>
      </article>
    </div>
  );
}

export default ProductDetailPage;
