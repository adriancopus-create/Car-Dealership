/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react';
import { IconChevron, IconClose } from './Icons.jsx';

export default function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = 'Any',
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-between rounded-lg border border-border bg-bg-primary px-3 py-2 text-left text-sm ${
          disabled
            ? 'cursor-not-allowed opacity-50'
            : 'hover:border-text-secondary'
        }`}
      >
        <span className={value ? '' : 'text-text-secondary'}>
          {value || placeholder}
        </span>
        <span className="flex items-center gap-1">
          {value && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="rounded p-0.5 text-text-secondary hover:bg-border"
            >
              <IconClose className="h-3.5 w-3.5" />
            </span>
          )}
          <IconChevron
            className={`h-4 w-4 text-text-secondary transition ${open ? 'rotate-90' : ''}`}
          />
        </span>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-bg-card shadow-xl">
          <div className="border-b border-border p-2">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-full rounded-md bg-bg-primary px-2 py-1.5 text-sm outline-none placeholder:text-text-secondary"
            />
          </div>
          <div className="max-h-60 overflow-y-auto py-1 text-sm">
            {filtered.length === 0 && (
              <div className="px-3 py-2 text-text-secondary">No matches</div>
            )}
            {filtered.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => {
                  onChange(o);
                  setOpen(false);
                  setQuery('');
                }}
                className={`flex w-full items-center px-3 py-1.5 text-left hover:bg-bg-card-hover ${
                  o === value ? 'text-accent' : ''
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
