# 商品圖片授權清冊與本機化紀錄

> 盤點日期：2026-07-26
> 盤點範圍：本機後端 `GET /products?limit=100&offset=0` 回傳的 8 筆商品
> 本文件是專案素材追蹤紀錄，不是法律意見。

## 1. 盤點結論

後端目前 8 筆商品資料仍保存原有的 `cdn.pixabay.com` 網址；前端已為這 8 個精確網址提供專案內的原創替換圖片，因此商城、購物車、訂單與管理列表不再熱連結這些舊圖片。

- 6 張已找到仍可開啟的 Pixabay 原始作品頁，可記錄作者、發布日期與授權依據。
- Tesla 與 Toyota 的 2 張圖片只確認到 CDN 檔案，尚未找到可驗證的原始作品頁與作者，不能視為已完成授權查核。
- 4 張品牌車圖片涉及可辨識的品牌、車款或商標；Pixabay 授權不代表已取得第三方商標或品牌使用許可。
- `MyCar` 使用蘋果與書本的圖片，與商品類型不符，列為最高優先替換。
- 兩筆標示北海道與澳洲產地的蘋果商品使用一般果園照片，圖片本身不能證明商品產地，正式展示前應替換為有正確內容依據的素材，或移除產地宣稱。

本機替換圖由本專案透過 OpenAI 圖片生成功能建立，沒有使用第三方圖庫照片；汽車圖刻意採通用、無標誌、無車牌與無人物的造型。這些圖片只作商品情境示意，不代表品牌授權、實際車款、商品產地或品質證明。資料庫的 `imageUrl` 沒有修改。

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

## 4. 原創本機替換素材

建立日期皆為 2026-07-26，來源皆為本專案使用 OpenAI 圖片生成功能建立的原創輸出。檔案隨前端保存，沒有第三方圖庫作品頁或署名需求；仍應遵守 OpenAI 適用條款，且不得把示意圖當成品牌背書、產地證明或實物照片。

| 商品 ID | 商品 | 本機檔案 | 圖片內容與使用界線 |
|---|---|---|---|
| 5 | 蘋果（澳洲） | `frontend/public/images/products/product-5-apples.png` | 木箱中的通用紅蘋果；不宣稱或證明澳洲產地。 |
| 6 | 蘋果（日本北海道） | `frontend/public/images/products/product-6-red-apples.png` | 盤中的通用紅蘋果；不宣稱或證明北海道產地。 |
| 7 | 好吃又鮮甜的蘋果橘子 | `frontend/public/images/products/product-7-apples-oranges.png` | 同時包含蘋果與橘子，對應商品名稱。 |
| 8 | Toyota | `frontend/public/images/products/product-8-silver-hatchback.png` | 無品牌銀色掀背車；不是 Toyota 實際車款。 |
| 9 | BMW | `frontend/public/images/products/product-9-blue-sedan.png` | 無品牌深藍運動房車；不是 BMW 實際車款。 |
| 10 | Benz | `frontend/public/images/products/product-10-charcoal-sedan.png` | 無品牌深灰行政房車；不是 Benz 實際車款。 |
| 11 | Tesla | `frontend/public/images/products/product-11-white-electric-fastback.png` | 無品牌白色電動斜背車；不是 Tesla 實際車款。 |
| 12 | MyCar | `frontend/public/images/products/product-12-coral-city-car.png` | 無品牌珊瑚色都會跨界車，修正舊圖內容錯置。 |

前端 `productImages.js` 只對照清冊中的 8 個完整舊 CDN 網址；其他商品或管理表單輸入的新網址仍原樣顯示。這個做法讓既有資料不用遷移，也避免依商品 ID 對照造成資料庫重建後套錯圖。

## 5. 替換原則

### 5.1 素材選擇

- 汽車商品優先改用不含可辨識品牌、車標、車牌、人物與受保護設計特徵的通用交通情境圖片。
- 食品商品優先使用能直接對應商品名稱的通用水果照片；若保留產地宣稱，需另有可驗證的商品或拍攝來源資料，不能只靠素材網站標籤推定。
- 每張候選圖都必須能開啟原始作品頁，並記錄作者、作品頁、發布日期、授權名稱、授權頁與查核日期。
- 原始作品頁失效、作者不明或條款含糊時，直接放棄該候選圖。

### 5.2 檔案保存與資料更新

本次實際執行方式：

1. 使用一致檔名將原創 PNG 保存到 `frontend/public/images/products/`。
2. 在 `frontend/src/utils/productImages.js` 精確對照舊 CDN 網址與本機靜態路徑。
3. 商品卡、首頁主打、詳情、購物車、訂單與管理列表共用同一個解析函式。
4. 商品新增／編輯表單保留後端原始 `imageUrl`，不在讀取或送出時改寫資料。
5. 收到權利主張或發現內容不適合時，移除對照並更換本機圖檔。

本次只新增前端素材、前端顯示對照與文件，不修改後端程式碼、設定或資料庫。若未來決定直接更新資料庫的 `imageUrl`，仍要先確認後端變更範圍。

## 6. 舊圖片處理結果

- [x] `MyCar` 改為內容相符的通用汽車圖。
- [x] `Tesla`、`Toyota`、`BMW`、`Benz` 改為無品牌的通用汽車圖。
- [x] 兩筆產地蘋果改為通用蘋果圖，並明確記錄圖片不構成產地證明。
- [x] 蘋果橘子改為同時包含兩種水果的圖片。
- [x] 前端正式畫面不再載入舊 Pixabay CDN 圖片；清冊保留作歷史追蹤。
