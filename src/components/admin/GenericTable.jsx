import { adminT } from '../../pages/admin/adminI18n';

const PREFERRED_COLUMNS = {
  editor: ['paper_title', 'editor_name', 'decision', 'notes', 'created_at'],
  assistant: ['paper_title', 'assistant_name', 'decision', 'notes', 'created_at'],
  committees: ['paper_title', 'members', 'status', 'created_at'],
};

const COL_LABELS = {
  ar: {
    paper_title: 'البحث', editor_name: 'المحرر', assistant_name: 'المساعد', decision: 'القرار',
    notes: 'الملاحظات', created_at: 'التاريخ', members: 'الأعضاء', status: 'الحالة',
  },
  en: {
    paper_title: 'Paper', editor_name: 'Editor', assistant_name: 'Assistant', decision: 'Decision',
    notes: 'Notes', created_at: 'Date', members: 'Members', status: 'Status',
  },
};

function humanize(key) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatCell(key, value, lang) {
  if (value == null) return '—';
  if (key === 'created_at' || key === 'updated_at') {
    const d = new Date(value);
    return isNaN(d) ? String(value) : d.toLocaleString(lang === 'ar' ? 'ar' : 'en');
  }
  if (Array.isArray(value)) {
    return value
      .map((v) => (typeof v === 'object' ? (v.full_name || v.name || v.email || v.user?.full_name || v.user?.name || v.user?.email || JSON.stringify(v)) : v))
      .join(', ');
  }
  if (typeof value === 'object') return value.full_name || value.name || value.title || value.user?.full_name || value.user?.email || JSON.stringify(value);
  const str = String(value);
  return str.length > 80 ? `${str.slice(0, 80)}…` : str;
}

export default function GenericTable({ items, tabKey, lang }) {
  const t = (key) => adminT(lang, key);
  if (items.length === 0) {
    return (
      <div className="admin-state-center">
        <span className="admin-empty-title">{t('no_results')}</span>
      </div>
    );
  }

  const preferred = PREFERRED_COLUMNS[tabKey].filter((k) => k in items[0]);
  const columns = preferred.length > 0
    ? preferred
    : Object.keys(items[0]).filter((k) => typeof items[0][k] !== 'object' || Array.isArray(items[0][k])).slice(0, 6);

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c}>{COL_LABELS[lang]?.[c] ?? humanize(c)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={item.id ?? i}>
              {columns.map((c) => (
                <td key={c}>{formatCell(c, item[c], lang)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
