import React from 'react';
import SourceBadge from './SourceBadge.jsx';
import { fmtPrice, fmtMiles } from '../format.js';

export default function ListingCard({ listing, onSelect, view }) {
  const sources = listing.sources || [];
  const prices = sources.map((s) => s.price).filter((p) => typeof p === 'number');
  const hasPriceSpread = prices.length > 1 && Math.max(...prices) - Math.min(...prices) > 200;

  if (view === 'list') {
    return (
      <article
        onClick={() => onSelect(listing.id)}
        className="bg-white border border-slate-200 rounded-lg shadow-card card-hover hover:shadow-cardHover overflow-hidden cursor-pointer flex flex-col sm:flex-row"
      >
        <div className="sm:w-72 sm:shrink-0 aspect-[4/3] sm:aspect-auto bg-slate-100">
          <img src={listing.imageUrl} alt={listing.title} loading="lazy" className="w-full h-full object-cover" />
        </div>
        <div className="p-4 flex-1 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <h3 className="heading-display text-xl font-bold uppercase leading-tight">{listing.title}</h3>
            <div className="text-right">
              <div className="text-2xl font-bold text-accent-500">{fmtPrice(listing.price)}</div>
              {hasPriceSpread && <div className="text-xs text-emerald-600 font-semibold">Best Price</div>}
            </div>
          </div>
          <div className="text-sm text-ink-500 flex flex-wrap gap-x-4 gap-y-1">
            <span>{fmtMiles(listing.mileage)}</span>
            {listing.location && <span>{listing.location}</span>}
            {listing.transmission && <span>{listing.transmission}</span>}
            {listing.drivetrain && <span>{listing.drivetrain}</span>}
          </div>
          {listing.description && (
            <p className="text-sm text-ink-700 line-clamp-2">{listing.description}</p>
          )}
          <div className="flex items-center gap-2 mt-auto pt-2 flex-wrap">
            {sources.map((s) => <SourceBadge key={s.site + s.listingId} site={s.site} />)}
            {sources.length > 1 && (
              <span className="text-xs text-ink-500 font-medium">Listed on {sources.length} sites</span>
            )}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      onClick={() => onSelect(listing.id)}
      className="bg-white border border-slate-200 rounded-lg shadow-card card-hover hover:shadow-cardHover overflow-hidden cursor-pointer flex flex-col"
    >
      <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
        <img src={listing.imageUrl} alt={listing.title} loading="lazy" className="w-full h-full object-cover" />
      </div>
      <div className="p-4 flex-1 flex flex-col gap-2">
        <h3 className="heading-display text-lg font-bold uppercase leading-tight line-clamp-2">{listing.title}</h3>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold text-accent-500">{fmtPrice(listing.price)}</span>
          {hasPriceSpread && <span className="text-xs text-emerald-600 font-semibold">Best Price</span>}
        </div>
        <div className="text-sm text-ink-500 flex justify-between">
          <span>{fmtMiles(listing.mileage)}</span>
          {listing.location && <span className="truncate ml-2">{listing.location}</span>}
        </div>
        <div className="flex items-center gap-1.5 mt-auto pt-2 flex-wrap">
          {sources.map((s) => <SourceBadge key={s.site + s.listingId} site={s.site} />)}
        </div>
      </div>
    </article>
  );
}
