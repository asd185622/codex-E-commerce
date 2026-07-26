// 提供登入與註冊表單共用的 Email、密碼基本驗證。
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
