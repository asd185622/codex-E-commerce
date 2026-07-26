// 建立會員 Context；登入狀態以後端 session 為唯一來源。
import { createContext } from "react";

const UserContext = createContext(null);

export default UserContext;
