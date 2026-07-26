# E-Commerce 開發狀態

> 更新日期：2026-07-26
> 專案目錄：`E-Commerce/`
> 用途：記錄目前實際完成度、尚未完成項目與已確認的範圍決策。
> 規格來源：功能與視覺基準仍以 [`frontend-design-plan.md`](./frontend-design-plan.md) 為主，本文件負責追蹤實作進度。

## 0. 開發與提交規則

- 每完成一個可獨立驗收的功能，就建立一個對應的 Git commit，不把不相關功能混在同一個 commit。
- commit 前同步更新本文件，勾選完成項目、調整剩餘工作並記錄實際執行的驗證。
- 前端功能至少通過 `npm run lint` 與 `npm run build`；依風險補瀏覽器流程與響應式驗證。
- 任何後端原始碼或設定變更仍需事前列出範圍並取得確認。

## 1. 目前摘要

目前已完成商城前台的主要消費者流程，包括首頁、商品列表、商品詳情、購物車、註冊、登入、後端 Session 還原、建立訂單與我的訂單，也已完成商品管理 Demo 的列表、新增、修改與刪除流程。

Spring Boot 後端已導入 Spring Security、BCrypt、CSRF 與 Session，會員只能讀取或建立自己的訂單。依 2026-07-26 的決策，本專案不實作 RBAC，因此商品新增、修改與刪除仍沒有角色權限保護，管理介面只作為作品集 Demo。

商品圖片替換與本機化已完成；下一階段主要是最後的跨瀏覽器、響應式、鍵盤與完整流程驗收。

### 里程碑總覽

| 領域 | 狀態 | 說明 |
|---|---|---|
| 前端基礎與共用架構 | 已完成 | Vite、React Router 8、Axios、Context、共用版面與狀態元件 |
| 商品瀏覽 | 已完成 | 首頁、列表、搜尋、分類、排序、分頁與商品詳情 |
| 購物與結帳 | 已完成 | 購物車保存、庫存重查、登入導向與建立訂單 |
| 會員與 Session | 已完成 | 註冊、登入、登出、Session 還原與 CSRF |
| 訂單 | 已完成 | 建立訂單、會員資料隔離與我的訂單 |
| 商品管理 Demo | 已完成 | 列表、新增、修改、刪除、表單驗證與無 RBAC 揭露 |
| 響應式與可用性 | 已完成 | 1440px、768px、390px 的 11 條主要路由皆無水平溢位，焦點與 ARIA 基礎已驗證 |
| 圖片與內容授權 | 已完成（前端） | 已建立 8 張原創本機圖，依舊 CDN 網址在前端替換顯示；後端資料未修改 |
| 前端自動化測試 | 核心完成 | 商品管理、會員、購物車、結帳與訂單列表皆有 jsdom 自動化測試 |
| 前端相依性安全 | 已完成（正式環境） | React Router 已升級至 8.3.0；正式環境 0 項漏洞，開發工具依目前決策不升級 |
| README 與交付文件 | 已完成 | 已補齊前後端啟動、安全機制、資料庫重建、API、驗證方式與功能限制 |

## 2. 已完成

### 2.1 前端基礎與共用架構

- [x] 使用 React、JavaScript、Vite、React Router 8、Axios、React Context 與一般 CSS。
- [x] 前端位於 `frontend/`，後端維持在 `springboot-mall/`。
- [x] Vite proxy 將前端 API 請求轉送到 `http://localhost:8080`。
- [x] Axios client 集中管理 API base URL、逾時與 Cookie 傳送。
- [x] 建立商品、會員、訂單與 CSRF API 模組。
- [x] 建立購物車與會員 Context，以及對應的自訂 Hooks。
- [x] 建立共用頁首、頁尾、商品卡、圖片 fallback、載入骨架與狀態提示元件。
- [x] 前端與本次新增的後端程式檔已加入繁體中文註解。

### 2.2 已完成頁面與路由

| 路由 | 狀態 | 已完成內容 |
|---|---|---|
| `/` | 已完成 | 主打商品、最新商品、載入／空資料／錯誤狀態 |
| `/products` | 已完成 | 搜尋、分類篩選、排序、分頁與 URL 查詢參數同步 |
| `/products/:productId` | 已完成 | 商品詳情、庫存與數量限制、加入購物車、找不到商品狀態 |
| `/cart` | 已完成 | 顯示商品、調整數量、移除商品、localStorage、金額摘要、最新商品／庫存檢查與建立訂單 |
| `/login` | 已完成 | Spring Security 表單登入、CSRF、錯誤提示與登入後導回 |
| `/register` | 已完成 | Email／密碼驗證、CSRF、註冊成功提示 |
| `/orders` | 已完成 | Session 保護、訂單明細、建立成功提示、載入／空資料／錯誤與分頁狀態 |
| `/admin/products` | 已完成 | 管理 Demo 列表、搜尋、分類、排序、分頁與刪除確認 |
| `/admin/products/new` | 已完成 | 共用商品表單、欄位驗證、CSRF 新增與商品預覽 |
| `/admin/products/:productId/edit` | 已完成 | 載入既有商品、共用表單、CSRF 更新與找不到商品狀態 |
| `*` | 已完成 | 404 頁面 |

