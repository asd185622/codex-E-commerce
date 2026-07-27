import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getProduct } from "../api/products";
import { useCart } from "../hooks/useCart";
import ProductDetailPage from "./ProductDetailPage";

vi.mock("../api/products", () => ({
  getProduct: vi.fn(),
}));

vi.mock("../hooks/useCart", () => ({
  useCart: vi.fn(),
}));

const product = {
  productId: 7,
  productName: "購買上限測試商品",
  category: "FOOD",
  imageUrl: "https://example.com/product.jpg",
  price: 100,
  stock: 4,
};

const addItem = vi.fn();

function renderProductDetailPage() {
  return render(
    <MemoryRouter initialEntries={["/products/7"]}>
      <Routes>
        <Route path="/products/:productId" element={<ProductDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ProductDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getProduct.mockResolvedValue(product);
  });

  it("購物袋數量達庫存上限時停用加入按鈕並顯示提示", async () => {
    useCart.mockReturnValue({
      items: [{ ...product, quantity: 4 }],
      addItem,
    });

    renderProductDetailPage();

    expect(await screen.findByRole("button", { name: "已達購買上限" })).toBeDisabled();
    expect(screen.getByText("購物袋已有 4 件，已達此商品的購買上限。")).toBeInTheDocument();
    expect(screen.queryByLabelText("數量")).not.toBeInTheDocument();
    expect(addItem).not.toHaveBeenCalled();
  });

  it("購物袋已有商品時只允許加入剩餘庫存", async () => {
    const user = userEvent.setup();
    useCart.mockReturnValue({
      items: [{ ...product, quantity: 3 }],
      addItem,
    });

    renderProductDetailPage();

    const quantityInput = await screen.findByLabelText("數量");
    expect(quantityInput).toHaveAttribute("max", "1");

    await user.click(screen.getByRole("button", { name: "加入購物袋" }));

    expect(addItem).toHaveBeenCalledWith(product, 1);
  });
});
