// 集中封裝商品查詢、圖片上傳與管理 Demo 的寫入請求。
import apiClient from "./client";
import { getCsrfHeaders } from "./csrf";

export async function getProducts(params, signal) {
  const response = await apiClient.get("/products", { params, signal });
  return response.data;
}

export async function getProduct(productId, signal) {
  const response = await apiClient.get(`/products/${productId}`, { signal });
  return response.data;
}

export async function uploadProductImage(file) {
  const csrfHeaders = await getCsrfHeaders();
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post("/product-images", formData, {
    headers: {
      ...csrfHeaders,
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function createProduct(product) {
  const csrfHeaders = await getCsrfHeaders();
  const response = await apiClient.post("/products", product, {
    headers: csrfHeaders,
  });
  return response.data;
}

export async function updateProduct(productId, product) {
  const csrfHeaders = await getCsrfHeaders();
  const response = await apiClient.put(`/products/${productId}`, product, {
    headers: csrfHeaders,
  });
  return response.data;
}

export async function deleteProduct(productId) {
  const csrfHeaders = await getCsrfHeaders();
  await apiClient.delete(`/products/${productId}`, {
    headers: csrfHeaders,
  });
}
