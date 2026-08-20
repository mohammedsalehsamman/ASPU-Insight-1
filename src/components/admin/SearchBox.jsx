import { PiMagnifyingGlassDuotone } from 'react-icons/pi';

/* صندوق البحث المشترك بأعلى جداول لوحة الأدمن */
export default function SearchBox({ value, onChange, placeholder }) {
  return (
    <div className="admin-search-box">
      <PiMagnifyingGlassDuotone size={15} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
