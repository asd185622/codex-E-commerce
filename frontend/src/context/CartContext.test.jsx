import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { useCart } from "../hooks/useCart";
import CartProvider from "./CartContext";

const product = {
  productId: 3,
  productName: "購物車測試商品",
  imageUrl: "https://example.com/product.jpg",
  price: 120,
  stock: 4,
};

function CartStateProbe() {
  const {
    items,
    itemCount,
    subtotal,
    addItem,
    setItemQuantity,
    removeItem,
    clearCart,
  } = useCart();

  return (
    <div>
      <p data-testid="items">{JSON.stringify(items)}</p>
      <p>總數 {itemCount}</p>
      <p>小計 {subtotal}</p>
      <button type="button" onClick={() => addItem(product, 2)}>加入兩件</button>
      <button type="button" onClick={() => addItem(product, 3)}>再加三件</button>
      <button type="button" onClick={() => setItemQuantity(product.productId, 99)}>超過庫存</button>
      <button type="button" onClick={() => setItemQuantity(product.productId, 0)}>低於一件</button>
      <button type="button" onClick={() => removeItem(product.productId)}>移除商品</button>
      <button type="button" onClick={clearCart}>清空購物車</button>
    </div>
  );
}

function renderCartProvider() {
  return render(
    <CartProvider>
      <CartStateProbe />
    </CartProvider>,
  );
}

describe("CartProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("從 localStorage 還原購物車與金額", () => {
    localStorage.setItem("shiwu-cart", JSON.stringify([{ ...product, quantity: 2 }]));

    renderCartProvider();

    expect(screen.getByText("總數 2")).toBeInTheDocument();
    expect(screen.getByText("小計 240")).toBeInTheDocument();
  });

  it("localStorage 損壞時安全回到空購物車", () => {
    localStorage.setItem("shiwu-cart", "not-json");

    renderCartProvider();

    expect(screen.getByText("總數 0")).toBeInTheDocument();
    expect(screen.getByTestId("items")).toHaveTextContent("[]");
  });

  it("合併相同商品並將數量限制在 1 到庫存之間", async () => {
    const user = userEvent.setup();
    renderCartProvider();

    await user.click(screen.getByRole("button", { name: "加入兩件" }));
    expect(screen.getByText("總數 2")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "再加三件" }));
    expect(screen.getByText("總數 4")).toBeInTheDocument();
    expect(screen.getByText("小計 480")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "超過庫存" }));
    expect(screen.getByText("總數 4")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "低於一件" }));
    expect(screen.getByText("總數 1")).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("shiwu-cart"))).toEqual([
      expect.objectContaining({ productId: 3, quantity: 1 }),
    ]);
  });

  it("移除與清空操作會同步 localStorage", async () => {
    const user = userEvent.setup();
    renderCartProvider();

    await user.click(screen.getByRole("button", { name: "加入兩件" }));
    await user.click(screen.getByRole("button", { name: "移除商品" }));
    expect(screen.getByTestId("items")).toHaveTextContent("[]");
    expect(localStorage.getItem("shiwu-cart")).toBe("[]");

    await user.click(screen.getByRole("button", { name: "加入兩件" }));
    await user.click(screen.getByRole("button", { name: "清空購物車" }));
    expect(screen.getByText("總數 0")).toBeInTheDocument();
    expect(localStorage.getItem("shiwu-cart")).toBe("[]");
  });
});
