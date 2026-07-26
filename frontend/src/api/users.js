// 封裝會員註冊、登入、session 查詢與登出 API。
import apiClient from "./client";
import { getCsrfHeaders } from "./csrf";

export async function loginUser(credentials) {
  // Spring Security 表單登入預設接收 form-urlencoded，而不是 JSON。
  const csrfHeaders = await getCsrfHeaders();
  const formData = new URLSearchParams();
  formData.set("email", credentials.email);
  formData.set("password", credentials.password);

  const response = await apiClient.post("/users/login", formData, {
    headers: {
      ...csrfHeaders,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return response.data;
}

export async function registerUser(credentials) {
  // 註冊會寫入資料，因此送出前同樣需要取得 CSRF token。
  const csrfHeaders = await getCsrfHeaders();
  const response = await apiClient.post("/users/register", credentials, {
    headers: csrfHeaders,
  });

  return response.data;
}

export async function getCurrentUser() {
  // 由後端 session 還原會員狀態，不信任前端自行保存的身分資料。
  const response = await apiClient.get("/users/me");
  return response.data;
}

export async function logoutUser() {
  // 登出屬於改變 session 的操作，必須帶入有效的 CSRF token。
  const csrfHeaders = await getCsrfHeaders();
  await apiClient.post("/users/logout", null, {
    headers: csrfHeaders,
  });
}
