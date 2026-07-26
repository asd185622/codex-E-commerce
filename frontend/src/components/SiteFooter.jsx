// 顯示全站共用頁尾與作品集相關入口。
import { Link } from "react-router-dom";

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-content page-width">
        <div>
          <p className="brand footer-brand">
            <span className="brand-chinese">拾物</span>
            <span className="brand-latin">SHIWU</span>
          </p>
          <p className="footer-note">一個以 Spring Boot API 為核心的作品集商城。</p>
        </div>
        <div className="footer-links">
          <Link to="/products">瀏覽商品</Link>
          <Link to="/admin/products">進入商品管理 Demo</Link>
          <span className="footer-demo">管理 Demo 未實作 RBAC，不代表真正授權。</span>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
