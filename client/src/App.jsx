import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchFilterOptions, fetchListings } from './lib/api.js';
import useDebounced from './lib/useDebounced.js';
import Header from './components/Header.jsx';
import FilterSidebar from './components/FilterSidebar.jsx';
import ListingCard from './components/ListingCard.jsx';
import SkeletonCard from './components/SkeletonCard.jsx';
import SortBar, { sortDecode } from './components/SortBar.jsx';
import ActiveFilterPills from './components/ActiveFilterPills.jsx';
import ListingDetailModal from './components/ListingDetailModal.jsx';

const PAGE_SIZE = 24;
const CURRENT_YEAR = new Date().getFullYear();

const DEFAULT_FILTERS = {
  zip: '',
  radius: 100,
  q: '',
  carType: '',
  priceMin: 0,
  priceMax: 150000,
  mileageMin: 0,
  mileageMax: 250000,
  yearMin: 1990,
  yearMax: CURRENT_YEAR,
  make: '',
  model: '',
  bodyStyles: [],
  fuelTypes: [],
  transmission: '',
  drivetrains: [],
  colors: [],
};

// Map UI body style labels → MarketCheck body_type tokens
const BODY_TOKEN = {
  SUV: 'SUV',
  Sedan: 'Sedan',
  Truck: 'Pickup',
  Coupe: 'Coupe',
  Van: 'Van',
  Wagon: 'Wagon',
  Convertible: 'Convertible',
  Hatchback: 'Hatchback',
};
const FUEL_TOKEN = {
  Gas: 'Gasoline',
  Hybrid: 'Hybrid',
  Electric: 'Electric',
  Diesel: 'Diesel',
  'Plug-in Hybrid': 'PHEV',
};

function buildQueryParams(filters, sortKey, start) {
  const sort = sortDecode(sortKey);
  const params = {
    rows: PAGE_SIZE,
    start,
    sort_by: sort.sort_by,
    sort_order: sort.sort_order,
  };
  if (filters.zip) params.zip = filters.zip;
  if (filters.radius) params.radius = filters.radius;
  if (filters.q) params.q = filters.q;
  if (filters.carType) params.car_type = filters.carType;
  if (filters.make) params.make = filters.make;
  if (filters.model) params.model = filters.model;
  if (filters.transmission) params.transmission = filters.transmission;
  if (filters.bodyStyles?.length)
    params.body_style = filters.bodyStyles
      .map((b) => BODY_TOKEN[b] || b)
      .join(',');
  if (filters.fuelTypes?.length)
    params.fuel_type = filters.fuelTypes
      .map((f) => FUEL_TOKEN[f] || f)
      .join(',');
  if (filters.drivetrains?.length)
    params.drivetrain = filters.drivetrains.join(',');
  if (filters.colors?.length) params.exterior_color = filters.colors.join(',');

  if (filters.priceMin > 0 || filters.priceMax < 150000) {
    params.price_range = `${filters.priceMin || 0}-${filters.priceMax || 150000}`;
  }
  if (filters.mileageMin > 0 || filters.mileageMax < 250000) {
    params.mileage_range = `${filters.mileageMin || 0}-${filters.mileageMax || 250000}`;
  }
  if (filters.yearMin > 1990 || filters.yearMax < CURRENT_YEAR) {
    params.year = `${filters.yearMin || 1990}-${filters.yearMax || CURRENT_YEAR}`;
  }
  return params;
}

