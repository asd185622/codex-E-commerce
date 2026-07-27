import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createOrder } from "../api/orders";
import { getProduct } from "../api/products";
import { useCart } from "../hooks/useCart";
import { useUser } from "../hooks/useUser";
import CartPage from "./CartPage";

vi.mock("../api/orders", () => ({
  createOrder: vi.fn(),
}));

vi.mock("../api/products", () => ({
  getProduct: vi.fn(),
}));

vi.mock("../hooks/useCart", () => ({
  useCart: vi.fn(),
}));

vi.mock("../hooks/useUser", () => ({
  useUser: vi.fn(),
}));

const cartItem = {
  productId: 3,
  productName: "結帳測試商品",
  imageUrl: "https://example.com/product.jpg",
  price: 120,
  stock: 4,
  quantity: 2,
};

const clearCart = vi.fn();
const clearAuthenticatedUser = vi.fn();

function Destination({ title }) {
  const location = useLocation();

  return (
    <div>
      <p>{title}</p>
      <p data-testid="destination-state">{JSON.stringify(location.state)}</p>
    </div>
  );
}

function renderCartPage() {
  return render(
    <MemoryRouter initialEntries={["/cart"]}>
      <Routes>
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<Destination title="登入目的地" />} />
        <Route path="/orders" element={<Destination title="訂單目的地" />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("CartPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCart.mockReturnValue({
      items: [cartItem],
      subtotal: 240,
      setItemQuantity: vi.fn(),
      removeItem: vi.fn(),
      clearCart,
    });
    useUser.mockReturnValue({
      user: { userId: 8, email: "member@example.com" },
      isUserLoading: false,
      clearAuthenticatedUser,
    });
  });

  it("未登入時導向登入並保留購物袋返回資訊", async () => {
    const user = userEvent.setup();
    useUser.mockReturnValue({
      user: null,
      isUserLoading: false,
      clearAuthenticatedUser,
    });
    renderCartPage();

    await user.click(screen.getByRole("button", { name: "登入後建立訂單" }));

    expect(await screen.findByText("登入目的地")).toBeInTheDocument();
    expect(screen.getByTestId("destination-state")).toHaveTextContent('"from":"/cart"');
    expect(screen.getByTestId("destination-state")).toHaveTextContent("登入後會帶你回到購物袋");
    expect(getProduct).not.toHaveBeenCalled();
    expect(createOrder).not.toHaveBeenCalled();
  });

  it("最新庫存不足時阻止建立訂單", async () => {
    const user = userEvent.setup();
    getProduct.mockResolvedValue({ ...cartItem, stock: 1 });
    renderCartPage();

    await user.click(screen.getByRole("button", { name: "確認並建立訂單" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "「結帳測試商品」目前只剩 1 件，請調整購買數量。",
    );
    expect(getProduct).toHaveBeenCalledWith(3);
    expect(createOrder).not.toHaveBeenCalled();
  });

  it("商品已下架時顯示調整提示", async () => {
    const user = userEvent.setup();
    getProduct.mockRejectedValue({ response: { status: 404 } });
    renderCartPage();

    await user.click(screen.getByRole("button", { name: "確認並建立訂單" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "「結帳測試商品」已下架，請先從購物袋移除。",
    );
    expect(createOrder).not.toHaveBeenCalled();
  });

  it("庫存有效時建立訂單、清空購物車並導向訂單頁", async () => {
    const user = userEvent.setup();
    getProduct.mockResolvedValue({ ...cartItem, stock: 4 });
    createOrder.mockResolvedValue({ orderId: 26 });
    renderCartPage();

    await user.click(screen.getByRole("button", { name: "確認並建立訂單" }));

    await waitFor(() => {
      expect(createOrder).toHaveBeenCalledWith(8, [{ productId: 3, quantity: 2 }]);
    });
    expect(clearCart).toHaveBeenCalledOnce();
    expect(await screen.findByText("訂單目的地")).toBeInTheDocument();
    expect(screen.getByTestId("destination-state")).toHaveTextContent('"createdOrderId":26');
    expect(screen.getByTestId("destination-state")).toHaveTextContent("訂單已成立");
  });

  it("建立訂單回覆 401 時清除過期會員並導向登入", async () => {
    const user = userEvent.setup();
    getProduct.mockResolvedValue({ ...cartItem, stock: 4 });
    createOrder.mockRejectedValue({ response: { status: 401 } });
    renderCartPage();

    await user.click(screen.getByRole("button", { name: "確認並建立訂單" }));

    await waitFor(() => expect(clearAuthenticatedUser).toHaveBeenCalledOnce());
    expect(clearCart).not.toHaveBeenCalled();
    expect(await screen.findByText("登入目的地")).toBeInTheDocument();
    expect(screen.getByTestId("destination-state")).toHaveTextContent("登入狀態已失效");
  });
});
