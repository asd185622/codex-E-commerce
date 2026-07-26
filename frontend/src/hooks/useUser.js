// 提供元件讀取會員 Context 的共用 Hook，並檢查 Provider 是否存在。
import { useContext } from "react";
import UserContext from "../context/user-context";

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser 必須在 UserProvider 內使用");
  }

  return context;
}
