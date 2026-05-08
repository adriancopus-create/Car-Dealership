import React from 'react';
import { timeAgo } from '../format.js';

export default function Header({
  lastScrapeAt,
  onRefresh,
  refreshing,
  onOpenFilters,
  activeFilterCount,
  search,
  onSearchChange,
}) {
  return (
    <header className="bg-ink-900 text-white">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3 mr-2">
          <div className="w-9 h-9 rounded-md bg-accent-500 grid place-items-center font-display text-2xl leading-none font-bold">A</div>
          <div className="leading-tight">
            <div className="heading-display text-2xl font-bold uppercase tracking-wide">AutoGrid</div>
            <div className="text-xs text-slate-300 hidden sm:block">Listings from Cars.com · CarGurus · AutoTrader</div>
          </div>
        </div>

        <div className="flex-1 min-w-[220px]">
          <label className="relative block">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search make, model, trim, keywords…"
              className="w-full pl-10 pr-4 py-2 rounded-md bg-ink-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </label>
        </div>

        <button
          className="lg:hidden btn-ghost bg-ink-800 border-ink-700 text-white hover:bg-ink-700"
          onClick={onOpenFilters}
        >
          Filters{activeFilterCount > 0 && (
            <span className="ml-2 chip bg-accent-500 text-white">{activeFilterCount}</span>
          )}
        </button>

        <div className="text-xs text-slate-300 hidden md:block">
          Last updated: <span className="text-white font-medium">{timeAgo(lastScrapeAt)}</span>
        </div>
        <button onClick={onRefresh} disabled={refreshing} className="btn-accent">
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
    </header>
  );
}
