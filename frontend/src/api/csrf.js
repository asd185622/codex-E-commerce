// 向後端取得目前 session 對應的 CSRF token，供非 GET 請求放入標頭。
import apiClient from "./client";

export async function getCsrfHeaders() {
  const response = await apiClient.get("/csrf");
  const { headerName, token } = response.data;

  return {
    [headerName]: token,
  };
}
