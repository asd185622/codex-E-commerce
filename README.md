# 拾物 SHIWU E-Commerce

以 Spring Boot REST API 為核心、React 為操作介面的電商作品集。專案涵蓋商品瀏覽、會員 Session、購物車、訂單與商品管理 Demo，並刻意維持容易閱讀的前後端結構。

> 商品管理功能是 API 操作展示，不是正式後台。本專案依目前決策不實作 RBAC，因此商品新增、修改與刪除端點沒有管理員角色保護。

## 功能

### 消費者流程

- 首頁主打與最新商品
- 商品搜尋、分類、排序與分頁
- 商品詳情、庫存限制與售罄狀態
- `localStorage` 購物袋、數量調整與金額摘要
- 會員註冊、登入、登出與 Session 還原
- 結帳前重新檢查商品、價格與庫存
- 建立訂單與查看自己的訂單紀錄

### 商品管理 Demo

- 商品列表、搜尋、分類、排序與分頁
- 新增、修改與刪除商品
- 表單驗證、圖片預覽與操作狀態回饋
- CSRF 保護的寫入請求
- 介面持續揭露「未實作 RBAC」限制

## 技術架構

| 範圍 | 技術 |
|---|---|
| 前端 | React 19、JavaScript、Vite、React Router 8、Axios、React Context、Vitest |
| 後端 | Java 17、Spring Boot 4.0.6、Spring MVC、Spring Security、Spring JDBC、Maven |
| 資料庫 | MySQL；後端測試使用 H2 in-memory database |
| 驗證 | Spring Security Session、BCrypt、CSRF |

```text
瀏覽器（http://localhost:5173）
        │
        │ /api/*，Vite proxy 會移除 /api
        ▼
Spring Boot（http://localhost:8080）
        │
        ▼
MySQL（localhost:3306 / mall）
```

## 專案結構

```text
E-Commerce/
├── frontend/          # React 商城前台與商品管理 Demo
├── springboot-mall/   # Spring Boot API
├── docs/              # 設計規格、開發進度與圖片授權清冊
├── .agents/           # 專案開發 guardrails
└── README.md
```

詳細規格與進度：

- [前端設計與實作規格](docs/frontend-design-plan.md)
- [目前開發狀態](docs/development-status.md)
- [商品圖片授權清冊](docs/product-image-licenses.md)

## 環境需求

- Node.js `22.22.0` 以上（React Router 8 的最低需求）
- npm
- JDK 17
- Maven
- MySQL 8

目前沒有 Docker Compose 或 Maven Wrapper，請先在本機安裝上述工具。

## 本機啟動

### 1. 取得專案

```powershell
git clone https://github.com/asd185622/codex-E-commerce.git
cd codex-E-commerce
```

### 2. 建立 MySQL 資料庫

先建立名稱為 `mall` 的 UTF-8 資料庫：

```sql
CREATE DATABASE mall
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

接著在 MySQL Workbench 或其他資料庫工具中，對 `mall` 執行 [測試用資料表定義](springboot-mall/src/test/resources/schema.sql)。這份檔案可建立目前 API 需要的四張資料表：

- `product`
- `users`
- `order`
- `order_item`

> `schema.sql` 開頭包含 `DROP TABLE IF EXISTS`，會刪除同名資料表與其中資料。只能用於全新資料庫或確定要重建的本機開發資料庫。`data.sql` 是自動化測試資料，不建議匯入一般開發資料庫。

目前專案尚未導入 Flyway 或 Liquibase，正式環境應改用版本化 migration，不應直接使用測試 schema 重建資料。

### 3. 設定並啟動後端

確認 [application.properties](springboot-mall/src/main/resources/application.properties) 的 MySQL 位址、帳號與密碼符合本機環境。不要將真實或正式環境密碼提交到 Git。

```powershell
cd springboot-mall
mvn spring-boot:run
```

後端預設啟動於 `http://localhost:8080`。

### 4. 啟動前端

另開一個 PowerShell 視窗：

```powershell
cd frontend
npm install
npm run dev
```

前端預設啟動於 `http://localhost:5173`。開發伺服器會把 `/api/*` 代理到 `http://localhost:8080/*`，因此應先啟動後端。

