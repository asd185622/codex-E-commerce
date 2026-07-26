// 提供登入與註冊表單共用的 Email、密碼基本驗證。
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NON_NEGATIVE_INTEGER_PATTERN = /^\d+$/;

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

export function validateProduct(product) {
  const errors = {};

  if (!product.productName.trim()) {
    errors.productName = "請輸入商品名稱。";
  }

  if (!product.category) {
    errors.category = "請選擇商品分類。";
  }

  if (!product.imageUrl.trim()) {
    errors.imageUrl = "請輸入商品圖片網址。";
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
