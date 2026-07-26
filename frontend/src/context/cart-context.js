// 建立購物車 Context；實際狀態與操作由 CartProvider 提供。
import { createContext } from "react";

const CartContext = createContext(null);

export default CartContext;
