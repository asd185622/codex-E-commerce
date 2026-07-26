# 商品圖片授權清冊與替換策略

> 盤點日期：2026-07-26
> 盤點範圍：本機後端 `GET /products?limit=100&offset=0` 回傳的 8 筆商品
> 本文件是專案素材追蹤紀錄，不是法律意見。

## 1. 盤點結論

目前 8 張商品圖片都是 `cdn.pixabay.com` 的外部直連，沒有圖片檔案隨專案保存。

- 6 張已找到仍可開啟的 Pixabay 原始作品頁，可記錄作者、發布日期與授權依據。
- Tesla 與 Toyota 的 2 張圖片只確認到 CDN 檔案，尚未找到可驗證的原始作品頁與作者，不能視為已完成授權查核。
- 4 張品牌車圖片涉及可辨識的品牌、車款或商標；Pixabay 授權不代表已取得第三方商標或品牌使用許可。
- `MyCar` 使用蘋果與書本的圖片，與商品類型不符，列為最高優先替換。
- 兩筆標示北海道與澳洲產地的蘋果商品使用一般果園照片，圖片本身不能證明商品產地，正式展示前應替換為有正確內容依據的素材，或移除產地宣稱。

因此，本次只完成「現況清冊、風險分類與替換策略」，不把現有 8 張圖片宣告為正式商用已核准素材，也不修改資料庫的 `imageUrl`。

## 2. Pixabay 授權依據

本次查核以 2026-07-26 可讀取的官方頁面為準：