export default function App() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sortKey, setSortKey] = useState('list_date_desc');
  const [options, setOptions] = useState(null);
  const [listings, setListings] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  // Debounce text-y / range-y inputs so we don't fetch on every keystroke
  const debouncedQ = useDebounced(filters.q, 400);
  const debouncedZip = useDebounced(filters.zip, 400);
  const debouncedPriceMin = useDebounced(filters.priceMin, 250);
  const debouncedPriceMax = useDebounced(filters.priceMax, 250);
  const debouncedMileMin = useDebounced(filters.mileageMin, 250);
  const debouncedMileMax = useDebounced(filters.mileageMax, 250);
  const debouncedYearMin = useDebounced(filters.yearMin, 250);
  const debouncedYearMax = useDebounced(filters.yearMax, 250);

  const effectiveFilters = useMemo(
    () => ({
      ...filters,
      q: debouncedQ,
      zip: debouncedZip,
      priceMin: debouncedPriceMin,
      priceMax: debouncedPriceMax,
      mileageMin: debouncedMileMin,
      mileageMax: debouncedMileMax,
      yearMin: debouncedYearMin,
      yearMax: debouncedYearMax,
    }),
    [
      filters,
      debouncedQ,
      debouncedZip,
      debouncedPriceMin,
      debouncedPriceMax,
      debouncedMileMin,
      debouncedMileMax,
      debouncedYearMin,
      debouncedYearMax,
    ]
  );

  // ZIP gate — only valid 5-digit ZIPs are sent upstream
  const queryFilters = useMemo(() => {
    const f = { ...effectiveFilters };
    if (f.zip && f.zip.length !== 5) f.zip = '';
    return f;
  }, [effectiveFilters]);

  // Try to autofill ZIP from geolocation (only on first mount)
  const triedGeo = useRef(false);
  useEffect(() => {
    if (triedGeo.current) return;
    triedGeo.current = true;
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const r = await fetch(
            `https://api.zippopotam.us/us-near/${latitude},${longitude}`
          );
          if (!r.ok) return;
          const j = await r.json();
          const z = j?.places?.[0]?.['post code'];
          if (z && /^\d{5}$/.test(z)) {
            setFilters((f) => (f.zip ? f : { ...f, zip: z }));
          }
        } catch {
          /* ignore */
        }
      },
      () => {},
      { timeout: 4000 }
    );
  }, []);

  // Load filter options once
  useEffect(() => {
    const ctrl = new AbortController();
    fetchFilterOptions(ctrl.signal)
      .then(setOptions)
      .catch((e) => {
        if (e.name !== 'AbortError') setError(e.message);
      });
    return () => ctrl.abort();
  }, []);

  // Fetch listings whenever filters/sort change (resets pagination)
  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    const params = buildQueryParams(queryFilters, sortKey, 0);
    fetchListings(params, ctrl.signal)
      .then((d) => {
        setListings(d.listings || []);
        setTotalCount(d.totalCount || 0);
      })
      .catch((e) => {
        if (e.name !== 'AbortError') setError(e.message);
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [queryFilters, sortKey]);

  const loadMore = async () => {
    if (loadingMore || listings.length >= totalCount) return;
    setLoadingMore(true);
    try {
      const params = buildQueryParams(queryFilters, sortKey, listings.length);
      const d = await fetchListings(params);
      setListings((prev) => [...prev, ...(d.listings || [])]);
      setTotalCount(d.totalCount || totalCount);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingMore(false);
    }
  };

  const onPatchFilters = (patch) => setFilters((f) => ({ ...f, ...patch }));
  const onClearFilters = () => setFilters(DEFAULT_FILTERS);

  const hasMore = listings.length < totalCount;

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <Header onOpenFilters={() => setDrawerOpen(true)} />

      <div className="flex">
        <FilterSidebar
          filters={filters}
          setFilters={setFilters}
          options={options}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />

        <main className="min-w-0 flex-1">
          <SortBar
            value={sortKey}
            onChange={setSortKey}
            totalCount={totalCount}
            shown={listings.length}
          />
          <ActiveFilterPills
            filters={filters}
            onChange={onPatchFilters}
            onClear={onClearFilters}
          />

          <div className="px-4 py-4 md:px-6">
            {error && (
              <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-bg-card p-10 text-center">
                <div className="font-display text-xl font-bold">
                  No listings match
                </div>
                <p className="mt-1 text-sm text-text-secondary">
                  Try widening your filters — bigger radius, broader price
                  range, or fewer body styles.
                </p>
                <button
                  type="button"
                  onClick={onClearFilters}
                  className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {listings.map((c) => (
                    <ListingCard
                      key={c.id || c.vin}
                      car={c}
                      onClick={() => setSelected(c)}
                    />
                  ))}
                </div>

                {hasMore && (
                  <div className="mt-8 flex justify-center">
                    <button
                      type="button"
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="flex items-center gap-2 rounded-lg border border-border bg-bg-card px-5 py-2.5 text-sm font-semibold hover:bg-bg-card-hover disabled:opacity-60"
                    >
                      {loadingMore && (
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-text-secondary border-t-transparent" />
                      )}
                      {loadingMore ? 'Loading…' : 'Load More'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {selected && (
        <ListingDetailModal
          listing={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
