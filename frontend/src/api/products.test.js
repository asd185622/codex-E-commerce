import { beforeEach, describe, expect, it, vi } from "vitest";
import apiClient from "./client";
import { getCsrfHeaders } from "./csrf";
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
  uploadProductImage,
} from "./products";

vi.mock("./client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("./csrf", () => ({
  getCsrfHeaders: vi.fn(),
}));

describe("商品 API", () => {
  const csrfHeaders = { "X-CSRF-TOKEN": "test-token" };

  beforeEach(() => {
    vi.clearAllMocks();
    getCsrfHeaders.mockResolvedValue(csrfHeaders);
  });

  it("傳遞商品列表查詢參數與取消訊號", async () => {
    const response = { results: [], total: 0 };
    const signal = new AbortController().signal;
    apiClient.get.mockResolvedValue({ data: response });

    await expect(getProducts({ limit: 10 }, signal)).resolves.toEqual(response);
    expect(apiClient.get).toHaveBeenCalledWith("/products", {
      params: { limit: 10 },
      signal,
    });
  });

  it("取得單一商品", async () => {
    const product = { productId: 12, productName: "測試商品" };
    apiClient.get.mockResolvedValue({ data: product });

    await expect(getProduct(12)).resolves.toEqual(product);
    expect(apiClient.get).toHaveBeenCalledWith("/products/12", { signal: undefined });
  });

  it("新增商品前取得 CSRF 標頭", async () => {
    const product = { productName: "新增商品" };
    apiClient.post.mockResolvedValue({ data: { productId: 13, ...product } });

    await createProduct(product);

    expect(getCsrfHeaders).toHaveBeenCalledOnce();
    expect(apiClient.post).toHaveBeenCalledWith("/products", product, { headers: csrfHeaders });
  });

  it("以上傳表單與 CSRF 標頭送出商品圖片", async () => {
    const file = new File(["image"], "product.png", { type: "image/png" });
    apiClient.post.mockResolvedValue({ data: { imageUrl: "/product-images/generated.png" } });

    await expect(uploadProductImage(file)).resolves.toEqual({
      imageUrl: "/product-images/generated.png",
    });

    const [, formData, config] = apiClient.post.mock.calls[0];
    expect(formData).toBeInstanceOf(FormData);
    expect(formData.get("file")).toBe(file);
    expect(config).toEqual({
      headers: {
        ...csrfHeaders,
        "Content-Type": "multipart/form-data",
      },
    });
  });

  it("更新商品前取得 CSRF 標頭", async () => {
    const product = { productName: "更新商品" };
    apiClient.put.mockResolvedValue({ data: { productId: 13, ...product } });

    await updateProduct(13, product);

    expect(getCsrfHeaders).toHaveBeenCalledOnce();
    expect(apiClient.put).toHaveBeenCalledWith("/products/13", product, { headers: csrfHeaders });
  });

  it("刪除商品前取得 CSRF 標頭", async () => {
    apiClient.delete.mockResolvedValue({});

    await deleteProduct(13);

    expect(getCsrfHeaders).toHaveBeenCalledOnce();
    expect(apiClient.delete).toHaveBeenCalledWith("/products/13", { headers: csrfHeaders });
  });
});
