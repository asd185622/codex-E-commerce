// 將 Axios 與後端錯誤轉換為使用者容易理解的繁體中文訊息。
import axios from "axios";

export function getErrorMessage(error, fallback = "目前無法取得資料，請稍後再試。") {
  if (axios.isCancel(error)) {
    return "";
  }

  if (error.response?.status === 404) {
    return "找不到這筆資料，內容可能已被移除。";
  }

  if (error.code === "ECONNABORTED") {
    return "連線等候時間過久，請確認後端服務是否已啟動。";
  }

  if (!error.response) {
    return "無法連接商店服務，請確認 Spring Boot 後端已在 8080 埠啟動。";
  }

  if (error.response.status >= 500) {
    return "商店服務暫時無法回應，請確認 Spring Boot 後端與資料庫是否已啟動。";
  }

  return fallback;
}

export function getAuthErrorMessage(error, mode) {
  if (error.response?.status === 401) {
    return "Email 或密碼不正確，請重新確認後再登入。";
  }

  if (error.response?.status === 403) {
    return "安全驗證已過期，請重新送出一次。";
  }

  if (error.response?.status === 400) {
    return mode === "register"
      ? "此 Email 可能已被使用，請確認格式或改用其他 Email。"
      : "Email 或密碼不正確，請重新確認後再登入。";
  }

  return getErrorMessage(error, "會員服務暫時無法使用，請稍後再試。");
}

export function getOrderErrorMessage(error, mode) {
  if (error.response?.status === 401) {
    return "登入狀態已失效，請重新登入後再繼續。";
  }

  if (error.response?.status === 403) {
    return "安全驗證已過期，請重新整理頁面後再試一次。";
  }

  if (error.response?.status === 400 && mode === "create") {
    return "訂單無法建立，商品可能已下架或庫存剛剛發生變動，請重新確認購物袋。";
  }

  return getErrorMessage(
    error,
    mode === "create" ? "目前無法建立訂單，請稍後再試。" : "目前無法取得訂單，請稍後再試。",
  );
}

export function getProductWriteErrorMessage(error, action) {
  if (error.response?.status === 403) {
    return "安全驗證已過期，請重新整理頁面後再試一次。";
  }

  if (error.response?.status === 404) {
    return "找不到這件商品，內容可能已被其他操作移除。";
  }

  if (error.response?.status === 400) {
    return "商品資料未通過後端驗證，請重新確認必填欄位、價格與庫存。";
  }

  const fallback = action === "delete"
    ? "目前無法刪除商品，請稍後再試。"
    : "目前無法儲存商品，請稍後再試。";

  return getErrorMessage(error, fallback);
}