### 2.3 商品與購物車

- [x] 串接 `GET /products` 與 `GET /products/{productId}`。
- [x] 將後端分類 `FOOD`、`CAR`、`E_BOOK` 轉成繁體中文顯示。
- [x] 商品圖片具有替代文字與載入失敗 fallback。
- [x] 既有 8 張商品圖已替換為專案內的原創素材，商城、購物車、訂單與管理列表不再熱連結舊 CDN。
- [x] 售罄商品不可加入購物車。
- [x] 購買數量限制在 1 到目前商品庫存之間。
- [x] 相同商品重複加入時合併數量。
- [x] 購物車保存於 `localStorage`，重新整理後仍可還原。

### 2.4 會員驗證與安全性

- [x] Spring Security 已加入後端。
- [x] 使用 BCrypt 儲存與驗證新會員密碼。
- [x] 使用伺服器端 Session 維持登入，Session cookie 名稱為 `SHIWU_SESSION`。
- [x] Session timeout 設為 30 分鐘，cookie 使用 HttpOnly 與 SameSite=Lax。
- [x] 提供 `GET /csrf` 讓前端取得 CSRF Token。
- [x] 提供 `POST /users/login` 與 `POST /users/logout`。
- [x] 提供 `GET /users/me`，讓前端重新整理後還原會員狀態。
- [x] 註冊、登入與登出流程已在前端串接 CSRF。
- [x] `/users/{userId}/orders` 需要登入，且後端會比對 Session 會員編號，避免跨會員讀寫訂單。
- [x] 已依採用 BCrypt 的決策清除舊的 `users`、`order`、`order_item` 開發資料；會員需重新註冊。

### 2.5 訂單流程

- [x] 建立 `frontend/src/api/orders.js`，集中封裝建立與查詢訂單 API。
- [x] 結帳前並行重新查詢購物袋商品，確認商品仍存在、未售罄且數量未超過最新庫存。
- [x] 未登入或 Session 過期時導向登入，登入成功後可回到原本的購物袋或訂單頁。
- [x] 串接 `POST /users/{userId}/orders`，並為請求加入 CSRF Token。
- [x] 訂單成功後清空購物袋，導向 `/orders` 顯示訂單編號與成立結果。
- [x] 串接 `GET /users/{userId}/orders`，顯示訂單商品、數量、金額、成立時間與分頁。

### 2.6 商品管理 Demo

- [x] 建立 `/admin/products` 商品管理列表與 URL 驅動的搜尋、分類、排序及分頁。
- [x] 建立 `/admin/products/new` 與 `/admin/products/:productId/edit` 頁面。
- [x] 在商品 API 模組加入具 CSRF Token 的 `POST`、`PUT` 與 `DELETE` 操作。
- [x] 新增與修改共用商品表單，驗證必填欄位、價格與庫存為非負整數。
- [x] 刪除前顯示包含商品名稱與不可復原警告的確認提示。
- [x] 在頁尾加入「管理 Demo」入口，管理版面持續揭露本專案沒有 RBAC。
- [x] 管理列表與表單包含載入、錯誤、空資料、成功回饋及送出中狀態。

### 2.7 響應式與可用性基礎

- [x] 已建立桌面、平板與手機斷點。
- [x] 已加入鍵盤焦點樣式與 skip link。
- [x] 商城與管理 Demo 的 skip link 會將焦點移至可聚焦的主要內容區，讓鍵盤使用者略過重複導覽。
- [x] 圖示按鈕、載入狀態與表單錯誤具備基本 ARIA 標記。
- [x] 404 頁使用唯一的頁面 `<h1>`，保留清楚的文件標題層級。
- [x] 支援 `prefers-reduced-motion`。
- [x] 目前完成頁面均具有適用的載入、錯誤、空資料或圖片失敗狀態。
- [x] 修正 768px 平板寬度下商品篩選列因第一欄最小內容寬度造成的水平溢位。

### 2.8 已完成驗證

截至 2026-07-26，最近一次檢查結果：

| 檢查 | 結果 |
|---|---|
| `npm run lint` | 通過 |
| `npm run build` | 通過，Vite 成功產生正式建置 |
| `npm test` | 通過，14 個測試檔、52 個測試案例 |
| `npm audit --omit=dev` | 通過，正式環境相依性 0 項漏洞 |
| `npm audit` | React Router 公告已排除；剩餘 5 項 high 皆位於 ESLint／minimatch 開發工具相依路徑 |
| `mvn test` | 通過，共 34 項測試，0 failures、0 errors |
| `git diff --check` | 通過，沒有空白或 conflict marker 錯誤 |
| 瀏覽器手動檢查 | 1440px、768px、390px 下 11 條主要路由皆無水平溢位；本機商品圖正常且正式顯示頁未載入舊 CDN；商品加入購物袋、未登入導向、註冊、登入、Session 還原與 skip link 目標焦點通過，console 無 error／warning；建立測試訂單尚待確認 |

### 2.9 前端自動化測試基礎

