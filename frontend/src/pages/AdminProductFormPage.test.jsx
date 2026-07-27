import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createProduct, getProduct, updateProduct, uploadProductImage } from "../api/products";
import AdminProductFormPage from "./AdminProductFormPage";

vi.mock("../api/products", () => ({
  createProduct: vi.fn(),
  getProduct: vi.fn(),
  updateProduct: vi.fn(),
  uploadProductImage: vi.fn(),
}));

Object.defineProperty(URL, "createObjectURL", {
  configurable: true,
  value: vi.fn(() => "blob:product-preview"),
});
Object.defineProperty(URL, "revokeObjectURL", {
  configurable: true,
  value: vi.fn(),
});

function renderPage(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin/products/new" element={<AdminProductFormPage />} />
        <Route path="/admin/products/:productId/edit" element={<AdminProductFormPage />} />
        <Route path="/admin/products" element={<p>已返回商品管理</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

async function fillProductForm(user, name = "自動化測試商品") {
  await user.type(screen.getByLabelText("商品名稱"), name);
  await user.selectOptions(screen.getByLabelText("商品分類"), "E_BOOK");
  await user.upload(
    screen.getByLabelText("商品圖片"),
    new File(["image"], "product.png", { type: "image/png" }),
  );
  await user.type(screen.getByLabelText("價格（新台幣）"), "320");
  await user.type(screen.getByLabelText("庫存數量"), "7");
  await user.type(screen.getByLabelText("商品說明（選填）"), "測試說明");
}

describe("AdminProductFormPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    uploadProductImage.mockResolvedValue({ imageUrl: "/product-images/generated.png" });
  });

  it("送出空白新增表單時顯示必填錯誤並聚焦第一欄", async () => {
    const user = userEvent.setup();
    renderPage("/admin/products/new");

    await user.click(screen.getByRole("button", { name: "建立商品" }));

    expect(screen.getByText("請輸入商品名稱。")).toBeInTheDocument();
    expect(screen.getByText("請選擇商品分類。")).toBeInTheDocument();
    expect(screen.getByText("請選擇商品圖片。")).toBeInTheDocument();
    expect(screen.getByLabelText("商品名稱")).toHaveFocus();
    expect(createProduct).not.toHaveBeenCalled();
  });

  it("建立商品後導回管理列表", async () => {
    const user = userEvent.setup();
    createProduct.mockResolvedValue({ productId: 18, productName: "自動化測試商品" });
    renderPage("/admin/products/new");

    await fillProductForm(user);
    await user.click(screen.getByRole("button", { name: "建立商品" }));

    await waitFor(() => {
      expect(uploadProductImage).toHaveBeenCalledOnce();
      expect(createProduct).toHaveBeenCalledWith({
        productName: "自動化測試商品",
        category: "E_BOOK",
        imageUrl: "/product-images/generated.png",
        price: 320,
        stock: 7,
        description: "測試說明",
      });
    });
    expect(await screen.findByText("已返回商品管理")).toBeInTheDocument();
  });

  it("載入既有資料並儲存修改", async () => {
    const user = userEvent.setup();
    getProduct.mockResolvedValue({
      productId: 12,
      productName: "原商品",
      category: "FOOD",
      imageUrl: "https://example.com/original.jpg",
      price: 100,
      stock: 3,
      description: null,
    });
    updateProduct.mockResolvedValue({ productId: 12, productName: "更新商品" });
    renderPage("/admin/products/12/edit");

    const nameInput = await screen.findByDisplayValue("原商品");
    await user.clear(nameInput);
    await user.type(nameInput, "更新商品");
    await user.click(screen.getByRole("button", { name: "儲存變更" }));

    await waitFor(() => {
      expect(uploadProductImage).not.toHaveBeenCalled();
      expect(updateProduct).toHaveBeenCalledWith("12", {
        productName: "更新商品",
        category: "FOOD",
        imageUrl: "https://example.com/original.jpg",
        price: 100,
        stock: 3,
        description: null,
      });
    });
    expect(await screen.findByText("已返回商品管理")).toBeInTheDocument();
  });

  it("編輯既有商品時預覽與商城使用相同的本機圖片", async () => {
    getProduct.mockResolvedValue({
      productId: 12,
      productName: "car",
      category: "FOOD",
      imageUrl: "https://cdn.pixabay.com/photo/2014/02/01/17/28/apple-256261__480.jpg",
      price: 50000,
      stock: 3,
      description: "超快的車",
    });
    renderPage("/admin/products/12/edit");

    expect(await screen.findByRole("img", { name: "car" })).toHaveAttribute(
      "src",
      "/images/products/product-12-coral-city-car.png",
    );
  });
});
