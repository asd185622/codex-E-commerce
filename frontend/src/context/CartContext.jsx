// 管理全站購物車狀態，並同步保存到瀏覽器 localStorage。
import { useState } from "react";
import CartContext from "./cart-context";

const STORAGE_KEY = "shiwu-cart";

function readStoredCart() {
  // localStorage 可能含有損壞資料，因此解析失敗時回到空購物車。
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY);
    return storedValue ? JSON.parse(storedValue) : [];
  } catch {
    return [];
  }
}

function CartProvider({ children }) {
  const [items, setItems] = useState(readStoredCart);

  function updateItems(nextItems) {
    // 讓 React 狀態與瀏覽器保存內容維持一致。
    setItems(nextItems);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
  }

  function addItem(product, quantity) {
    // 相同商品再次加入時累加數量，並限制不可超過目前庫存。
    const existingItem = items.find((item) => item.productId === product.productId);
    const nextItems = existingItem
      ? items.map((item) =>
          item.productId === product.productId
            ? {
                ...item,
                quantity: Math.min(item.quantity + quantity, product.stock),
                stock: product.stock,
              }
            : item,
        )
      : [
          ...items,
          {
            productId: product.productId,
            productName: product.productName,
            imageUrl: product.imageUrl,
            price: product.price,
            stock: product.stock,
            quantity,
          },
        ];

    updateItems(nextItems);
  }

  function setItemQuantity(productId, quantity) {
    // 使用者調整數量時，保持在 1 到商品庫存之間。
    updateItems(
      items.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) }
          : item,
      ),
    );
  }

  function removeItem(productId) {
    // 依商品編號移除指定購物車項目。
    updateItems(items.filter((item) => item.productId !== productId));
  }

  function clearCart() {
    // 訂單成功建立後，同步清除 React 狀態與保存的購物袋內容。
    updateItems([]);
  }

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  const value = { items, itemCount, subtotal, addItem, setItemQuantity, removeItem, clearCart };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export default CartProvider;
