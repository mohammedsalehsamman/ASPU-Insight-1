export default function EditField({ label, value, onChange, type = "text", placeholder = "" }) {
    return (
        <div className="field-group">
            <label className="field-label">{label}</label>
            {type === "textarea" ? (
                <textarea
                    className="field-input"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    rows={3}
                />
            ) : (
                <input
                    className="field-input"
                    type={type}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                />
            )}
        </div>
    );
}