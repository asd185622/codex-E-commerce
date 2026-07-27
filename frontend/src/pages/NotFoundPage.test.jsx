import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import NotFoundPage from "./NotFoundPage";

describe("NotFoundPage", () => {
  it("以頁面主標題說明 404 狀態並提供返回首頁入口", () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { level: 1, name: "這個頁面不存在" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "返回拾物首頁" })).toHaveAttribute("href", "/");
  });
});
