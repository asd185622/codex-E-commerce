// 統一處理商品圖片載入失敗時的替代圖示與文字。
import { useState } from "react";
import { ImageIcon } from "./icons";

function ProductImage({ src, alt, className = "" }) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className={`image-fallback ${className}`} role="img" aria-label={`${alt}，暫無圖片`}>
        <ImageIcon />
        <span>圖片準備中</span>
      </div>
    );
  }

  return (
    <img
      className={className}
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
}

export default ProductImage;
