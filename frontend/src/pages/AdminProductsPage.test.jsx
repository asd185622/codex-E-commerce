import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { deleteProduct, getProducts } from "../api/products";
import AdminProductsPage from "./AdminProductsPage";

vi.mock("../api/products", () => ({
  deleteProduct: vi.fn(),
  getProducts: vi.fn(),
}));

const product = {
  productId: 12,
  productName: "待刪除商品",
  category: "FOOD",
  imageUrl: "https://example.com/product.jpg",
  price: 120,
  stock: 2,
  lastModifiedDate: "2026-07-26 10:00:00",
};

describe("AdminProductsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getProducts.mockResolvedValue({ results: [product], total: 1 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("確認商品名稱後刪除並重新載入列表", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    deleteProduct.mockResolvedValue();

    render(
      <MemoryRouter>
        <AdminProductsPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("待刪除商品")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "刪除" }));

    expect(confirmSpy).toHaveBeenCalledWith(expect.stringContaining("待刪除商品"));
    await waitFor(() => expect(deleteProduct).toHaveBeenCalledWith(12));
    expect(await screen.findByText("已刪除「待刪除商品」。")).toBeInTheDocument();
    await waitFor(() => expect(getProducts).toHaveBeenCalledTimes(2));
  });
});
