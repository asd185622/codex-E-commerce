// 建立共用 Axios 實例，統一 API 前綴、逾時與 session cookie 傳送設定。
import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api",
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
