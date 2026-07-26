// 管理全站會員狀態，負責從後端 session 還原會員並執行登出。
import { useCallback, useEffect, useMemo, useState } from "react";
import { getCurrentUser, logoutUser } from "../api/users";
import UserContext from "./user-context";

function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  useEffect(() => {
    // 元件卸載後停止更新狀態，避免非同步請求造成無效更新。
    let isActive = true;

    async function restoreSession() {
      // 頁面重新整理時，以 /users/me 的結果判斷目前是否仍登入。
      try {
        const currentUser = await getCurrentUser();
        if (isActive) setUser(currentUser);
      } catch {
        if (isActive) setUser(null);
      } finally {
        if (isActive) setIsUserLoading(false);
      }
    }

    restoreSession();

    return () => {
      isActive = false;
    };
  }, []);

  const setAuthenticatedUser = useCallback((userData) => {
    // 登入成功後只保留畫面需要的會員編號與 Email。
    setUser({
      userId: userData.userId,
      email: userData.email,
    });
  }, []);

  const logout = useCallback(async () => {
    // 只有後端成功清除 session 後，前端才移除會員狀態。
    await logoutUser();
    setUser(null);
  }, []);

  const clearAuthenticatedUser = useCallback(() => {
    // 後端回覆 session 已失效時，立即清除畫面上的過期會員狀態。
    setUser(null);
  }, []);

  const value = useMemo(
    // 固定 Context value 的參考，減少消費元件不必要的重新渲染。
    () => ({ user, isUserLoading, setAuthenticatedUser, clearAuthenticatedUser, logout }),
    [user, isUserLoading, setAuthenticatedUser, clearAuthenticatedUser, logout],
  );

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export default UserProvider;
