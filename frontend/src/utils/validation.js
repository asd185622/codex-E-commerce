// 提供登入與註冊表單共用的 Email、密碼基本驗證。
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NON_NEGATIVE_INTEGER_PATTERN = /^\d+$/;
const PRODUCT_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_PRODUCT_IMAGE_SIZE = 5 * 1024 * 1024;

export function validateCredentials(email, password) {
  const errors = {};
  const normalizedEmail = email.trim();

  if (!normalizedEmail) {
    errors.email = "請輸入 Email。";
  } else if (!EMAIL_PATTERN.test(normalizedEmail)) {
    errors.email = "請輸入有效的 Email 格式。";
  }

  if (!password.trim()) {
    errors.password = "請輸入密碼。";
  }

  return errors;
}

export function validateProduct(product, imageFile = null) {
  const errors = {};

  if (!product.productName.trim()) {
    errors.productName = "請輸入商品名稱。";
  }

  if (!product.category) {
    errors.category = "請選擇商品分類。";
  }

  if (!product.imageUrl.trim() && !imageFile) {
    errors.imageFile = "請選擇商品圖片。";
  } else if (imageFile && !PRODUCT_IMAGE_TYPES.has(imageFile.type)) {
    errors.imageFile = "僅支援 JPG、PNG 或 WebP 圖片。";
  } else if (imageFile && imageFile.size > MAX_PRODUCT_IMAGE_SIZE) {
    errors.imageFile = "圖片大小不可超過 5 MB。";
  }

  const price = String(product.price).trim();
  if (!price) {
    errors.price = "請輸入商品價格。";
  } else if (!NON_NEGATIVE_INTEGER_PATTERN.test(price)) {
    errors.price = "價格必須是大於或等於 0 的整數。";
  }

  const stock = String(product.stock).trim();
  if (!stock) {
    errors.stock = "請輸入商品庫存。";
  } else if (!NON_NEGATIVE_INTEGER_PATTERN.test(stock)) {
    errors.stock = "庫存必須是大於或等於 0 的整數。";
  }

  return errors;
}
