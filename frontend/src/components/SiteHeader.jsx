// 顯示品牌、商品搜尋、會員 session 狀態與購物袋摘要。
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { useCart } from "../hooks/useCart";
import { useUser } from "../hooks/useUser";
import { BagIcon, SearchIcon, UserIcon } from "./icons";

function SiteHeader() {
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { user, isUserLoading, logout } = useUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  function handleSearch(event) {
    // 將頁首輸入的關鍵字轉成商品列表頁的 URL 查詢參數。
    event.preventDefault();
    const search = new FormData(event.currentTarget).get("search").trim();
    navigate(search ? `/products?search=${encodeURIComponent(search)}` : "/products");
    event.currentTarget.reset();
  }

  async function handleLogout() {
    // 等待後端 session 清除成功，再更新頁首的登入狀態。
    setIsLoggingOut(true);
    setLogoutError("");

    try {
      await logout();
      navigate("/");
    } catch {
      setLogoutError("登出失敗，請再試一次。");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="site-header">
      <div className="header-main page-width">
        <Link className="brand" to="/" aria-label="拾物 SHIWU 首頁">
          <span className="brand-chinese">拾物</span>
          <span className="brand-latin">SHIWU</span>
        </Link>

        <nav className="main-nav" aria-label="主要導覽">
          <NavLink to="/products" end>所有商品</NavLink>
        </nav>

        <div className="header-actions">
          <form className="header-search" role="search" onSubmit={handleSearch}>
            <label className="sr-only" htmlFor="site-search">
              搜尋商品
            </label>
            <input id="site-search" name="search" type="search" placeholder="搜尋選物" />
            <button type="submit" aria-label="搜尋">
              <SearchIcon />
            </button>
          </form>
          {isUserLoading ? (
            <span className="account-loading" role="status">確認中</span>
          ) : user ? (
            <div className="signed-in-user">
              <Link className="orders-link" to="/orders">我的訂單</Link>
              <span title={user.email}>{user.email}</span>
              <button type="button" onClick={handleLogout} disabled={isLoggingOut}>
                {isLoggingOut ? "登出中…" : "登出"}
              </button>
            </div>
          ) : (
            <Link className="account-link" to="/login">
              <UserIcon />
              <span>登入</span>
            </Link>
          )}
          {logoutError ? <span className="header-session-error" role="alert">{logoutError}</span> : null}
          <Link className="bag-link" to="/cart" aria-label={`購物袋，共 ${itemCount} 件商品`}>
            <BagIcon />
            <span>購物袋</span>
            {itemCount > 0 ? <span className="bag-count">{itemCount}</span> : null}
          </Link>
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;
