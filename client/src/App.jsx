import React, { useEffect, useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import FilterSidebar from './components/FilterSidebar.jsx';
import ListingGrid from './components/ListingGrid.jsx';
import ListingDetailModal from './components/ListingDetailModal.jsx';
import EmptyState from './components/EmptyState.jsx';
import { fetchFilterOptions, fetchListings, refreshScrape } from './api.js';

const PAGE_SIZE = 24;

const DEFAULT_FILTERS = {
  search: '',
  make: [],
  model: [],
  bodyStyle: [],
  fuelType: [],
  transmission: [],
  drivetrain: [],
  exteriorColor: [],
  source: [],
  minPrice: '',
  maxPrice: '',
  minMileage: '',
  maxMileage: '',
  minYear: '',
  maxYear: '',
  sort: 'recent',
};

export default function App() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [view, setView] = useState('grid'); // 'grid' | 'list'
  const [listings, setListings] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [totalAll, setTotalAll] = useState(0);
  const [lastScrapeAt, setLastScrapeAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterOptions, setFilterOptions] = useState(null);
  const [openListingId, setOpenListingId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Load filter options once on mount; reload after refresh.
  async function loadFilterOptions() {
    try { setFilterOptions(await fetchFilterOptions()); } catch (e) { console.error(e); }
  }
  useEffect(() => { loadFilterOptions(); }, []);

  // Load page of listings when filters change.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setPage(1);
    fetchListings({ ...filters, page: 1, limit: PAGE_SIZE })
      .then((d) => {
        if (cancelled) return;
        setListings(d.listings);
        setHasMore(d.hasMore);
        setTotal(d.total);
        setTotalAll(d.totalAll);
        setLastScrapeAt(d.lastScrapeAt);
      })
      .catch((e) => console.error(e))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [filters]);

  async function loadMore() {
    const next = page + 1;
    setLoading(true);
    try {
      const d = await fetchListings({ ...filters, page: next, limit: PAGE_SIZE });
      setListings((prev) => [...prev, ...d.listings]);
      setHasMore(d.hasMore);
      setPage(next);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await refreshScrape({ force: true });
      await loadFilterOptions();
      const d = await fetchListings({ ...filters, page: 1, limit: PAGE_SIZE });
      setListings(d.listings);
      setHasMore(d.hasMore);
      setTotal(d.total);
      setTotalAll(d.totalAll);
      setLastScrapeAt(d.lastScrapeAt);
      setPage(1);
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  }

  const activeFilterCount = useMemo(() => {
    let n = 0;
    for (const k of Object.keys(DEFAULT_FILTERS)) {
      if (k === 'sort') continue;
      const v = filters[k];
      if (Array.isArray(v) ? v.length : v) n += 1;
    }
    return n;
  }, [filters]);

  function clearFilters() { setFilters(DEFAULT_FILTERS); }

  return (
    <div className="min-h-full flex flex-col">
      <Header
        lastScrapeAt={lastScrapeAt}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onOpenFilters={() => setDrawerOpen(true)}
        activeFilterCount={activeFilterCount}
        search={filters.search}
        onSearchChange={(s) => setFilters((f) => ({ ...f, search: s }))}
      />

      <main className="flex-1 max-w-screen-2xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6">
        <FilterSidebar
          filters={filters}
          setFilters={setFilters}
          options={filterOptions}
          activeCount={activeFilterCount}
          onClear={clearFilters}
          drawerOpen={drawerOpen}
          onCloseDrawer={() => setDrawerOpen(false)}
        />

        <section>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="text-sm text-ink-500">
              {loading && total === 0
                ? 'Searching…'
                : <>Showing <span className="font-semibold text-ink-800">{listings.length}</span> of <span className="font-semibold text-ink-800">{total}</span> {total === 1 ? 'car' : 'cars'} <span className="text-slate-400">/ {totalAll} indexed</span></>}
            </div>
            <div className="flex items-center gap-2">
              <select
                aria-label="Sort"
                className="border border-slate-200 rounded-md px-3 py-1.5 text-sm bg-white"
                value={filters.sort}
                onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
              >
                <option value="recent">Most Recently Listed</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="mileage-asc">Mileage: Low to High</option>
                <option value="year-desc">Year: Newest</option>
                <option value="year-asc">Year: Oldest</option>
              </select>
              <div className="hidden sm:flex border border-slate-200 rounded-md overflow-hidden">
                <button
                  className={`px-3 py-1.5 text-sm ${view === 'grid' ? 'bg-ink-900 text-white' : 'bg-white text-ink-700'}`}
                  onClick={() => setView('grid')}
                >Grid</button>
                <button
                  className={`px-3 py-1.5 text-sm ${view === 'list' ? 'bg-ink-900 text-white' : 'bg-white text-ink-700'}`}
                  onClick={() => setView('list')}
                >List</button>
              </div>
            </div>
          </div>

          {!loading && listings.length === 0 ? (
            <EmptyState onClear={clearFilters} hasFilters={activeFilterCount > 0} />
          ) : (
            <ListingGrid
              listings={listings}
              view={view}
              loading={loading && listings.length === 0}
              onSelect={(id) => setOpenListingId(id)}
            />
          )}

          {hasMore && (
            <div className="flex justify-center mt-8">
              <button className="btn-ghost" onClick={loadMore} disabled={loading}>
                {loading ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </section>
      </main>

      {openListingId && (
        <ListingDetailModal
          id={openListingId}
          onClose={() => setOpenListingId(null)}
        />
      )}
    </div>
  );
}
