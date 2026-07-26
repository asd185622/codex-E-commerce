// 顯示目前登入會員的訂單明細，並處理 Session、分頁與資料狀態。
import { useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router";
import { getOrders } from "../api/orders";
import ProductImage from "../components/ProductImage";
import StatusPanel from "../components/StatusPanel";
import { useUser } from "../hooks/useUser";
import { getOrderErrorMessage } from "../utils/errors";
import { formatDateTime, formatPrice } from "../utils/formatters";

const PAGE_SIZE = 5;

function OrdersPage() {
  const location = useLocation();
  const { user, isUserLoading, clearAuthenticatedUser } = useUser();
  const [page, setPage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState("");
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    if (!user?.userId) return undefined;

    // 會員或分頁改變時重新取得訂單，離開頁面則取消尚未完成的請求。
    const controller = new AbortController();

    async function loadOrders() {
      setPage(null);
      setError("");

      try {
        const data = await getOrders(
          user.userId,
          {
            limit: PAGE_SIZE,
            offset: (currentPage - 1) * PAGE_SIZE,
          },
          controller.signal,
        );
        setPage(data);
      } catch (requestError) {
        if (requestError.response?.status === 401) {
          clearAuthenticatedUser();
          return;
        }

        const message = getOrderErrorMessage(requestError, "list");
        if (message) setError(message);
      }
    }

    loadOrders();
    return () => controller.abort();
  }, [user?.userId, currentPage, requestKey, clearAuthenticatedUser]);

  if (isUserLoading) {
    return (
      <div className="orders-page page-width">
        <StatusPanel title="正在確認會員狀態" message="確認完成後就會載入你的訂單。" />
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: "/orders",
          loginMessage: "請先登入，再查看你的訂單。",
        }}
      />
    );
  }

  const orders = page?.results ?? [];
  const totalPages = page ? Math.max(1, Math.ceil(page.total / PAGE_SIZE)) : 1;

  function goToPage(pageNumber) {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="orders-page page-width">
      <header className="page-heading orders-heading">
        <p className="eyebrow">ORDER ARCHIVE</p>
        <h1>我的訂單</h1>
        <p>每張訂單都保留成立時的商品、數量與金額，方便你回顧這次選物。</p>
      </header>

      {location.state?.successMessage ? (
        <div className="order-success" role="status">
          <div>
            <strong>{location.state.successMessage}</strong>
            {location.state.createdOrderId ? (
              <span>訂單編號 SW-{String(location.state.createdOrderId).padStart(6, "0")}</span>
            ) : null}
          </div>
          <span aria-hidden="true">已完成</span>
        </div>
      ) : null}

      {!page && !error ? (
        <StatusPanel title="正在整理訂單" message="正在取得最新的訂單與商品明細。" />
      ) : null}

      {error ? (
        <StatusPanel
          title="無法載入訂單"
          message={error}
          actionLabel="重新載入"
          onAction={() => setRequestKey((key) => key + 1)}
        />
      ) : null}

      {page && orders.length === 0 ? (
        <StatusPanel
          title="目前還沒有訂單"
          message="把購物袋裡的選物送出後，訂單就會保存在這裡。"
        />
      ) : null}

      {orders.length > 0 ? (
        <section className="order-list" aria-label="訂單列表">
          {orders.map((order) => (
            <article className="order-card" key={order.orderId}>
              <header className="order-card-heading">
                <div>
                  <p className="eyebrow">ORDER</p>
                  <h2>SW-{String(order.orderId).padStart(6, "0")}</h2>
                </div>
                <dl className="order-meta">
                  <div>
                    <dt>成立時間</dt>
                    <dd>{formatDateTime(order.createdDate)}</dd>
                  </div>
                  <div>
                    <dt>訂單總額</dt>
                    <dd>{formatPrice(order.totalAmount)}</dd>
                  </div>
                </dl>
              </header>

              <div className="order-items">
                {(order.orderItemList ?? []).map((item) => (
                  <div className="order-item" key={item.orderItemId ?? item.productId}>
                    <Link className="order-item-image" to={`/products/${item.productId}`}>
                      <ProductImage src={item.imageUrl} alt={item.productName || "訂單商品"} />
                    </Link>
                    <div className="order-item-copy">
                      <h3>
                        <Link to={`/products/${item.productId}`}>
                          {item.productName || `商品 ${item.productId}`}
                        </Link>
                      </h3>
                      <p>數量 {item.quantity}</p>
                    </div>
                    <strong>{formatPrice(item.amount)}</strong>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {page && totalPages > 1 ? (
        <nav className="pagination" aria-label="訂單分頁">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => goToPage(currentPage - 1)}
          >
            上一頁
          </button>
          <span>第 {currentPage} / {totalPages} 頁，共 {page.total} 張訂單</span>
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

export default OrdersPage;
