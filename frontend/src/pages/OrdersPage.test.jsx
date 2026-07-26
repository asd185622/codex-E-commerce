import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getOrders } from "../api/orders";
import { useUser } from "../hooks/useUser";
import OrdersPage from "./OrdersPage";

vi.mock("../api/orders", () => ({
  getOrders: vi.fn(),
}));

vi.mock("../hooks/useUser", () => ({
  useUser: vi.fn(),
}));

const clearAuthenticatedUser = vi.fn();
const member = { userId: 8, email: "member@example.com" };
const order = {
  orderId: 26,
  totalAmount: 240,
  createdDate: "2026-07-26T10:00:00",
  orderItemList: [
    {
      orderItemId: 81,
      productId: 3,
      productName: "訂單測試商品",
      imageUrl: "https://example.com/product.jpg",
      quantity: 2,
      amount: 240,
    },
  ],
};

function LoginDestination() {
  const location = useLocation();

  return (
    <div>
      <p>登入目的地</p>
      <p data-testid="login-state">{JSON.stringify(location.state)}</p>
    </div>
  );
}

function renderOrdersPage(state) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: "/orders", state }]}>
      <Routes>
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/login" element={<LoginDestination />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("OrdersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    useUser.mockReturnValue({
      user: member,
      isUserLoading: false,
      clearAuthenticatedUser,
    });
    getOrders.mockResolvedValue({ results: [], total: 0 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("會員狀態確認中時不查詢訂單", () => {
    useUser.mockReturnValue({
      user: null,
      isUserLoading: true,
      clearAuthenticatedUser,
    });

    renderOrdersPage();

    expect(screen.getByText("正在確認會員狀態")).toBeInTheDocument();
    expect(getOrders).not.toHaveBeenCalled();
  });

  it("未登入時導向登入並保留訂單頁返回資訊", async () => {
    useUser.mockReturnValue({
      user: null,
      isUserLoading: false,
      clearAuthenticatedUser,
    });

    renderOrdersPage();

    expect(await screen.findByText("登入目的地")).toBeInTheDocument();
    expect(screen.getByTestId("login-state")).toHaveTextContent('"from":"/orders"');
    expect(screen.getByTestId("login-state")).toHaveTextContent("請先登入，再查看你的訂單。");
    expect(getOrders).not.toHaveBeenCalled();
  });

  it("載入完成且沒有訂單時顯示空資料狀態", async () => {
    renderOrdersPage();

    expect(screen.getByText("正在整理訂單")).toBeInTheDocument();
    expect(await screen.findByText("目前還沒有訂單")).toBeInTheDocument();
    expect(getOrders).toHaveBeenCalledWith(
      8,
      { limit: 5, offset: 0 },
      expect.anything(),
    );
  });

  it("顯示建立成功提示與訂單商品內容", async () => {
    getOrders.mockResolvedValue({ results: [order], total: 1 });

    renderOrdersPage({
      createdOrderId: 26,
      successMessage: "訂單已成立，購物袋也已清空。",
    });

    expect(screen.getByText("訂單已成立，購物袋也已清空。")).toBeInTheDocument();
    expect(await screen.findByText("訂單測試商品")).toBeInTheDocument();
    expect(screen.getByText("訂單編號 SW-000026")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "SW-000026" })).toBeInTheDocument();
    expect(screen.getByText("數量 2")).toBeInTheDocument();
    expect(screen.getAllByText("$240")).toHaveLength(2);
  });

  it("切換下一頁時使用正確 offset 並更新分頁文字", async () => {
    const user = userEvent.setup();
    getOrders
      .mockResolvedValueOnce({ results: [order], total: 6 })
      .mockResolvedValueOnce({
        results: [{ ...order, orderId: 27 }],
        total: 6,
      });
    renderOrdersPage();

    expect(await screen.findByText("第 1 / 2 頁，共 6 張訂單")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "下一頁" }));

    await waitFor(() => {
      expect(getOrders).toHaveBeenLastCalledWith(
        8,
        { limit: 5, offset: 5 },
        expect.anything(),
      );
    });
    expect(await screen.findByText("SW-000027")).toBeInTheDocument();
    expect(screen.getByText("第 2 / 2 頁，共 6 張訂單")).toBeInTheDocument();
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  it("載入失敗時顯示錯誤並可重新查詢", async () => {
    const user = userEvent.setup();
    getOrders
      .mockRejectedValueOnce({ response: { status: 500 } })
      .mockResolvedValueOnce({ results: [], total: 0 });
    renderOrdersPage();

    expect(await screen.findByText("無法載入訂單")).toBeInTheDocument();
    expect(screen.getByText("商店服務暫時無法回應，請確認 Spring Boot 後端與資料庫是否已啟動。")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "重新載入" }));

    expect(await screen.findByText("目前還沒有訂單")).toBeInTheDocument();
    expect(getOrders).toHaveBeenCalledTimes(2);
  });

  it("訂單查詢回覆 401 時清除過期會員", async () => {
    getOrders.mockRejectedValue({ response: { status: 401 } });
    renderOrdersPage();

    await waitFor(() => expect(clearAuthenticatedUser).toHaveBeenCalledOnce());
    expect(screen.queryByText("無法載入訂單")).not.toBeInTheDocument();
  });
});
