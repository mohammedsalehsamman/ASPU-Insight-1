export default function InputBox({ icon, label, type = "text", value, onChange, placeholder, autoComplete, extra }) {
  return (
    <div className="auth-field">
      {label && <label className="auth-label">{label}</label>}
      <div className="auth-input-box">
        {icon && <span className="auth-input-icon">{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="auth-input"
        />
        {extra}
      </div>
    </div>
  );
}