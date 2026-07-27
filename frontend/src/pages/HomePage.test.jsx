import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getProducts } from "../api/products";
import HomePage from "./HomePage";

vi.mock("../api/products", () => ({
  getProducts: vi.fn(),
}));

function createProduct(productId) {
  return {
    productId,
    productName: `商品 ${productId}`,
    category: "FOOD",
    imageUrl: "",
    price: productId * 100,
    stock: productId,
  };
}

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getProducts.mockResolvedValue({
      limit: 9,
      offset: 0,
      total: 9,
      results: Array.from({ length: 9 }, (_, index) => createProduct(index + 1)),
    });
  });

  it("保留第一筆作為主打商品並在最新上架顯示其餘八筆", async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    const latestSection = await screen.findByRole("region", { name: "最新上架" });
    const latestCards = within(latestSection).getAllByRole("article");

    expect(getProducts).toHaveBeenCalledWith(
      { orderBy: "created_date", sort: "desc", limit: 9, offset: 0 },
      expect.any(AbortSignal),
    );
    expect(screen.getByRole("heading", { name: "商品 1" })).toBeInTheDocument();
    expect(latestCards).toHaveLength(8);
    expect(within(latestSection).queryByRole("heading", { name: "商品 1" })).not.toBeInTheDocument();
    expect(within(latestSection).getByRole("heading", { name: "商品 9" })).toBeInTheDocument();
  });
});
