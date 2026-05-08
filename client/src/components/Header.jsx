/* eslint-disable react/prop-types */
import { IconFilter } from './Icons.jsx';

export default function Header({ onOpenFilters }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg-primary/90 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-accent to-blue-700 shadow-lg shadow-blue-900/30">
            <svg
              viewBox="0 0 32 32"
              className="h-5 w-5 text-white"
              fill="currentColor"
              aria-hidden
            >
              <path d="M5 19c0-1 .8-2 2-2h.5l1.5-4c.4-1 1.3-1.7 2.4-1.7h9.2c1.1 0 2 .7 2.4 1.7l1.5 4H25c1.1 0 2 1 2 2v3a1 1 0 0 1-1 1h-1a2 2 0 0 1-4 0H11a2 2 0 0 1-4 0H6a1 1 0 0 1-1-1v-3z" />
            </svg>
          </div>
          <div className="leading-tight">
            <div className="font-display text-xl font-extrabold tracking-tight">
              AutoGrid
            </div>
            <div className="hidden text-xs text-text-secondary sm:block">
              Real listings. Every dealer.
            </div>
          </div>
        </div>

        <div className="flex-1" />

        <button
          type="button"
          onClick={onOpenFilters}
          className="flex items-center gap-2 rounded-lg border border-border bg-bg-card px-3 py-2 text-sm font-medium text-text-primary hover:bg-bg-card-hover lg:hidden"
        >
          <IconFilter className="h-4 w-4" />
          Filters
        </button>
      </div>
    </header>
  );
}