## 驗證與測試

### 前端

```powershell
cd frontend
npm test
npm run lint
npm run build
```

- `npm test`：Vitest 單次執行測試
- `npm run lint`：ESLint 靜態檢查
- `npm run build`：產生正式前端建置到 `frontend/dist/`
- `npm run test:watch`：開發時持續監看測試
- `npm run preview`：預覽已建置的前端

### 後端

```powershell
cd springboot-mall
mvn test
```

後端測試使用 H2 記憶體資料庫及 `src/test/resources` 下的 schema／測試資料，不會連線或寫入本機 MySQL `mall` 資料庫。

目前已驗證：

- 前端 11 個測試檔、46 個測試案例通過
- 前端 lint 與正式建置通過
- 後端 34 個測試通過
- 正式環境 npm 相依性 0 項已知漏洞

## Session、CSRF 與權限界線

- 登入狀態保存在伺服器端 Session，瀏覽器 Cookie 名稱為 `SHIWU_SESSION`。
- Session 有效時間為 30 分鐘，Cookie 使用 HttpOnly 與 SameSite=Lax。
- 密碼使用 BCrypt 雜湊；會員身分不保存在 `localStorage`。
- 前端啟動時透過 `GET /users/me` 還原會員資料。
- 非 GET 請求會先由 `GET /csrf` 取得 CSRF token，再使用後端指定的 header 送出。
- 訂單端點會比對 URL 中的 `userId` 與目前 Session 會員，避免跨會員讀寫訂單。
- 本專案不實作 RBAC。商品管理路由及寫入 API 只能作為 Demo，不能視為正式管理員授權。

## API 摘要

後端端點沒有 `/api` 前綴；`/api` 只存在於前端開發代理。

| 方法 | 路徑 | 用途 | 登入需求 |
|---|---|---|---|
| `GET` | `/products` | 商品列表、搜尋、分類、排序與分頁 | 否 |
| `GET` | `/products/{productId}` | 商品詳情 | 否 |
| `POST` | `/products` | 新增商品 Demo | 否；需 CSRF |
| `PUT` | `/products/{productId}` | 修改商品 Demo | 否；需 CSRF |
| `DELETE` | `/products/{productId}` | 刪除商品 Demo | 否；需 CSRF |
| `POST` | `/users/register` | 註冊 | 否；需 CSRF |
| `POST` | `/users/login` | 登入 | 否；需 CSRF |
| `POST` | `/users/logout` | 登出 | 是；需 CSRF |
| `GET` | `/users/me` | 目前會員 | 是 |
| `GET` | `/csrf` | 取得 CSRF token | 否 |
| `POST` | `/users/{userId}/orders` | 建立自己的訂單 | 是；需 CSRF |
| `GET` | `/users/{userId}/orders` | 查詢自己的訂單 | 是 |

## 前端頁面

| 路徑 | 頁面 |
|---|---|
| `/` | 商城首頁 |
| `/products` | 商品列表 |
| `/products/:productId` | 商品詳情 |
| `/cart` | 購物袋與結帳 |
| `/login` | 登入 |
| `/register` | 註冊 |
| `/orders` | 我的訂單 |
| `/admin/products` | 商品管理 Demo |
| `/admin/products/new` | 新增商品 Demo |
| `/admin/products/:productId/edit` | 修改商品 Demo |

## 已知限制

- 不提供 RBAC 或管理員角色；管理功能僅供作品展示。
- 不包含真實金流、配送地址、優惠券、收藏、評論或第三方登入。
- 商品圖片仍是外部連結，正式素材替換與本機化尚未完成。
- 目前沒有圖片上傳服務，商品表單使用 `imageUrl`。
- 目前沒有 Docker、CI/CD 或正式資料庫 migration。
- 開發工具維持目前可正常測試與建置的版本，不規劃只為清除 dev-only audit 警告而進行主要版本升級。

## 專案定位

這是一個以後端 API、安全流程與資料操作為重點的求職作品集。React 前端用來完整呈現 API 能力，但不刻意加入大型狀態管理或 UI 框架，以保留清楚、容易說明的程式結構。
