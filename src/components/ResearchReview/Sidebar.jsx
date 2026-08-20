import { PiMagnifyingGlassDuotone, PiSlidersHorizontal, PiCaretDownBold } from 'react-icons/pi';
import { useTranslation } from 'react-i18next';

export default function Sidebar({
  search, setSearch,
  status, setStatus,
  oaOnly, setOaOnly,
  sideOpen, setSideOpen,
  onReset,
}) {
  const { t } = useTranslation();
  const rr = t('researchReview', { returnObjects: true });

  return (
    <>
      <button className="filter-toggle" onClick={() => setSideOpen(o => !o)}>
        <PiCaretDownBold
          size={16}
          style={{ transition: 'transform .3s', transform: sideOpen ? 'rotate(180deg)' : 'none' }}
        />
      </button>

      <aside className={`sidebar ${sideOpen ? 'mobile-open' : ''}`}>
        <div>
          <div className="filter-label">{rr.searchLabel}</div>
          <div className="sf-search">
            <PiMagnifyingGlassDuotone size={15} className="sf-ico" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </aside>
    </>
  );
}
