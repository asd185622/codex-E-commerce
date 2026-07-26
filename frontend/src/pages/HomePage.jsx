// 首頁載入最新商品，組合主打商品與最新上架區塊。
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getProducts } from "../api/products";
import { ArrowIcon } from "../components/icons";
import ProductCard from "../components/ProductCard";
import ProductGridSkeleton from "../components/ProductGridSkeleton";
import ProductImage from "../components/ProductImage";
import StatusPanel from "../components/StatusPanel";
import { getCategoryLabel } from "../utils/categories";
import { getErrorMessage } from "../utils/errors";
import { formatPrice } from "../utils/formatters";
import { getProductImageUrl } from "../utils/productImages";

function HomePage() {
  const [page, setPage] = useState(null);
  const [error, setError] = useState("");
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    // 離開首頁時取消尚未完成的商品請求，避免過期資料更新畫面。
    const controller = new AbortController();

    async function loadProducts() {
      setError("");

      try {
        const data = await getProducts(
          { orderBy: "created_date", sort: "desc", limit: 8, offset: 0 },
          controller.signal,
        );
        setPage(data);
      } catch (requestError) {
        const message = getErrorMessage(requestError);
        if (message) setError(message);
      }
    }

    loadProducts();
    return () => controller.abort();
  }, [requestKey]);

  const products = page?.results ?? [];
  const featuredProduct = products[0];
  const latestProducts = featuredProduct ? products.slice(1, 7) : [];

  return (
    <>
      <section className="home-intro page-width">
        <div className="home-copy">
          <p className="eyebrow">本週選物 · WEEKLY EDIT</p>
          <h1>讓日常，<br />多一件值得留下的東西。</h1>
          <p className="home-lead">
            從餐桌、移動到閱讀，拾物用三條清楚的線索，幫你快速找到生活所需。
          </p>
          <Link className="text-link" to="/products">
            查看全部選物
            <ArrowIcon />
          </Link>
        </div>

        <div className="featured-product">
          {error ? (
            <StatusPanel
              compact
              title="主打商品暫時無法載入"
              message={error}
              actionLabel="重新載入"
              onAction={() => setRequestKey((key) => key + 1)}
            />
          ) : featuredProduct ? (
            <>
              <Link className="featured-image" to={`/products/${featuredProduct.productId}`}>
                <ProductImage
                  src={getProductImageUrl(featuredProduct)}
                  alt={featuredProduct.productName}
                />
              </Link>
              <div className="featured-caption">
                <div>
                  <p>{getCategoryLabel(featuredProduct.category)}精選</p>
                  <h2>{featuredProduct.productName}</h2>
                </div>
                <p className="featured-price">{formatPrice(featuredProduct.price)}</p>
              </div>
            </>
          ) : (
            <div className="featured-loading" aria-label="主打商品載入中" aria-busy="true">
              <div className="skeleton-block" />
            </div>
          )}
        </div>
      </section>

      <section className="latest-section page-width" aria-labelledby="latest-heading">
        <div className="section-heading section-heading-row">
          <div>
            <p className="eyebrow">NEW ARRIVALS</p>
            <h2 id="latest-heading">最新上架</h2>
          </div>
          <Link className="text-link" to="/products">
            查看全部
            <ArrowIcon />
          </Link>
        </div>

        {!page && !error ? <ProductGridSkeleton count={6} /> : null}
        {error ? (
          <StatusPanel
            title="商品暫時無法載入"
            message={error}
            actionLabel="重新載入"
            onAction={() => setRequestKey((key) => key + 1)}
          />
        ) : null}
        {page && products.length === 0 ? (
          <StatusPanel title="選物正在準備中" message="商品上架後，會第一時間出現在這裡。" />
        ) : null}
        {latestProducts.length > 0 ? (
          <div className="product-grid">
            {latestProducts.map((product) => (
              <ProductCard product={product} key={product.productId} />
            ))}
          </div>
        ) : null}
      </section>
    </>
  );
}

export default HomePage;
