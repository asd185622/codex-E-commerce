// 統一載入 DOM 斷言，並在每個測試後清理 React 渲染結果。
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});
