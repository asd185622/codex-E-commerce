import { describe, expect, it } from "vitest";
import { validateCredentials, validateProduct } from "./validation";

describe("validateCredentials", () => {
  it("接受格式正確的 Email 與密碼", () => {
    expect(validateCredentials(" member@example.com ", "secret123")).toEqual({});
  });

  it("回報空白與錯誤格式", () => {
    expect(validateCredentials("invalid-email", " ")).toEqual({
      email: "請輸入有效的 Email 格式。",
      password: "請輸入密碼。",
    });
  });
});

describe("validateProduct", () => {
  const validProduct = {
    productName: "測試商品",
    category: "E_BOOK",
    imageUrl: "https://example.com/product.jpg",
    price: "0",
    stock: "0",
    description: "",
  };

  it("接受價格與庫存為零的完整商品", () => {
    expect(validateProduct(validProduct)).toEqual({});
  });

  it("回報所有必填欄位", () => {
    expect(validateProduct({
      productName: " ",
      category: "",
      imageUrl: " ",
      price: "",
      stock: "",
    })).toEqual({
      productName: "請輸入商品名稱。",
      category: "請選擇商品分類。",
      imageUrl: "請輸入商品圖片網址。",
      price: "請輸入商品價格。",
      stock: "請輸入商品庫存。",
    });
  });

  it.each([
    ["price", "-1", "價格必須是大於或等於 0 的整數。"],
    ["price", "1.5", "價格必須是大於或等於 0 的整數。"],
    ["stock", "-1", "庫存必須是大於或等於 0 的整數。"],
    ["stock", "2.5", "庫存必須是大於或等於 0 的整數。"],
  ])("拒絕 %s 的非負整數以外數值", (field, value, message) => {
    expect(validateProduct({ ...validProduct, [field]: value })).toMatchObject({
      [field]: message,
    });
  });
});
