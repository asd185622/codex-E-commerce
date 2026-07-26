// 顯示購物車內容，並在確認最新商品與庫存後建立會員訂單。
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { createOrder } from "../api/orders";
import { getProduct } from "../api/products";
import ProductImage from "../components/ProductImage";
import StatusPanel from "../components/StatusPanel";
import { useCart } from "../hooks/useCart";
import { useUser } from "../hooks/useUser";
import { getErrorMessage, getOrderErrorMessage } from "../utils/errors";
import { formatPrice } from "../utils/formatters";
import { getProductImageUrl } from "../utils/productImages";

function CartPage() {
  const navigate = useNavigate();
  const { items, subtotal, setItemQuantity, removeItem, clearCart } = useCart();
  const { user, isUserLoading, clearAuthenticatedUser } = useUser();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutIssues, setCheckoutIssues] = useState([]);

  async function validateLatestProducts() {
    // 商品查詢彼此獨立，並行取得可縮短結帳前的等待時間。
    const results = await Promise.allSettled(
      items.map((item) => getProduct(item.productId)),
    );
    const serviceFailure = results.find(
      (result) => result.status === "rejected" && result.reason?.response?.status !== 404,
    );

    if (serviceFailure) throw serviceFailure.reason;

    return results.flatMap((result, index) => {
      const item = items[index];

      if (result.status === "rejected") {
        return [`「${item.productName}」已下架，請先從購物袋移除。`];
      }

      const latestProduct = result.value;
      if (latestProduct.stock <= 0) {
        return [`「${latestProduct.productName}」目前已售罄。`];
      }

      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        return [`「${latestProduct.productName}」的數量必須至少為 1。`];
      }

      if (item.quantity > latestProduct.stock) {
        return [
          `「${latestProduct.productName}」目前只剩 ${latestProduct.stock} 件，請調整購買數量。`,
        ];
      }

      return [];
    });
  }

  async function handleCheckout() {
    setCheckoutError("");
    setCheckoutIssues([]);

    if (!user) {
      navigate("/login", {
        state: {
          from: "/cart",
          loginMessage: "請先登入，登入後會帶你回到購物袋完成訂單。",
        },
      });
      return;
    }

    setIsCheckingOut(true);

    try {
      const issues = await validateLatestProducts();
      if (issues.length > 0) {
        setCheckoutIssues(issues);
        return;
      }

      const order = await createOrder(
        user.userId,
        items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      );
      clearCart();
      navigate("/orders", {
        replace: true,
        state: {
          createdOrderId: order.orderId,
          successMessage: "訂單已成立，購物袋也已清空。",
        },
      });
    } catch (error) {
      if (error.response?.status === 401) {
        clearAuthenticatedUser();
        navigate("/login", {
          state: {
            from: "/cart",
            loginMessage: "登入狀態已失效，請重新登入後再完成訂單。",
          },
        });
        return;
      }

      const message = error.response
        ? getOrderErrorMessage(error, "create")
        : getErrorMessage(error, "目前無法確認商品狀態，請稍後再試。");
      setCheckoutError(message);
    } finally {
      setIsCheckingOut(false);
    }
  }

  return (
    <div className="cart-page page-width">
      <header className="page-heading">
        <p className="eyebrow">YOUR BAG</p>
        <h1>購物袋</h1>
        <p>確認選物與數量後，我們會再核對一次最新庫存，再送出這張訂單。</p>
      </header>

      {items.length === 0 ? (
        <StatusPanel
          title="購物袋還是空的"
          message="從食味、行旅或閱讀開始，挑一件適合今天的選物。"
        />
      ) : (
        <div className="cart-layout">
          <div className="cart-list">
            {items.map((item) => (
              <article className="cart-item" key={item.productId}>
                <Link className="cart-item-image" to={`/products/${item.productId}`}>
                  <ProductImage src={getProductImageUrl(item)} alt={item.productName} />
                </Link>
                <div className="cart-item-copy">
                  <h2><Link to={`/products/${item.productId}`}>{item.productName}</Link></h2>
                  <p>{formatPrice(item.price)}</p>
                  <label htmlFor={`quantity-${item.productId}`}>數量</label>
                  <input
                    id={`quantity-${item.productId}`}
                    type="number"
                    min="1"
                    max={item.stock}
                    value={item.quantity}
                    onChange={(event) => {
                      setItemQuantity(item.productId, Number(event.target.value) || 1);
                      setCheckoutIssues([]);
                      setCheckoutError("");
                    }}
                  />
                </div>
                <div className="cart-item-end">
                  <strong>{formatPrice(item.price * item.quantity)}</strong>
                  <button
                    type="button"
                    onClick={() => {
                      removeItem(item.productId);
                      setCheckoutIssues([]);
                      setCheckoutError("");
                    }}
                  >
                    移除
                  </button>
                </div>
              </article>
            ))}
          </div>

          <aside className="cart-summary">
            <h2>金額摘要</h2>
            <div>
              <span>商品小計</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            <p>此作品集不串接金流與運費；訂單金額以送出時後端的最新商品價格為準。</p>

            {checkoutIssues.length > 0 ? (
              <div className="checkout-feedback checkout-feedback-warning" role="alert">
                <strong>購物袋需要調整</strong>
                <ul>
                  {checkoutIssues.map((issue) => <li key={issue}>{issue}</li>)}
                </ul>
              </div>
            ) : null}

            {checkoutError ? (
              <p className="checkout-feedback checkout-feedback-error" role="alert">
                {checkoutError}
              </p>
            ) : null}

            <button
              className="button button-primary"
              type="button"
              disabled={isCheckingOut || isUserLoading}
              onClick={handleCheckout}
            >
              {isUserLoading
                ? "確認登入狀態…"
                : isCheckingOut
                  ? "確認商品與建立訂單中…"
                  : user
                    ? "確認並建立訂單"
                    : "登入後建立訂單"}
            </button>
          </aside>
        </div>
      )}
      <Link className="text-link cart-continue" to="/products">繼續瀏覽商品</Link>
    </div>
  );
}

export default CartPage;
