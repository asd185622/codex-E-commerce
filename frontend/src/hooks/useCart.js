// 提供元件讀取購物車 Context 的共用 Hook，並檢查 Provider 是否存在。
import { useContext } from "react";
import CartContext from "../context/cart-context";

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart 必須在 CartProvider 內使用");
  }

  return context;
}
