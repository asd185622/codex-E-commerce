import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { loginUser } from "../api/users";
import { useUser } from "../hooks/useUser";
import LoginPage from "./LoginPage";

vi.mock("../api/users", () => ({
  loginUser: vi.fn(),
}));

vi.mock("../hooks/useUser", () => ({
  useUser: vi.fn(),
}));

function renderLoginPage(state) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: "/login", state }]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/orders" element={<p>已導回我的訂單</p>} />
        <Route path="/" element={<p>商城首頁</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("LoginPage", () => {
  const setAuthenticatedUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useUser.mockReturnValue({
      user: null,
      isUserLoading: false,
      setAuthenticatedUser,
    });
  });

  it("阻止空白表單送出並聚焦 Email", async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.click(screen.getByRole("button", { name: "登入" }));

    expect(screen.getByText("請輸入 Email。")).toBeInTheDocument();
    expect(screen.getByText("請輸入密碼。")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveFocus();
    expect(loginUser).not.toHaveBeenCalled();
  });

  it("登入成功後保存會員並導回原頁", async () => {
    const user = userEvent.setup();
    const member = { userId: 8, email: "member@example.com" };
    loginUser.mockResolvedValue(member);
    renderLoginPage({
      from: "/orders",
      loginMessage: "請先登入，再查看你的訂單。",
    });

    expect(screen.getByText("請先登入，再查看你的訂單。")).toBeInTheDocument();
    await user.type(screen.getByLabelText("Email"), member.email);
    await user.type(screen.getByLabelText("密碼"), "secret123");
    await user.click(screen.getByRole("button", { name: "登入" }));

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith({
        email: member.email,
        password: "secret123",
      });
    });
    expect(setAuthenticatedUser).toHaveBeenCalledWith(member);
    expect(await screen.findByText("已導回我的訂單")).toBeInTheDocument();
  });

  it("登入失敗時顯示可理解的錯誤", async () => {
    const user = userEvent.setup();
    loginUser.mockRejectedValue({ response: { status: 401 } });
    renderLoginPage();

    await user.type(screen.getByLabelText("Email"), "member@example.com");
    await user.type(screen.getByLabelText("密碼"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "登入" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Email 或密碼不正確，請重新確認後再登入。",
    );
    expect(setAuthenticatedUser).not.toHaveBeenCalled();
  });
});
