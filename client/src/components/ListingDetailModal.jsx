import React, { useEffect, useState } from 'react';
import { fetchListing } from '../api.js';
import { fmtPrice, fmtMiles } from '../format.js';
import SourceBadge from './SourceBadge.jsx';

function Spec({ label, value }) {
  if (value == null || value === '') return null;
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-ink-500">{label}</div>
      <div className="text-sm font-medium text-ink-800">{value}</div>
    </div>
  );
}

export default function ListingDetailModal({ id, onClose }) {
  const [listing, setListing] = useState(null);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchListing(id).then((d) => { if (!cancelled) setListing(d); });
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute inset-0 overflow-y-auto">
        <div className="min-h-full flex items-start justify-center py-6 px-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl">
            {!listing ? (
              <div className="p-8 space-y-3">
                <div className="aspect-[16/9] skeleton" />
                <div className="h-6 skeleton w-2/3" />
                <div className="h-4 skeleton w-full" />
                <div className="h-4 skeleton w-5/6" />
              </div>
            ) : (
              <article>
                <div className="relative aspect-[16/9] bg-slate-100 overflow-hidden rounded-t-lg">
                  <img
                    src={(listing.images && listing.images[activeImg]) || listing.imageUrl}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={onClose}
                    className="absolute top-3 right-3 bg-white/90 rounded-full w-9 h-9 grid place-items-center hover:bg-white"
                    aria-label="Close"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                  </button>
                </div>

                {listing.images && listing.images.length > 1 && (
                  <div className="px-6 pt-4 flex gap-2 overflow-x-auto">
                    {listing.images.map((src, i) => (
                      <button
                        key={src + i}
                        onClick={() => setActiveImg(i)}
                        className={`shrink-0 w-20 h-14 rounded overflow-hidden border-2 ${i === activeImg ? 'border-accent-500' : 'border-transparent'}`}
                      >
                        <img src={src} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="p-6 space-y-6">
                  <div className="flex items-start justify-between gap-6 flex-wrap">
                    <div>
                      <h2 className="heading-display text-3xl font-bold uppercase leading-tight">{listing.title}</h2>
                      <div className="text-ink-500 mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                        <span>{fmtMiles(listing.mileage)}</span>
                        {listing.location && <span>{listing.location}</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        {(listing.sources || []).map((s) => (
                          <SourceBadge key={s.site + s.listingId} site={s.site} />
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-accent-500">{fmtPrice(listing.price)}</div>
                      {(listing.sources || []).length > 1 && (
                        <div className="text-xs text-ink-500 mt-1">Lowest of {listing.sources.length} listings</div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(listing.sources || []).map((s) => (
                      <a
                        key={s.url}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-accent"
                      >
                        View on {s.site} {typeof s.price === 'number' ? `· ${fmtPrice(s.price)}` : ''}
                      </a>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <Spec label="Year" value={listing.year} />
                    <Spec label="Make" value={listing.make} />
                    <Spec label="Model" value={listing.model} />
                    <Spec label="Trim" value={listing.trim} />
                    <Spec label="Body Style" value={listing.bodyStyle} />
                    <Spec label="Engine" value={listing.engine} />
                    <Spec label="Transmission" value={listing.transmission} />
                    <Spec label="Drivetrain" value={listing.drivetrain} />
                    <Spec label="Fuel Type" value={listing.fuelType} />
                    <Spec label="MPG City/Hwy" value={
                      listing.mpgCity || listing.mpgHighway
                        ? `${listing.mpgCity ?? '—'} / ${listing.mpgHighway ?? '—'}`
                        : null
                    } />
                    <Spec label="Exterior" value={listing.exteriorColor} />
                    <Spec label="Interior" value={listing.interiorColor} />
                    <Spec label="VIN" value={listing.vin} />
                  </div>

                  {listing.description && (
                    <div>
                      <h3 className="heading-display text-xl font-bold uppercase mb-2">Description</h3>
                      <p className="text-ink-700 whitespace-pre-line">{listing.description}</p>
                    </div>
                  )}

                  {(listing.dealerName || listing.dealerPhone) && (
                    <div className="border-t border-slate-200 pt-4">
                      <h3 className="heading-display text-xl font-bold uppercase mb-2">Dealer</h3>
                      <div className="text-sm text-ink-700">
                        {listing.dealerName && <div className="font-medium">{listing.dealerName}</div>}
                        {listing.location && <div className="text-ink-500">{listing.location}</div>}
                        {listing.dealerPhone && (
                          <a href={`tel:${listing.dealerPhone}`} className="text-accent-500 hover:underline">{listing.dealerPhone}</a>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between pt-2">
                    <button onClick={onClose} className="btn-ghost">← Back to results</button>
                  </div>
                </div>
              </article>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
