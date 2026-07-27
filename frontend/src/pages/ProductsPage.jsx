// 商品列表頁以 URL 參數同步搜尋、分類、排序與分頁狀態。
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { getProducts } from "../api/products";
import ProductCard from "../components/ProductCard";
import ProductGridSkeleton from "../components/ProductGridSkeleton";
import StatusPanel from "../components/StatusPanel";
import { categories } from "../utils/categories";
import { getErrorMessage } from "../utils/errors";

const PAGE_SIZE = 8;

const sortOptions = {
  newest: { orderBy: "created_date", sort: "desc" },
  priceAsc: { orderBy: "price", sort: "asc" },
  priceDesc: { orderBy: "price", sort: "desc" },
};

function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");
  const [page, setPage] = useState(null);
  const [error, setError] = useState("");
  const [requestKey, setRequestKey] = useState(0);

  const category = searchParams.get("category") ?? "";
  const search = searchParams.get("search") ?? "";
  const sortKey = searchParams.get("sort") ?? "newest";
  const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);
  const selectedSort = sortOptions[sortKey] ?? sortOptions.newest;

  useEffect(() => {
    // URL 的搜尋字串變更時，同步更新表單輸入內容。
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    // URL 查詢參數改變時重新載入商品，並取消前一次未完成的請求。
    const controller = new AbortController();

    async function loadProducts() {
      setPage(null);
      setError("");

      try {
        const data = await getProducts(
          {
            category: category || undefined,
            search: search || undefined,
            orderBy: selectedSort.orderBy,
            sort: selectedSort.sort,
            limit: PAGE_SIZE,
            offset: (currentPage - 1) * PAGE_SIZE,
          },
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
  }, [category, search, selectedSort.orderBy, selectedSort.sort, currentPage, requestKey]);

  function updateParam(name, value) {
    // 更新單一篩選條件時保留其他條件，並將分頁重設為第一頁。
    const nextParams = new URLSearchParams(searchParams);
    if (value) nextParams.set(name, value);
    else nextParams.delete(name);
    nextParams.delete("page");
    setSearchParams(nextParams);
  }

  function handleSearch(event) {
    // 將搜尋表單內容寫回 URL，讓結果可以重新整理或分享。
    event.preventDefault();
    updateParam("search", searchInput.trim());
  }

  function goToPage(pageNumber) {
    // 切換分頁後捲回頂端，讓使用者從新一頁的第一筆開始閱讀。
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", String(pageNumber));
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const products = page?.results ?? [];
  const totalPages = page ? Math.max(1, Math.ceil(page.total / PAGE_SIZE)) : 1;

  return (
    <div className="catalog-page page-width">
      <header className="page-heading">
        <p className="eyebrow">COLLECTION</p>
        <h1>所有選物</h1>
        <p>用分類、關鍵字或價格排序，找到適合現在生活的物件。</p>
      </header>

      <section className="catalog-tools" aria-label="商品篩選">
        <form className="catalog-search" role="search" onSubmit={handleSearch}>
          <label htmlFor="product-search">搜尋商品</label>
          <div className="input-action">
            <input
              id="product-search"
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="輸入商品名稱"
            />
            <button className="button button-primary" type="submit">搜尋</button>
          </div>
        </form>

        <div className="field-group">
          <label htmlFor="category-filter">商品分類</label>
          <select
            id="category-filter"
            value={category}
            onChange={(event) => updateParam("category", event.target.value)}
          >
            <option value="">全部分類</option>
            {categories.map((item) => (
              <option value={item.value} key={item.value}>{item.label}</option>
            ))}
          </select>
        </div>

        <div className="field-group">
          <label htmlFor="sort-filter">排序方式</label>
          <select
            id="sort-filter"
            value={sortKey}
            onChange={(event) => updateParam("sort", event.target.value)}
          >
            <option value="newest">最新上架</option>
            <option value="priceAsc">價格：低到高</option>
            <option value="priceDesc">價格：高到低</option>
          </select>
        </div>
      </section>

      <div className="catalog-summary" aria-live="polite">
        <p>
          {page
            ? `共 ${page.total} 件商品`
            : error
              ? "暫時無法取得商品數量"
              : "正在整理選物…"}
        </p>
        {search || category ? (
          <button
            className="clear-filter"
            type="button"
            onClick={() => {
              setSearchInput("");
              setSearchParams({});
            }}
          >
            清除篩選
          </button>
        ) : null}
      </div>

      {!page && !error ? <ProductGridSkeleton count={8} /> : null}
      {error ? (
        <StatusPanel
          title="無法載入商品"
          message={error}
          actionLabel="重新載入"
          onAction={() => setRequestKey((key) => key + 1)}
        />
      ) : null}
      {page && products.length === 0 ? (
        <StatusPanel
          title="沒有符合條件的商品"
          message="試著更換分類、縮短關鍵字，或清除目前的篩選條件。"
          actionLabel="清除篩選"
          onAction={() => {
            setSearchInput("");
            setSearchParams({});
          }}
        />
      ) : null}
      {products.length > 0 ? (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard product={product} key={product.productId} />
          ))}
        </div>
      ) : null}

      {page && totalPages > 1 ? (
        <nav className="pagination" aria-label="商品分頁">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => goToPage(currentPage - 1)}
          >
            上一頁
          </button>
          <span>第 {currentPage} / {totalPages} 頁</span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => goToPage(currentPage + 1)}
          >
            下一頁
          </button>
        </nav>
      ) : null}
    </div>
  );
}

export default ProductsPage;
