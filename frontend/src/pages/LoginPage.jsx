// 提供會員登入表單，成功後保存後端 session 對應的會員狀態。
import { useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { loginUser } from "../api/users";
import PasswordField from "../components/PasswordField";
import { useUser } from "../hooks/useUser";
import { getAuthErrorMessage } from "../utils/errors";
import { validateCredentials } from "../utils/validation";

function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isUserLoading, setAuthenticatedUser } = useUser();
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const [email, setEmail] = useState(location.state?.registrationEmail ?? "");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isUserLoading && user) {
    return <Navigate to="/" replace />;
  }

  function focusFirstError(nextErrors) {
    if (nextErrors.email) emailRef.current?.focus();
    else if (nextErrors.password) passwordRef.current?.focus();
  }

  async function handleSubmit(event) {
    // 先完成前端欄位驗證，再呼叫 Spring Security 登入端點。
    event.preventDefault();
    const nextErrors = validateCredentials(email, password);
    setErrors(nextErrors);
    setSubmitError("");

    if (Object.keys(nextErrors).length > 0) {
      focusFirstError(nextErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const userData = await loginUser({ email: email.trim(), password });
      setAuthenticatedUser(userData);
      const destination = location.state?.from ?? "/";
      navigate(destination, { replace: true });
    } catch (error) {
      setSubmitError(getAuthErrorMessage(error, "login"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-page page-width">
      <aside className="auth-intro">
        <p className="eyebrow">MEMBER SIGN IN</p>
        <h1>回到你的<br />拾物清單。</h1>
        <p>
          登入後即可銜接購物袋與訂單流程。會員狀態由後端 session 管理，重新整理頁面也能保持登入。
        </p>
        <dl className="auth-notes">
          <div>
            <dt>01</dt>
            <dd>瀏覽器只保存 HttpOnly session cookie，不保存密碼。</dd>
          </div>
          <div>
            <dt>02</dt>
            <dd>訂單存取會由後端確認目前登入的會員身分。</dd>
          </div>
        </dl>
      </aside>

      <section className="auth-panel" aria-labelledby="login-heading">
        <div className="auth-panel-heading">
          <p className="eyebrow">ACCOUNT</p>
          <h2 id="login-heading">會員登入</h2>
          <p>使用註冊時的 Email 與密碼登入。</p>
        </div>

        {location.state?.successMessage ? (
          <p className="form-success" role="status">{location.state.successMessage}</p>
        ) : null}

        {location.state?.loginMessage ? (
          <p className="form-info" role="status">{location.state.loginMessage}</p>
        ) : null}

        <form className="auth-form" noValidate onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="login-email">Email</label>
            <input
              ref={emailRef}
              id="login-email"
              className={errors.email ? "input-error" : ""}
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setErrors((current) => ({ ...current, email: "" }));
              }}
              autoComplete="email"
              inputMode="email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "login-email-error" : undefined}
              required
            />
            {errors.email ? (
              <p className="field-error" id="login-email-error">{errors.email}</p>
            ) : null}
          </div>

          <PasswordField
            id="login-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setErrors((current) => ({ ...current, password: "" }));
            }}
            error={errors.password}
            autoComplete="current-password"
            inputRef={passwordRef}
          />

          {submitError ? <p className="form-error" role="alert">{submitError}</p> : null}

          <button
            className="button button-primary auth-submit"
            type="submit"
            disabled={isSubmitting || isUserLoading}
          >
            {isSubmitting ? "登入中…" : "登入"}
          </button>
        </form>

        <p className="auth-switch">
          還沒有帳號？<Link to="/register">建立會員帳號</Link>
        </p>
      </section>
    </div>
  );
}

export default LoginPage;
