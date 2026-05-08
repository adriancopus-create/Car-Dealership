import React from 'react';

export default function EmptyState({ hasFilters, onClear }) {
  return (
    <div className="bg-white border border-dashed border-slate-300 rounded-lg p-12 text-center">
      <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-slate-100 grid place-items-center text-ink-500">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>
      <h3 className="heading-display text-2xl font-bold uppercase">No matches</h3>
      <p className="text-ink-500 mt-1">
        {hasFilters ? 'Try widening your filters or clearing them.' : 'No listings have been indexed yet — try refreshing.'}
      </p>
      {hasFilters && (
        <button onClick={onClear} className="btn-accent mt-4">Clear all filters</button>
      )}
    </div>
  );
}
