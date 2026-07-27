// 顯示找不到路由時的 404 提示與返回首頁入口。
import { Link } from "react-router";
import StatusPanel from "../components/StatusPanel";

function NotFoundPage() {
  return (
    <div className="detail-state page-width">
      <StatusPanel
        title="這個頁面不存在"
        message="網址可能有誤，或頁面仍在準備中。"
        headingLevel={1}
      />
      <Link className="text-link centered-link" to="/">返回拾物首頁</Link>
    </div>
  );
}

export default NotFoundPage;
