/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { fetchListing } from '../lib/api.js';
import {
  carTitle,
  colorSwatch,
  daysAgoText,
  fmtMiles,
  fmtNumber,
  fmtPrice,
  titleCase,
} from '../lib/format.js';
import {
  IconBody,
  IconCalendar,
  IconChevron,
  IconChevronLeft,
  IconClose,
  IconColor,
  IconDrive,
  IconExternal,
  IconFuel,
  IconGear,
  IconLocation,
  IconOdometer,
  IconPhone,
} from './Icons.jsx';

export default function ListingDetailModal({ listing, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [photoIdx, setPhotoIdx] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    fetchListing(listing.id, ctrl.signal)
      .then((d) => setDetail(d))
      .catch((e) => {
        if (e.name !== 'AbortError') setError(e.message);
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [listing.id]);

  // Esc to close
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'ArrowLeft') prevPhoto();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  });

  const photos =
    detail?.photos?.length
      ? detail.photos
      : listing.imageUrl
        ? [listing.imageUrl]
        : [];

  const mapped = detail?.mapped || listing;
  const build = detail?.build || {};
  const dealer = detail?.dealer || {};
  const priceTier =
    detail?.price_change_percent || detail?.market_status?.price_state;

  const nextPhoto = () =>
    setPhotoIdx((i) => (photos.length ? (i + 1) % photos.length : 0));
  const prevPhoto = () =>
    setPhotoIdx((i) =>
      photos.length ? (i - 1 + photos.length) % photos.length : 0
    );

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/80 backdrop-blur md:items-start md:py-8">
      <div
        className="ag-modal-enter relative flex h-full w-full max-w-5xl flex-col overflow-hidden bg-bg-primary md:h-auto md:max-h-[92vh] md:rounded-2xl md:border md:border-border md:shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-bg-primary/95 px-4 py-3 backdrop-blur md:px-6">
          <div className="min-w-0 flex-1">
            <div className="truncate font-display text-xl font-extrabold md:text-2xl">
              {carTitle(mapped)}{' '}
              {mapped.trim && (
                <span className="font-bold text-text-secondary">
                  {mapped.trim}
                </span>
              )}
            </div>
            <div className="font-display text-2xl font-extrabold text-price md:text-3xl">
              {fmtPrice(mapped.price)}
            </div>
          </div>
          {mapped.sourceUrl && (
            <a
              href={mapped.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white hover:bg-blue-600 sm:flex"
            >
              View Full Listing
              <IconExternal className="h-4 w-4" />
            </a>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-text-secondary hover:bg-bg-card-hover"
            aria-label="Close"
          >
            <IconClose />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="m-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Photo gallery */}
          <div className="bg-black">
            <div className="relative aspect-video w-full overflow-hidden bg-bg-card">
              {photos.length > 0 ? (
                <img
                  src={photos[photoIdx]}
                  alt={`${carTitle(mapped)} photo ${photoIdx + 1}`}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-display text-4xl font-extrabold text-border">
                  {(mapped.make || 'AG').slice(0, 1)}
                  {(mapped.model || '').slice(0, 1)}
                </div>
              )}

              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevPhoto}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
                    aria-label="Previous photo"
                  >
                    <IconChevronLeft />
                  </button>
                  <button
                    type="button"
                    onClick={nextPhoto}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
                    aria-label="Next photo"
                  >
                    <IconChevron />
                  </button>
                  <div className="absolute bottom-3 right-3 rounded-md bg-black/70 px-2 py-0.5 text-xs font-medium text-white">
                    {photoIdx + 1} / {photos.length}
                  </div>
                </>
              )}
            </div>

            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-3">
                {photos.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPhotoIdx(i)}
                    className={`h-16 w-24 shrink-0 overflow-hidden rounded-md border-2 transition ${
                      i === photoIdx
                        ? 'border-accent'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={p}
                      alt={`thumb ${i + 1}`}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Key stats bar */}
          <div className="grid grid-cols-2 gap-3 border-b border-border bg-bg-card px-4 py-4 md:grid-cols-4 md:px-6 lg:grid-cols-7">
            <Stat
              icon={<IconOdometer className="h-4 w-4" />}
              label="Mileage"
              value={fmtMiles(mapped.mileage)}
            />
            <Stat
              icon={<IconCalendar className="h-4 w-4" />}
              label="Year"
              value={mapped.year}
            />
            <Stat
              icon={<IconBody className="h-4 w-4" />}
              label="Body"
              value={titleCase(mapped.bodyStyle)}
            />
            <Stat
              icon={<IconFuel className="h-4 w-4" />}
              label="Fuel"
              value={titleCase(mapped.fuelType)}
            />
            <Stat
              icon={<IconGear className="h-4 w-4" />}
              label="Trans"
              value={titleCase(mapped.transmission)}
            />
            <Stat
              icon={<IconDrive className="h-4 w-4" />}
              label="Drive"
              value={mapped.drivetrain}
            />
            <Stat
              icon={<IconColor className="h-4 w-4" />}
              label="Color"
              value={titleCase(mapped.exteriorColor)}
              swatch={mapped.exteriorColor}
            />
          </div>

          <div className="grid gap-6 p-4 md:p-6 lg:grid-cols-3">
            {/* Specs */}
            <section className="lg:col-span-2">
              <h3 className="mb-3 font-display text-lg font-bold">Specs</h3>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                <SpecRow label="VIN" value={mapped.vin} mono />
                <SpecRow label="Engine" value={titleCase(build.engine || mapped.engine)} />
                <SpecRow label="MPG City" value={mapped.mpgCity} />
                <SpecRow label="MPG Highway" value={mapped.mpgHighway} />
                <SpecRow
                  label="Interior Color"
                  value={titleCase(mapped.interiorColor)}
                />
                <SpecRow label="Doors" value={build.doors} />
                <SpecRow
                  label="Drive Type"
                  value={mapped.drivetrain}
                />
                <SpecRow label="Cylinders" value={build.cylinders} />
                <SpecRow
                  label="Displacement"
                  value={
                    build.engine_size ? `${build.engine_size}L` : null
                  }
                />
                <SpecRow
                  label="Transmission"
                  value={titleCase(mapped.transmission)}
                />
                <SpecRow label="Body Style" value={titleCase(mapped.bodyStyle)} />
                <SpecRow
                  label="Fuel Type"
                  value={titleCase(mapped.fuelType)}
                />
              </dl>
            </section>

            {/* Sidebar: dealer + price analysis */}
            <aside className="space-y-4">
              <div className="rounded-xl border border-border bg-bg-card p-4">
                <h3 className="mb-2 font-display text-base font-bold">
                  Dealer
                </h3>
                <div className="font-medium">
                  {dealer.name || mapped.dealerName || '—'}
                </div>
                {(mapped.dealerCity || mapped.dealerState) && (
                  <div className="mt-1 flex items-center gap-1.5 text-sm text-text-secondary">
                    <IconLocation className="h-3.5 w-3.5" />
                    {[titleCase(mapped.dealerCity), mapped.dealerState]
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                )}
                {mapped.dealerPhone && (
                  <a
                    href={`tel:${mapped.dealerPhone}`}
                    className="mt-3 flex items-center gap-2 rounded-lg bg-bg-card-hover px-3 py-2 text-sm font-medium hover:bg-border"
                  >
                    <IconPhone className="h-4 w-4 text-accent" />
                    {mapped.dealerPhone}
                  </a>
                )}
                {typeof mapped.daysOnMarket === 'number' && (
                  <div className="mt-3 text-xs text-text-secondary">
                    {daysAgoText(mapped.daysOnMarket)} ·{' '}
                    {mapped.daysOnMarket} days on market
                  </div>
                )}
              </div>

              {priceTier && (
                <div className="rounded-xl border border-border bg-bg-card p-4">
                  <h3 className="mb-2 font-display text-base font-bold">
                    Price Analysis
                  </h3>
                  <div className="text-sm text-text-secondary">
                    {typeof priceTier === 'number'
                      ? `${priceTier > 0 ? '+' : ''}${fmtNumber(priceTier)}% vs. recent market`
                      : titleCase(String(priceTier))}
                  </div>
                </div>
              )}

              {mapped.sourceUrl && (
                <a
                  href={mapped.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-3 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 sm:hidden"
                >
                  View Full Listing
                  <IconExternal className="h-4 w-4" />
                </a>
              )}
            </aside>
          </div>

          {loading && (
            <div className="px-6 pb-6 text-xs text-text-secondary">
              Loading full details…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, swatch }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-xs text-text-secondary">
        {icon}
        {label}
      </div>
      <div className="flex items-center gap-1.5 text-sm font-medium">
        {swatch && (
          <span
            className="inline-block h-3 w-3 rounded-full border border-black/30"
            style={{ background: colorSwatch(swatch) }}
          />
        )}
        {value || '—'}
      </div>
    </div>
  );
}

function SpecRow({ label, value, mono }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/60 py-1.5 text-sm">
      <dt className="text-text-secondary">{label}</dt>
      <dd
        className={`text-right font-medium ${mono ? 'font-mono text-xs' : ''}`}
      >
        {value || '—'}
      </dd>
    </div>
  );
}
