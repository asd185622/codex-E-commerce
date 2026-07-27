// 將商品管理 Demo 與消費者商城版型分離。
import { Link, NavLink, Outlet } from "react-router";
import ScrollToTop from "../components/ScrollToTop";

function AdminLayout() {
  return (
    <div className="admin-shell">
      <a className="skip-link" href="#admin-main-content">
        跳至主要內容
      </a>

      <header className="admin-header">
        <div className="admin-header-main page-width">
          <Link className="admin-brand" to="/admin/products" aria-label="拾物商品管理 Demo 首頁">
            <span>拾物 SHIWU</span>
            <strong>PRODUCT CONSOLE</strong>
          </Link>
          <nav className="admin-nav" aria-label="管理 Demo 導覽">
            <NavLink to="/admin/products" end>商品管理</NavLink>
            <Link to="/">返回商店</Link>
          </nav>
        </div>
      </header>

      <ScrollToTop />
      <main id="admin-main-content" tabIndex="-1">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
