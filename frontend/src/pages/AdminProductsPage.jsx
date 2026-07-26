// 提供管理 Demo 的商品查詢、篩選、分頁、編輯入口與刪除操作。
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { deleteProduct, getProducts } from "../api/products";
import ProductImage from "../components/ProductImage";
import StatusPanel from "../components/StatusPanel";
import { categories, getCategoryLabel } from "../utils/categories";
import { getErrorMessage, getProductWriteErrorMessage } from "../utils/errors";
import { formatDateTime, formatPrice } from "../utils/formatters";
import { getProductImageUrl } from "../utils/productImages";

const PAGE_SIZE = 10;

const sortOptions = {
  newest: { orderBy: "created_date", sort: "desc" },
  oldest: { orderBy: "created_date", sort: "asc" },
  priceAsc: { orderBy: "price", sort: "asc" },
  priceDesc: { orderBy: "price", sort: "desc" },
};

function AdminProductsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");
  const [page, setPage] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(location.state?.successMessage ?? "");
  const [deleteError, setDeleteError] = useState("");
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [requestKey, setRequestKey] = useState(0);

  const category = searchParams.get("category") ?? "";
  const search = searchParams.get("search") ?? "";
  const sortKey = searchParams.get("sort") ?? "newest";
  const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);
  const selectedSort = sortOptions[sortKey] ?? sortOptions.newest;

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    if (!location.state?.successMessage) return;
    navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
  }, [location.pathname, location.search, location.state?.successMessage, navigate]);

  useEffect(() => {
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
        const message = getErrorMessage(requestError, "目前無法載入商品管理資料，請稍後再試。");
        if (message) setError(message);
      }
    }

    loadProducts();
    return () => controller.abort();
  }, [category, search, selectedSort.orderBy, selectedSort.sort, currentPage, requestKey]);

  function updateParam(name, value) {
    const nextParams = new URLSearchParams(searchParams);
    if (value) nextParams.set(name, value);
    else nextParams.delete(name);
    nextParams.delete("page");
    setSearchParams(nextParams);
    setNotice("");
    setDeleteError("");
  }

  function handleSearch(event) {
    event.preventDefault();
    updateParam("search", searchInput.trim());
  }

  function goToPage(pageNumber) {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", String(pageNumber));
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(product) {
    const confirmed = window.confirm(
      `確定要刪除「${product.productName}」嗎？\n\n刪除後商品會從商城與管理列表移除，這項操作無法復原。`,
    );
    if (!confirmed) return;

    setDeletingProductId(product.productId);
    setDeleteError("");
    setNotice("");

    try {
      await deleteProduct(product.productId);
      setNotice(`已刪除「${product.productName}」。`);

      if ((page?.results.length ?? 0) === 1 && currentPage > 1) {
        goToPage(currentPage - 1);
      } else {
        setRequestKey((key) => key + 1);
      }
    } catch (requestError) {
      setDeleteError(getProductWriteErrorMessage(requestError, "delete"));
    } finally {
      setDeletingProductId(null);
    }
  }

  const products = page?.results ?? [];
  const totalPages = page ? Math.max(1, Math.ceil(page.total / PAGE_SIZE)) : 1;

  return (
    <div className="admin-page page-width">
      <header className="admin-page-heading">
        <div>
          <p className="eyebrow">PRODUCT DIRECTORY</p>
          <h1>商品管理</h1>
          <p>集中查看商品狀態，並操作現有的新增、修改與刪除 API。</p>
        </div>
        <Link className="button button-primary" to="/admin/products/new">新增商品</Link>
      </header>

      <section className="admin-demo-card" aria-label="管理 Demo 說明">
        <strong>這是無 RBAC 的作品集 Demo</strong>
        <p>任何能開啟此頁面的人都可能操作商品資料；請勿把此介面視為正式後台或真正的權限保護。</p>
      </section>

      {notice ? <p className="form-success admin-notice" role="status">{notice}</p> : null}
      {deleteError ? <p className="form-error admin-notice" role="alert">{deleteError}</p> : null}

      <section className="admin-toolbar" aria-label="管理商品篩選">
        <form className="admin-search" role="search" onSubmit={handleSearch}>
          <label htmlFor="admin-product-search">搜尋商品</label>
          <div className="input-action">
            <input
              id="admin-product-search"
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="輸入商品名稱"
            />
            <button className="button button-primary" type="submit">搜尋</button>
          </div>
        </form>

        <div className="field-group">
          <label htmlFor="admin-category-filter">商品分類</label>
          <select
            id="admin-category-filter"
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
          <label htmlFor="admin-sort-filter">排序方式</label>
          <select
            id="admin-sort-filter"
            value={sortKey}
            onChange={(event) => updateParam("sort", event.target.value)}
          >
            <option value="newest">最新建立</option>
            <option value="oldest">最早建立</option>
            <option value="priceAsc">價格：低到高</option>
            <option value="priceDesc">價格：高到低</option>
          </select>
        </div>
      </section>

      <div className="admin-result-summary" aria-live="polite">
        <p>{page ? `共 ${page.total} 件商品` : error ? "商品數量暫時無法取得" : "正在讀取商品…"}</p>
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

      {!page && !error ? <StatusPanel title="正在載入商品管理資料" message="正在整理商品與庫存狀態。" /> : null}
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
          message="調整搜尋與分類條件，或建立第一件商品。"
        />
      ) : null}

      {products.length > 0 ? (
        <div className="admin-table-frame">
          <table className="admin-product-table">
            <caption className="sr-only">商品管理列表</caption>
            <thead>
              <tr>
                <th scope="col">商品</th>
                <th scope="col">分類</th>
                <th scope="col">價格</th>
                <th scope="col">庫存</th>
                <th scope="col">最後修改</th>
                <th scope="col">操作</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.productId}>
                  <td>
                    <div className="admin-product-cell">
                      <div className="admin-product-thumb">
                        <ProductImage src={getProductImageUrl(product)} alt={product.productName} />
                      </div>
                      <div>
                        <strong>{product.productName}</strong>
                        <span>SW-{String(product.productId).padStart(4, "0")}</span>
                      </div>
                    </div>
                  </td>
                  <td><span className="admin-category-tag">{getCategoryLabel(product.category)}</span></td>
                  <td>{formatPrice(product.price)}</td>
                  <td>
                    <span className={`admin-stock-tag${product.stock <= 0 ? " is-sold-out" : ""}`}>
                      {product.stock <= 0 ? "售罄" : `${product.stock} 件`}
                    </span>
                  </td>
                  <td>{formatDateTime(product.lastModifiedDate)}</td>
                  <td>
                    <div className="admin-row-actions">
                      <Link to={`/admin/products/${product.productId}/edit`}>編輯</Link>
                      <button
                        type="button"
                        disabled={deletingProductId === product.productId}
                        onClick={() => handleDelete(product)}
                      >
                        {deletingProductId === product.productId ? "刪除中…" : "刪除"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {page && totalPages > 1 ? (
        <nav className="pagination" aria-label="管理商品分頁">
          <button type="button" disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}>
            上一頁
          </button>
          <span>第 {currentPage} / {totalPages} 頁</span>
          <button type="button" disabled={currentPage >= totalPages} onClick={() => goToPage(currentPage + 1)}>
            下一頁
          </button>
        </nav>
      ) : null}
    </div>
  );
}

export default AdminProductsPage;
