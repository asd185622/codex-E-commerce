import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";
import AdminLayout from "./AdminLayout";
import StoreLayout from "./StoreLayout";

vi.mock("../components/SiteHeader", () => ({
  default: () => <header>商城頁首</header>,
}));

vi.mock("../components/SiteFooter", () => ({
  default: () => <footer>商城頁尾</footer>,
}));

vi.mock("../components/ScrollToTop", () => ({
  default: () => null,
}));

function renderLayout(path, element) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={element}>
          <Route path={path} element={<p>主要內容</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("共用版面 skip link", () => {
  it("讓商城主要內容可以由 skip link 取得焦點", () => {
    renderLayout("/products", <StoreLayout />);

    expect(screen.getByRole("link", { name: "跳至主要內容" })).toHaveAttribute(
      "href",
      "#main-content",
    );
    expect(screen.getByRole("main")).toHaveAttribute("tabindex", "-1");
  });

  it("讓管理 Demo 主要內容可以由 skip link 取得焦點", () => {
    renderLayout("/admin/products", <AdminLayout />);

    expect(screen.getByRole("link", { name: "跳至主要內容" })).toHaveAttribute(
      "href",
      "#admin-main-content",
    );
    expect(screen.getByRole("main")).toHaveAttribute("tabindex", "-1");
  });
});
