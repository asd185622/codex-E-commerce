# E-Commerce 開發狀態

> 更新日期：2026-07-26
> 專案目錄：`E-Commerce/`
> 用途：記錄目前實際完成度、尚未完成項目與已確認的範圍決策。
> 規格來源：功能與視覺基準仍以 [`frontend-design-plan.md`](./frontend-design-plan.md) 為主，本文件負責追蹤實作進度。

## 1. 目前摘要

目前已完成商城前台的主要消費者流程，包括首頁、商品列表、商品詳情、購物車、註冊、登入、後端 Session 還原、建立訂單與我的訂單。

Spring Boot 後端已導入 Spring Security、BCrypt、CSRF 與 Session，會員只能讀取或建立自己的訂單。RBAC 尚未建立，因此商品新增、修改與刪除目前仍沒有角色權限保護。

下一階段的主要缺口是「商品管理 Demo」，之後再整理圖片授權、補自動化瀏覽器測試與完整專案文件。

## 2. 已完成

### 2.1 前端基礎與共用架構

- [x] 使用 React、JavaScript、Vite、React Router、Axios、React Context 與一般 CSS。
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
| `*` | 已完成 | 404 頁面 |

### 2.3 商品與購物車

- [x] 串接 `GET /products` 與 `GET /products/{productId}`。
- [x] 將後端分類 `FOOD`、`CAR`、`E_BOOK` 轉成繁體中文顯示。
- [x] 商品圖片具有替代文字與載入失敗 fallback。
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

### 2.6 響應式與可用性基礎

- [x] 已建立桌面、平板與手機斷點。
- [x] 已加入鍵盤焦點樣式與 skip link。
- [x] 圖示按鈕、載入狀態與表單錯誤具備基本 ARIA 標記。
- [x] 支援 `prefers-reduced-motion`。
- [x] 目前完成頁面均具有適用的載入、錯誤、空資料或圖片失敗狀態。

### 2.7 已完成驗證

截至 2026-07-26，最近一次檢查結果：

| 檢查 | 結果 |
|---|---|
| `npm run lint` | 通過 |
| `npm run build` | 通過，Vite 成功產生正式建置 |
| `mvn test` | 通過，共 34 項測試，0 failures、0 errors |
| `git diff --check` | 通過，沒有空白或 conflict marker 錯誤 |
| 瀏覽器手動檢查 | 通過 `/orders` 未登入導向、購物袋登入導向與 390px 手機版；console 無 error／warning |

## 3. 尚未完成

### 3.1 商品管理 Demo

- [ ] 建立 `/admin/products` 商品管理列表。
- [ ] 建立 `/admin/products/new` 新增商品頁。
- [ ] 建立 `/admin/products/:id/edit` 修改商品頁。
- [ ] 在商品 API 模組加入 `POST`、`PUT` 與 `DELETE` 操作及 CSRF Token。
- [ ] 建立共用商品表單，驗證必填欄位、價格與庫存不可為負數。
- [ ] 刪除商品前顯示包含商品名稱的確認提示。
- [ ] 在頁尾提供清楚標示為「管理 Demo」的入口。
- [ ] 在介面揭露目前沒有 RBAC，不將前端隱藏視為安全控制。

### 3.2 圖片與內容授權

- [ ] 逐一確認正式商品圖片可合法使用。
- [ ] 記錄圖片來源、作者與授權頁面。
- [ ] 視授權條款決定是否保存本機副本，避免正式頁面依賴不穩定的外部連結。

### 3.3 測試與文件

- [ ] 為前端加入自動化測試；目前只有 lint 與 production build 驗證。
- [ ] 補齊登入、登出、Session 還原、購物車、結帳與訂單的瀏覽器整合測試。
- [ ] 補齊商品管理 Demo 的操作測試。
- [ ] 更新根目錄 `README.md`，加入前後端啟動方式、Session／CSRF 說明、資料庫重建方式與功能完成度。
- [ ] 所有功能完成後，重新進行桌面、平板、手機與鍵盤操作驗收。

## 4. 已確認的規格調整

以下項目是依頁面回饋主動移除，不列為待辦，也不應在未重新確認前補回：

- 首頁不顯示「依生活場景瀏覽／今天想找什麼？」分類區塊。
- 頁首導覽不顯示「食味」、「行旅」、「閱讀」三個分類連結。
- 商品分類功能仍保留在商品列表的篩選控制中。

## 5. 暫不實作

以下功能已確認不屬於目前階段：

- RBAC、管理員角色與角色資料表。
- JWT；目前維持 Spring Security Session。
- 舊 MD5 密碼相容或資料移轉。
- 真實金流、配送地址、優惠券、收藏、評論與第三方登入。
- 商品圖片上傳服務；商品管理先使用 `imageUrl`。
- Spring Boot Controller → Service → DAO 架構重整。

> 注意：RBAC 尚未完成前，商品新增、修改與刪除 API 不能視為真正的管理員功能。管理介面只能作為作品集 Demo。

## 6. 建議後續順序

1. 完成商品管理 Demo 與商品寫入 API 串接。
2. 補上訂單流程與商品管理 Demo 的自動化瀏覽器測試。
3. 整理圖片授權來源。
4. 更新 README 與完整啟動說明。
5. 進行手機版、無障礙與完整流程的最終驗收。

## 7. 本機開發指令

### 前端

```powershell
cd frontend
npm install
npm run dev
```

Vite 專案目前使用 `npm run dev`，`package.json` 沒有設定 `npm start`。

### 後端

```powershell
cd springboot-mall
mvn spring-boot:run
```

後端預設使用 `http://localhost:8080`，前端開發伺服器預設使用 `http://localhost:5173`。
