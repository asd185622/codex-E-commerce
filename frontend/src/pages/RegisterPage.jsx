// 提供會員註冊表單，成功後引導使用者回到登入頁。
import { useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { registerUser } from "../api/users";
import PasswordField from "../components/PasswordField";
import { useUser } from "../hooks/useUser";
import { getAuthErrorMessage } from "../utils/errors";
import { validateCredentials } from "../utils/validation";

function RegisterPage() {
  const navigate = useNavigate();
  const { user, isUserLoading } = useUser();
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const [email, setEmail] = useState("");
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
    // 先完成前端欄位驗證，再送出建立會員請求。
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
      const registeredUser = await registerUser({ email: email.trim(), password });
      navigate("/login", {
        replace: true,
        state: {
          registrationEmail: registeredUser.email,
          successMessage: "帳號建立完成，請使用剛才設定的密碼登入。",
        },
      });
    } catch (error) {
      setSubmitError(getAuthErrorMessage(error, "register"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-page page-width">
      <aside className="auth-intro">
        <p className="eyebrow">CREATE ACCOUNT</p>
        <h1>從一個帳號，<br />開始完整流程。</h1>
        <p>
          建立展示用會員帳號，之後可用相同 Email 登入並建立、查看自己的訂單。
        </p>
        <dl className="auth-notes">
          <div>
            <dt>01</dt>
            <dd>後端以 BCrypt 雜湊密碼，前端不保存密碼內容。</dd>
          </div>
          <div>
            <dt>02</dt>
            <dd>註冊完成後會回到登入頁，由你主動登入。</dd>
          </div>
        </dl>
      </aside>

      <section className="auth-panel" aria-labelledby="register-heading">
        <div className="auth-panel-heading">
          <p className="eyebrow">NEW MEMBER</p>
          <h2 id="register-heading">建立會員帳號</h2>
          <p>只需要 Email 與密碼即可開始。</p>
        </div>

        <form className="auth-form" noValidate onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="register-email">Email</label>
            <input
              ref={emailRef}
              id="register-email"
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
              aria-describedby={errors.email ? "register-email-error" : undefined}
              required
            />
            {errors.email ? (
              <p className="field-error" id="register-email-error">{errors.email}</p>
            ) : null}
          </div>

          <PasswordField
            id="register-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setErrors((current) => ({ ...current, password: "" }));
            }}
            error={errors.password}
            autoComplete="new-password"
            inputRef={passwordRef}
          />

          {submitError ? <p className="form-error" role="alert">{submitError}</p> : null}

          <button
            className="button button-primary auth-submit"
            type="submit"
            disabled={isSubmitting || isUserLoading}
          >
            {isSubmitting ? "建立帳號中…" : "建立帳號"}
          </button>
        </form>

        <p className="auth-switch">
          已經有帳號？<Link to="/login">返回登入</Link>
        </p>
      </section>
    </div>
  );
}

export default RegisterPage;
