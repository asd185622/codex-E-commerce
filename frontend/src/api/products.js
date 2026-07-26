// 集中封裝商品列表與單一商品的查詢請求。
import apiClient from "./client";

export async function getProducts(params, signal) {
  const response = await apiClient.get("/products", { params, signal });
  return response.data;
}

export async function getProduct(productId, signal) {
  const response = await apiClient.get(`/products/${productId}`, { signal });
  return response.data;
}
