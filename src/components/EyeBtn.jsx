import { FiEye, FiEyeOff } from "react-icons/fi";

const EyeBtn = ({ show, onToggle }) => (
    <button type="button" className="auth-input-icon" onClick={onToggle}
        style={{ cursor: "pointer", background: "none", border: "none", padding: "0 12px" }}>
        {show ? <FiEyeOff size={15} /> : <FiEye size={15} />}
    </button>
);
export default EyeBtn;
