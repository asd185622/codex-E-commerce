// 提供登入與註冊共用的密碼欄位，包含顯示／隱藏密碼功能。
import { useState } from "react";

function PasswordField({
  id,
  value,
  onChange,
  error,
  autoComplete,
  inputRef,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const errorId = `${id}-error`;

  return (
    <div className="form-field">
      <label htmlFor={id}>密碼</label>
      <div className={`password-control${error ? " input-error" : ""}`}>
        <input
          ref={inputRef}
          id={id}
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          required
        />
        <button
          type="button"
          aria-label={isVisible ? "隱藏密碼" : "顯示密碼"}
          aria-pressed={isVisible}
          onClick={() => setIsVisible((visible) => !visible)}
        >
          {isVisible ? "隱藏" : "顯示"}
        </button>
      </div>
      {error ? <p className="field-error" id={errorId}>{error}</p> : null}
    </div>
  );
}

export default PasswordField;