- [Pixabay Content License Summary](https://pixabay.com/service/license-summary/)
- [Pixabay Terms of Service](https://pixabay.com/service/terms/)（頁面標示最後更新日期為 2024-11-18）

與本專案直接相關的規則：

- 在禁止用途限制下，Pixabay 內容可免費使用、通常不強制署名，並可修改或改作。
- 不能以幾乎未加工的單獨素材形式轉售或散布。
- 含有可辨識商標、標誌或品牌的內容，不得用於與商品或服務相關的商業用途。
- 圖片可能另外受到商標、設計、財產、隱私或其他第三方權利限制，使用者必須自行確認是否需要額外同意。
- Pixabay 條款將發布日期早於 2019-01-09 的內容列為 CC0；日期較晚的內容適用 Pixabay Content License。

即使授權不要求署名，本專案仍保存作者與原始作品頁，讓素材可追溯，也方便日後重新檢查條款或處理下架。

## 3. 現有圖片清冊

狀態定義：

- `可追溯`：已確認原始作品頁、作者與授權依據，但不代表第三方品牌權或內容適配性已核准。
- `未完成查核`：原始作品頁或作者無法確認，不應用於正式版本。
- `應替換`：內容錯置、宣稱無法由圖片支持，或存在明顯品牌／商標風險。

| 商品 ID | 商品 | 現有圖片 | 原始作品頁／作者 | 授權紀錄 | 狀態與處理建議 |
|---|---|---|---|---|---|
| 5 | 蘋果（澳洲） | [CDN](https://cdn.pixabay.com/photo/2016/11/30/15/00/apples-1872997_1280.jpg) | [Apples, Fruits, Orchard](https://pixabay.com/photos/apples-fruits-orchard-nature-trees-1872997/)／`lumix2004` | 2016-12-03 發布；依現行條款屬 CC0 | 可追溯；但一般果園照片不能證明澳洲產地，正式使用前應替換或調整商品宣稱。 |
| 6 | 蘋果（日本北海道） | [CDN](https://cdn.pixabay.com/photo/2017/09/26/13/42/apple-2788662_1280.jpg) | [Apple, Red, Hand](https://pixabay.com/photos/apple-red-hand-apple-plantation-2788662/)／`NoName_13` | 2017-09-26 發布；依現行條款屬 CC0 | 可追溯；但圖片不能證明北海道產地，正式使用前應替換或調整商品宣稱。 |
| 7 | 好吃又鮮甜的蘋果橘子 | [CDN](https://cdn.pixabay.com/photo/2021/07/30/04/17/orange-6508617_1280.jpg) | [Orange, Fruit, Food](https://pixabay.com/photos/orange-fruit-food-organic-ripe-6508617/)／`tamanna_rumee` | 2021-07-31 發布；Pixabay Content License | 可追溯；圖片只有橘子，應確認商品名稱是否要保留「蘋果」，否則替換為同時包含兩種水果的圖片。 |
| 8 | Toyota | [CDN](https://cdn.pixabay.com/photo/2014/05/18/19/13/toyota-347288_1280.jpg) | 尚未找到可驗證作品頁與作者 | 無法完成逐圖授權紀錄 | 未完成查核、應替換；另有品牌／商標風險。 |
| 9 | BMW | [CDN](https://cdn.pixabay.com/photo/2018/02/21/03/15/bmw-m4-3169357_1280.jpg) | [BMW M4 Convertible](https://pixabay.com/photos/bmw-m4-convertible-bmw-m4-3169357/)／`Toby_Parsons` | 2018-02-21 發布；依現行條款屬 CC0 | 可追溯但應替換；畫面與作品頁明確指向 BMW M4，存在品牌／商標風險。 |
| 10 | Benz | [CDN](https://cdn.pixabay.com/photo/2017/03/27/14/56/auto-2179220_1280.jpg) | [Auto, Automobile, Automotive](https://pixabay.com/photos/auto-automobile-automotive-amg-2179220/)／`Pexels` | 2017-03-27 發布；依現行條款屬 CC0 | 可追溯但應替換；作品標籤含 AMG、Benz 與 Mercedes-Benz，存在品牌／商標風險。 |
| 11 | Tesla | [CDN](https://cdn.pixabay.com/photo/2021/01/15/16/49/tesla-5919764_1280.jpg) | 尚未找到可驗證作品頁與作者 | 無法完成逐圖授權紀錄 | 未完成查核、應替換；另有品牌／商標風險。 |
| 12 | MyCar | [CDN](https://cdn.pixabay.com/photo/2014/02/01/17/28/apple-256261__480.jpg) | [Apple, Books, Still Life](https://pixabay.com/photos/apple-books-still-life-fruit-food-256261/)／`jarmoluk` | 2014-02-01 發布；依現行條款屬 CC0 | 可追溯但應優先替換；圖片是蘋果與書本，與汽車商品完全不符。 |

## 4. 替換原則

### 4.1 素材選擇

- 汽車商品優先改用不含可辨識品牌、車標、車牌、人物與受保護設計特徵的通用交通情境圖片。
- 食品商品優先使用能直接對應商品名稱的通用水果照片；若保留產地宣稱，需另有可驗證的商品或拍攝來源資料，不能只靠素材網站標籤推定。
- 每張候選圖都必須能開啟原始作品頁，並記錄作者、作品頁、發布日期、授權名稱、授權頁與查核日期。
- 原始作品頁失效、作者不明或條款含糊時，直接放棄該候選圖。

### 4.2 檔案保存與資料更新

選定替換素材後，建議依序執行：

1. 保存原始作品頁與當日授權條款紀錄。
2. 下載允許隨專案散布的適當尺寸版本，放在 `frontend/public/images/products/`，避免依賴外部 CDN 熱連結。
3. 使用一致的檔名，例如 `product-5-apples.jpg`，並保留本文件中的來源對照。
4. 將商品 `imageUrl` 更新成對應的專案靜態路徑，再驗證列表、詳情、購物車與管理頁。
5. 圖片下架、授權條款改變或收到權利主張時，立即停止使用並更換。

第 2 至 4 步會新增正式素材並改動目前商品資料，執行前要先確認候選圖片與資料更新方式。本次 commit 不下載圖片、不修改前後端程式碼，也不修改資料庫。

## 5. 替換優先順序

1. `MyCar`：內容完全錯置。
2. `Tesla`、`Toyota`：缺少可驗證作品頁與作者，且有品牌風險。
3. `BMW`、`Benz`：雖可追溯，但有明確品牌／商標風險。
4. 兩筆產地蘋果：圖片不能支持北海道或澳洲產地宣稱。
5. 蘋果橘子：確認商品名稱後，決定保留橘子圖或改用包含兩種水果的圖片。
