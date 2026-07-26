---
name: ecommerce-project-guardrails
description: Safely plan, build, document, test, or debug this E-Commerce project while preserving its React frontend and Spring Boot backend boundaries. Use for work involving frontend/**, springboot-mall/**, API integration, Spring Security Session and CSRF, database changes, repository setup, or project progress documentation.
---

# E-Commerce Project Guardrails

## 開始工作

1. 將 repository 根目錄視為工作範圍，固定使用 `frontend/` 作為前端、`springboot-mall/` 作為後端、`docs/` 作為規格與進度文件目錄。
2. 先唯讀檢查相關檔案與工作樹，保留使用者尚未提交的修改。Git 遇到 ownership 警告時，使用：

   ```powershell
   git -c safe.directory="C:/Users/user/Desktop/E-commerce/E-Commerce" status --short
   ```

3. 進行前端設計、規劃、實作或 API 串接前，完整閱讀：
   - `docs/frontend-design-plan.md`：目標功能、視覺、API 與驗收標準。
   - `docs/development-status.md`：已完成、待完成、已移除與暫緩項目。
4. 以使用者當次指示為最高優先，並以實際程式碼與測試判斷目前行為。若使用者改變既有決策，完成實作後同步更新相關文件。

## 嚴格保護後端

將以下路徑視為「受保護的後端範圍」：

- `springboot-mall/**`
- 其他位於 repository 內、會影響 Spring Boot 建置或行為的檔案，例如 Maven、資料庫、測試、環境設定、Docker、CI 或共用設定

不要將 `springboot-mall/` 搬移、重新命名或包進 `backend/`。保留既有 Controller → Service → DAO 分層，除非使用者明確要求架構重整。

可直接進行唯讀分析、搜尋、API 契約盤點及既有測試。一般 build/test 產生的 `target/` 輸出不視為後端原始碼變更。任何會新增、修改、搬移、重新命名或刪除受保護原始碼與設定的操作，都必須先：

1. 說明為什麼需要後端變更。
2. 列出預計異動的確切檔案或路徑。
3. 摘要每項變更、可能影響與驗證方式。
4. 提供不修改後端的可行替代方案；若沒有，清楚說明原因。
5. 等待使用者明確同意後才執行。

將同意視為只涵蓋當次列出的範圍。若當次要求已明確指定檔案與操作，將它視為該次範圍的同意，不要重複詢問，也不要把同意擴張到其他檔案。不得因為變更很小、能修好錯誤、方便前端串接或屬於設定檔，就略過確認。

提出確認時使用精簡格式：

```text
需要修改後端
- 原因：
- 檔案：
- 預計變更：
- 影響：
- 不改後端的替代方案：
- 驗證方式：

是否同意以上範圍？
```

刪除或重建資料前，另行列出資料庫、資料表與預計保留的資料並取得明確同意。不要沿用先前一次性的清除授權。

## 以前端優先完成需求

- 將 `docs/frontend-design-plan.md` 視為目標規格，將 `docs/development-status.md` 視為實作進度；若兩者與程式現況不一致，先查證再更新文件。
- 將一般前端實作限制在 `frontend/`。
- 使用 React + JavaScript、Vite、React Router、Axios、React Context、一般 CSS 與 `localStorage`；不要自行改成 TypeScript、Redux 或大型 UI 框架。
- 使用 `npm run dev` 啟動 Vite；目前沒有 `npm start` script。
- 為新增程式檔與重要流程加入精簡、實用的繁體中文註解，避免逐行重述程式碼。
- 不要在 `springboot-mall/` 內建立前端檔案，也不要建立 `backend/` 目錄。
- 從 Controller、DTO、Model 與既有測試唯讀整理實際 API 契約，不憑想像新增 endpoint 或欄位。
- 優先在前端處理顯示格式、狀態管理、API client、環境變數、開發代理與錯誤呈現。
- 若遇到 CORS、驗證、資料格式或 endpoint 不相容，先說明證據與前端可行方案。只有確實需要後端修改時，才依「嚴格保護後端」流程請求確認。
- 不得默默修改 Controller、Service、DAO、DTO、Model、測試、`pom.xml` 或 `application.properties` 來配合前端。
- 使用可合法使用的商品圖片，保留來源、作者與授權紀錄，不直接採用搜尋縮圖網址。
- 尊重 `docs/development-status.md` 中已確認移除的 UI；未重新取得指示前，不把它們當成待辦補回。

## 遵守目前驗證架構

- 保留現有 Spring Security Session、BCrypt 與 CSRF 架構；除非使用者重新要求，否則不要改成 JWT。
- 由 `/users/me` 還原會員身分，不把會員身分當成可信資料保存於 `localStorage`。
- 讓所有改變伺服器狀態的前端請求依目前 Security 設定攜帶 CSRF Token。
- 維持訂單 API 的 Session 會員比對，不允許以前端傳入的 `userId` 單獨決定資料權限。
- 將 RBAC 視為已確認暫緩項目。商品管理頁只能標示為「管理 Demo」，不可宣稱前端隱藏路由或按鈕等同真正授權。
- 若日後加入角色、管理員權限或資料表欄位，將它視為新的後端與資料庫變更，重新取得同意。

## 固定目錄結構

維持以下結構：

```text
E-Commerce/
├── springboot-mall/  # 既有 Spring Boot 後端
├── frontend/         # AI 協助開發的前端
├── docs/             # 前端設計與實作規格
├── .agents/
└── README.md
```

- 不因建立前端而搬動或重新命名後端。
- 若新增根目錄設定、Docker、CI 或 README 內容可能影響後端指令，先說明影響；實際修改後端相關設定前仍需取得確認。
- 使用 `springboot-mall/` 作為 Maven 指令與後端工具的工作目錄，使用 `frontend/` 作為前端指令的工作目錄。

## 驗證與交付

- 前端變更至少執行適用的 `npm run lint` 與 `npm run build`。
- 後端原始碼、設定或 API 整合有變動時，在 `springboot-mall/` 執行 `mvn test`。
- 視功能風險以瀏覽器驗證桌面、手機、Session、錯誤狀態與核心操作流程。
- 只有實際執行成功的檢查才能宣稱通過；若無法執行，說明原因。
- 完成實質功能後更新 `docs/development-status.md`，同步完成項目、剩餘工作與最新驗證結果。
- 完成後逐檔列出變更，並清楚區分前端變更與經確認的後端變更。
- 若本次沒有動到受保護後端，明確說明「Spring Boot 後端未修改」。
