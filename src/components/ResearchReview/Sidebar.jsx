import { MagnifyingGlass, SlidersHorizontal, CaretDown } from '@phosphor-icons/react';

export default function Sidebar({
  search, setSearch,
  status, setStatus,
  oaOnly, setOaOnly,
  sideOpen, setSideOpen,
  onReset,
}) {
  return (
    <>
      <button className="filter-toggle" onClick={() => setSideOpen(o => !o)}>
        <CaretDown
          size={16}
          weight="bold"
          style={{ transition: 'transform .3s', transform: sideOpen ? 'rotate(180deg)' : 'none' }}
        />
      </button>

      <aside className={`sidebar ${sideOpen ? 'mobile-open' : ''}`}>
        <div>
          <div className="filter-label">ابحث...</div>
          <div className="sf-search">
            <MagnifyingGlass size={15} weight="duotone" className="sf-ico" />
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