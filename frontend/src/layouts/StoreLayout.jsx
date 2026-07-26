// 提供所有商店頁面共用的頁首、主要內容區與頁尾版型。
import { Outlet } from "react-router";
import ScrollToTop from "../components/ScrollToTop";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";

function StoreLayout() {
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">
        跳至主要內容
      </a>
      <SiteHeader />
      <ScrollToTop />
      <main id="main-content">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}

export default StoreLayout;
