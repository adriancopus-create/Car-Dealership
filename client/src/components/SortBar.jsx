/* eslint-disable react/prop-types */
const SORT_OPTIONS = [
  { v: 'price_asc', label: 'Price: Low → High', sort_by: 'price', sort_order: 'asc' },
  { v: 'price_desc', label: 'Price: High → Low', sort_by: 'price', sort_order: 'desc' },
  { v: 'miles_asc', label: 'Lowest Miles', sort_by: 'miles', sort_order: 'asc' },
  { v: 'year_desc', label: 'Newest Year', sort_by: 'year', sort_order: 'desc' },
  { v: 'list_date_desc', label: 'Most Recent Listing', sort_by: 'list_date', sort_order: 'desc' },
  { v: 'miles_desc', label: 'Highest Mileage', sort_by: 'miles', sort_order: 'desc' },
];

export const sortDecode = (v) => SORT_OPTIONS.find((o) => o.v === v) || SORT_OPTIONS[0];

export default function SortBar({ value, onChange, totalCount, shown }) {
  return (
    <div className="flex flex-col gap-3 border-b border-border bg-bg-primary/60 px-4 py-3 backdrop-blur md:flex-row md:items-center md:justify-between md:px-6">
      <div className="text-sm text-text-secondary">
        {totalCount > 0 ? (
          <>
            Showing{' '}
            <span className="font-semibold text-text-primary">
              {shown.toLocaleString()}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-text-primary">
              {totalCount.toLocaleString()}
            </span>{' '}
            real listings
          </>
        ) : (
          'No listings match your filters'
        )}
      </div>

      <div className="flex items-center gap-2 text-sm">
        <label className="text-text-secondary">Sort by</label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-lg border border-border bg-bg-card px-3 py-1.5 text-sm focus:border-accent focus:outline-none"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.v} value={o.v}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