- [x] 導入 Vitest、React Testing Library、jest-dom、user-event 與 jsdom。
- [x] 提供 `npm test` 單次執行及 `npm run test:watch` 開發監看指令。
- [x] 測試會員與商品表單驗證規則，包括價格、庫存必須為非負整數。
- [x] 測試商品查詢及新增、修改、刪除 API，確認寫入操作會附帶 CSRF 標頭。
- [x] 測試商品管理新增、編輯與刪除操作，以及必填錯誤後的欄位聚焦。
- [x] 測試會員 API 的表單登入格式、註冊與登出 CSRF，以及 `/users/me` Session 查詢。
- [x] 測試登入成功導回、登入失敗訊息、Session 還原與失效，以及登出成功／失敗的會員狀態。
- [x] 測試購物車 localStorage 還原、損壞資料 fallback、相同商品合併、數量限制、移除與清空。
- [x] 測試訂單 API 的 CSRF 建立請求與訂單列表分頁查詢參數。
- [x] 測試未登入結帳導向、商品下架、庫存不足、成功建立訂單與 Session 過期流程。
- [x] 測試我的訂單頁會員確認、未登入導向、載入、空資料、訂單內容、成功提示與分頁。
- [x] 測試訂單列表 API 錯誤重試及 401 Session 過期時清除會員狀態。
- [x] 測試商城／管理 Demo 的 skip link 目標可聚焦，以及 404 頁具有頁面主標題與返回入口。

## 3. 尚未完成

### 3.1 圖片與內容授權

- [x] 盤點本機後端目前 8 筆商品的圖片 URL、內容適配性與外部連結風險。
- [x] 建立 [`product-image-licenses.md`](./product-image-licenses.md)，記錄可查得的來源、作者、授權依據、查核缺口與替換優先順序。
- [x] 查核 Pixabay 最新官方授權摘要與服務條款，確認品牌／商標、誤導用途與第三方權利限制。
- [x] 建立 8 張內容相符的原創替換圖；汽車素材採無標誌、無車牌、無人物的通用造型。
- [x] 保存本機副本，並以舊 CDN 完整網址建立前端顯示對照，避免正式頁面依賴外部熱連結。
- [x] 保留後端原始 `imageUrl` 與管理表單輸入值；本次不修改 Spring Boot 或資料庫。

### 3.2 文件與最終驗收

- [x] 更新根目錄 `README.md`，加入前後端啟動方式、Session／CSRF 說明、資料庫重建方式、API 摘要、驗證指令與功能完成度。
- [x] 連接本機後端完成 1440px、768px、390px 的 11 條主要路由與 skip link 焦點驗收。
- [ ] 建立一筆本機測試訂單，確認購物袋送出、訂單成功訊息與我的訂單內容後完成最終驗收。

### 3.3 相依性維護

- [x] React Router 由 7.18.1 升級至 8.3.0，移除 `react-router-dom` 並改由 `react-router` 匯入；本機 Node 24.15.0 與 React 19.2.8 符合版本需求。
- [x] React Router 升級後重新執行正式環境 audit、test、lint、build 與商品列表／購物袋／管理 Demo 核心瀏覽器路由；均通過。
- [x] 依 2026-07-26 決策，ESLint 與其開發工具相依性維持目前可正常執行的版本，不進行主要版本升級；正式環境相依性仍維持 0 項漏洞。

## 4. 已確認的規格調整

以下項目是依頁面回饋主動移除，不列為待辦，也不應在未重新確認前補回：

- 首頁不顯示「依生活場景瀏覽／今天想找什麼？」分類區塊。
- 頁首導覽不顯示「食味」、「行旅」、「閱讀」三個分類連結。
- 商品分類功能仍保留在商品列表的篩選控制中。

## 5. 暫不實作

以下功能已確認不屬於目前階段：

- RBAC、管理員角色與角色資料表；2026-07-26 再次確認本專案不實作。
- JWT；目前維持 Spring Security Session。
- 舊 MD5 密碼相容或資料移轉。
- 真實金流、配送地址、優惠券、收藏、評論與第三方登入。
- 商品圖片上傳服務；商品管理先使用 `imageUrl`。
- Spring Boot Controller → Service → DAO 架構重整。
- ESLint 10 與只為排除 dev-only audit 警告的開發工具主要版本升級；目前 lint、test 與 build 均可正常執行。

> 注意：本專案不實作 RBAC，商品新增、修改與刪除 API 不能視為真正的管理員功能。管理介面只能作為作品集 Demo。

## 6. 建議後續順序

1. 取得建立本機測試訂單的確認後，完成訂單送出與我的訂單頁最終驗收。

## 7. 本機開發指令

### 前端

```powershell
cd frontend
npm install
npm run dev
npm test
```

Vite 專案目前使用 `npm run dev`，`package.json` 沒有設定 `npm start`；`npm test` 會使用 Vitest 單次執行全部前端測試。

### 後端

```powershell
cd springboot-mall
mvn spring-boot:run
```

後端預設使用 `http://localhost:8080`，前端開發伺服器預設使用 `http://localhost:5173`。
