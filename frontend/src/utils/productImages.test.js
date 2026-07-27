import { describe, expect, it } from "vitest";
import { getProductImageUrl } from "./productImages";

describe("getProductImageUrl", () => {
  it("將已盤點的舊 CDN 圖片替換成本機素材", () => {
    const cases = [
      [
        "https://cdn.pixabay.com/photo/2016/11/30/15/00/apples-1872997_1280.jpg",
        "/images/products/product-5-apples.png",
      ],
      [
        "https://cdn.pixabay.com/photo/2017/09/26/13/42/apple-2788662_1280.jpg",
        "/images/products/product-6-red-apples.png",
      ],
      [
        "https://cdn.pixabay.com/photo/2021/07/30/04/17/orange-6508617_1280.jpg",
        "/images/products/product-7-apples-oranges.png",
      ],
      [
        "https://cdn.pixabay.com/photo/2014/05/18/19/13/toyota-347288_1280.jpg",
        "/images/products/product-8-silver-hatchback.png",
      ],
      [
        "https://cdn.pixabay.com/photo/2018/02/21/03/15/bmw-m4-3169357_1280.jpg",
        "/images/products/product-9-blue-sedan.png",
      ],
      [
        "https://cdn.pixabay.com/photo/2017/03/27/14/56/auto-2179220_1280.jpg",
        "/images/products/product-10-charcoal-sedan.png",
      ],
      [
        "https://cdn.pixabay.com/photo/2021/01/15/16/49/tesla-5919764_1280.jpg",
        "/images/products/product-11-white-electric-fastback.png",
      ],
      [
        "https://cdn.pixabay.com/photo/2014/02/01/17/28/apple-256261__480.jpg",
        "/images/products/product-12-coral-city-car.png",
      ],
    ];

    cases.forEach(([sourceUrl, localUrl]) => {
      expect(getProductImageUrl({ imageUrl: sourceUrl })).toBe(localUrl);
    });
  });

  it("保留管理介面新增或修改的其他圖片網址", () => {
    expect(getProductImageUrl({ imageUrl: "https://example.com/new-product.jpg" })).toBe(
      "https://example.com/new-product.jpg",
    );
  });

  it("讓後端上傳圖片經由 Vite API proxy 載入", () => {
    expect(getProductImageUrl({ imageUrl: "/product-images/generated.webp" })).toBe(
      "/api/product-images/generated.webp",
    );
  });

  it("沒有圖片資料時回傳空字串", () => {
    expect(getProductImageUrl()).toBe("");
  });
});
