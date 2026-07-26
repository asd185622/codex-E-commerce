import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCurrentUser, logoutUser } from "../api/users";
import { useUser } from "../hooks/useUser";
import UserProvider from "./UserContext";

vi.mock("../api/users", () => ({
  getCurrentUser: vi.fn(),
  logoutUser: vi.fn(),
}));

function UserStateProbe() {
  const { user, isUserLoading, logout } = useUser();
  const [logoutError, setLogoutError] = useState("");

  async function handleLogout() {
    try {
      await logout();
    } catch {
      setLogoutError("登出失敗");
    }
  }

  if (isUserLoading) return <p>會員載入中</p>;

  return (
    <div>
      <p>{user ? user.email : "訪客"}</p>
      {user ? <button type="button" onClick={handleLogout}>測試登出</button> : null}
      {logoutError ? <p role="alert">{logoutError}</p> : null}
    </div>
  );
}

function renderUserProvider() {
  return render(
    <UserProvider>
      <UserStateProbe />
    </UserProvider>,
  );
}

describe("UserProvider", () => {
  const member = { userId: 8, email: "member@example.com", password: "不應保留" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("啟動時由後端 Session 還原會員", async () => {
    getCurrentUser.mockResolvedValue(member);

    renderUserProvider();

    expect(screen.getByText("會員載入中")).toBeInTheDocument();
    expect(await screen.findByText(member.email)).toBeInTheDocument();
    expect(getCurrentUser).toHaveBeenCalledOnce();
  });

  it("Session 無效時回到訪客狀態", async () => {
    getCurrentUser.mockRejectedValue({ response: { status: 401 } });

    renderUserProvider();

    expect(await screen.findByText("訪客")).toBeInTheDocument();
  });

  it("後端登出成功後才清除會員", async () => {
    const user = userEvent.setup();
    getCurrentUser.mockResolvedValue(member);
    logoutUser.mockResolvedValue();
    renderUserProvider();

    await user.click(await screen.findByRole("button", { name: "測試登出" }));

    expect(logoutUser).toHaveBeenCalledOnce();
    expect(await screen.findByText("訪客")).toBeInTheDocument();
  });

  it("後端登出失敗時保留目前會員", async () => {
    const user = userEvent.setup();
    getCurrentUser.mockResolvedValue(member);
    logoutUser.mockRejectedValue(new Error("logout failed"));
    renderUserProvider();

    await user.click(await screen.findByRole("button", { name: "測試登出" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("登出失敗");
    await waitFor(() => expect(screen.getByText(member.email)).toBeInTheDocument());
  });
});
