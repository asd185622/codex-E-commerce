import { beforeEach, describe, expect, it, vi } from "vitest";
import apiClient from "./client";
import { getCsrfHeaders } from "./csrf";
import { getCurrentUser, loginUser, logoutUser, registerUser } from "./users";

vi.mock("./client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock("./csrf", () => ({
  getCsrfHeaders: vi.fn(),
}));

describe("會員 API", () => {
  const csrfHeaders = { "X-CSRF-TOKEN": "member-token" };

  beforeEach(() => {
    vi.clearAllMocks();
    getCsrfHeaders.mockResolvedValue(csrfHeaders);
  });

  it("以 form-urlencoded 與 CSRF 標頭登入", async () => {
    const member = { userId: 8, email: "member@example.com" };
    apiClient.post.mockResolvedValue({ data: member });

    await expect(loginUser({ email: member.email, password: "secret123" })).resolves.toEqual(member);

    const [, formData, config] = apiClient.post.mock.calls[0];
    expect(apiClient.post).toHaveBeenCalledOnce();
    expect(apiClient.post.mock.calls[0][0]).toBe("/users/login");
    expect(formData).toBeInstanceOf(URLSearchParams);
    expect(formData.get("email")).toBe(member.email);
    expect(formData.get("password")).toBe("secret123");
    expect(config).toEqual({
      headers: {
        ...csrfHeaders,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  });

  it("以 CSRF 標頭註冊會員", async () => {
    const credentials = { email: "new@example.com", password: "secret123" };
    apiClient.post.mockResolvedValue({ data: { userId: 9, email: credentials.email } });

    await registerUser(credentials);

    expect(apiClient.post).toHaveBeenCalledWith("/users/register", credentials, {
      headers: csrfHeaders,
    });
  });

  it("從後端 Session 取得目前會員", async () => {
    const member = { userId: 8, email: "member@example.com" };
    apiClient.get.mockResolvedValue({ data: member });

    await expect(getCurrentUser()).resolves.toEqual(member);
    expect(apiClient.get).toHaveBeenCalledWith("/users/me");
    expect(getCsrfHeaders).not.toHaveBeenCalled();
  });

  it("以 CSRF 標頭登出", async () => {
    apiClient.post.mockResolvedValue({});

    await logoutUser();

    expect(apiClient.post).toHaveBeenCalledWith("/users/logout", null, {
      headers: csrfHeaders,
    });
  });
});
