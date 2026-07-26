// 共用顯示空資料、錯誤或提示狀態，並可選擇提供重試按鈕。
function StatusPanel({ title, message, actionLabel, onAction, compact = false }) {
  return (
    <section className={`status-panel${compact ? " status-panel-compact" : ""}`} role="status">
      <span className="status-mark" aria-hidden="true">
        拾
      </span>
      <h2>{title}</h2>
      {message ? <p>{message}</p> : null}
      {actionLabel && onAction ? (
        <button className="button button-secondary" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </section>
  );
}

export default StatusPanel;
