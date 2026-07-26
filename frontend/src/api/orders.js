// 封裝建立訂單與查詢目前會員訂單的 API。
import apiClient from "./client";
import { getCsrfHeaders } from "./csrf";

export async function createOrder(userId, buyItemList) {
  // 建立訂單會改變庫存與訂單資料，因此必須攜帶目前 session 的 CSRF token。
  const csrfHeaders = await getCsrfHeaders();
  const response = await apiClient.post(
    `/users/${userId}/orders`,
    { buyItemList },
    { headers: csrfHeaders },
  );

  return response.data;
}

export async function getOrders(userId, params, signal) {
  const response = await apiClient.get(`/users/${userId}/orders`, { params, signal });
  return response.data;
}
