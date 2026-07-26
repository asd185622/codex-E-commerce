import { beforeEach, describe, expect, it, vi } from "vitest";
import apiClient from "./client";
import { getCsrfHeaders } from "./csrf";
import { createOrder, getOrders } from "./orders";

vi.mock("./client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock("./csrf", () => ({
  getCsrfHeaders: vi.fn(),
}));

describe("訂單 API", () => {
  const csrfHeaders = { "X-CSRF-TOKEN": "order-token" };

  beforeEach(() => {
    vi.clearAllMocks();
    getCsrfHeaders.mockResolvedValue(csrfHeaders);
  });

  it("建立訂單時附帶會員路徑、商品清單與 CSRF", async () => {
    const buyItemList = [{ productId: 3, quantity: 2 }];
    const order = { orderId: 26 };
    apiClient.post.mockResolvedValue({ data: order });

    await expect(createOrder(8, buyItemList)).resolves.toEqual(order);
    expect(apiClient.post).toHaveBeenCalledWith(
      "/users/8/orders",
      { buyItemList },
      { headers: csrfHeaders },
    );
  });

  it("查詢訂單時傳遞分頁參數與取消訊號", async () => {
    const response = { results: [], total: 0 };
    const signal = new AbortController().signal;
    apiClient.get.mockResolvedValue({ data: response });

    await expect(getOrders(8, { limit: 5, offset: 0 }, signal)).resolves.toEqual(response);
    expect(apiClient.get).toHaveBeenCalledWith("/users/8/orders", {
      params: { limit: 5, offset: 0 },
      signal,
    });
  });
});
