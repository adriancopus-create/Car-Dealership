/* eslint-disable react/prop-types */
import {
  carTitle,
  colorSwatch,
  daysAgoText,
  fmtMiles,
  fmtPrice,
  titleCase,
} from '../lib/format.js';
import { IconCamera, IconLocation, IconOdometer } from './Icons.jsx';

function carInitials(c) {
  const m = (c.make || '').slice(0, 1);
  const mo = (c.model || '').slice(0, 1);
  return `${m}${mo}`.toUpperCase() || 'AG';
}

function badge(carType) {
  const t = (carType || '').toLowerCase();
  if (t === 'new')
    return { label: 'NEW', cls: 'bg-badge-new text-white' };
  if (t === 'certified')
    return { label: 'CPO', cls: 'bg-badge-cpo text-white' };
  return { label: 'USED', cls: 'bg-badge-used text-white' };
}

export default function ListingCard({ car, onClick }) {
  const b = badge(car.carType);
  return (
    <button
      type="button"
      onClick={onClick}
      className="ag-card group flex flex-col overflow-hidden rounded-xl border border-border bg-bg-card text-left"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-bg-card-hover">
        {car.imageUrl ? (
          <img
            src={car.imageUrl}
            alt={carTitle(car)}
            loading="lazy"
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-bg-card-hover to-bg-card">
            <span className="font-display text-3xl font-extrabold text-border">
              {carInitials(car)}
            </span>
          </div>
        )}

        <span
          className={`absolute left-2 top-2 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider ${b.cls}`}
        >
          {b.label}
        </span>

        {car.photoCount > 0 && (
          <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-medium text-white backdrop-blur">
            <IconCamera className="h-3 w-3" />
            {car.photoCount}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="truncate font-display text-base font-bold leading-tight">
              {carTitle(car)}
            </div>
            {car.trim && (
              <div className="truncate text-[13px] text-text-secondary">
                {car.trim}
              </div>
            )}
          </div>
          <div className="shrink-0 font-display text-lg font-extrabold text-price">
            {fmtPrice(car.price)}
          </div>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-secondary">
          <span className="flex items-center gap-1">
            <IconOdometer className="h-3.5 w-3.5" />
            {fmtMiles(car.mileage)}
          </span>
          {(car.dealerCity || car.dealerState) && (
            <span className="flex items-center gap-1">
              <IconLocation className="h-3.5 w-3.5" />
              {[titleCase(car.dealerCity), car.dealerState]
                .filter(Boolean)
                .join(', ')}
            </span>
          )}
        </div>

        <div className="mt-1 flex items-center justify-between text-xs text-text-secondary">
          {car.exteriorColor ? (
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-3 rounded-full border border-black/30"
                style={{ background: colorSwatch(car.exteriorColor) }}
              />
              {titleCase(car.exteriorColor)}
            </span>
          ) : (
            <span />
          )}
          <span>{daysAgoText(car.daysOnMarket)}</span>
        </div>
      </div>
    </button>
  );
}
