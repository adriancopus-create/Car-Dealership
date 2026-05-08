/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { fetchModels } from '../lib/api.js';
import { titleCase, colorSwatch } from '../lib/format.js';
import RangeSlider from './RangeSlider.jsx';
import SearchableSelect from './SearchableSelect.jsx';
import { IconClose, IconSearch } from './Icons.jsx';

const BODY_STYLES = [
  'SUV',
  'Sedan',
  'Truck',
  'Coupe',
  'Van',
  'Wagon',
  'Convertible',
  'Hatchback',
];
const FUEL_TYPES = ['Gas', 'Hybrid', 'Electric', 'Diesel', 'Plug-in Hybrid'];
const DRIVETRAINS = ['FWD', 'RWD', 'AWD', '4WD'];
const RADII = [25, 50, 100, 250, 500];

export default function FilterSidebar({
  filters,
  setFilters,
  options,
  open,
  onClose,
}) {
  const [models, setModels] = useState([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [noMaxPrice, setNoMaxPrice] = useState(filters.priceMax >= 150000);

  // Load models when make changes
  useEffect(() => {
    let active = true;
    if (!filters.make) {
      setModels([]);
      return;
    }
    setLoadingModels(true);
    fetchModels(filters.make)
      .then((d) => active && setModels(d.models || []))
      .catch(() => active && setModels([]))
      .finally(() => active && setLoadingModels(false));
    return () => {
      active = false;
    };
  }, [filters.make]);

  const toggleArr = (key, val) => {
    const list = filters[key] || [];
    const next = list.includes(val)
      ? list.filter((x) => x !== val)
      : [...list, val];
    setFilters({ ...filters, [key]: next });
  };

  const set = (patch) => setFilters({ ...filters, ...patch });

  const inner = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3 lg:hidden">
        <div className="font-display text-lg font-bold">Filters</div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-text-secondary hover:bg-bg-card-hover"
        >
          <IconClose />
        </button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        {/* Location */}
        <Section title="Location">
          <div className="space-y-2">
            <input
              type="text"
              maxLength={5}
              inputMode="numeric"
              placeholder="ZIP code"
              value={filters.zip}
              onChange={(e) =>
                set({ zip: e.target.value.replace(/\D/g, '').slice(0, 5) })
              }
              className="w-full rounded-lg border border-border bg-bg-primary px-3 py-2 text-sm placeholder:text-text-secondary focus:border-accent focus:outline-none"
            />
            <select
              value={filters.radius}
              onChange={(e) => set({ radius: Number(e.target.value) })}
              className="w-full rounded-lg border border-border bg-bg-primary px-3 py-2 text-sm focus:border-accent focus:outline-none"
            >
              {RADII.map((r) => (
                <option key={r} value={r}>
                  Within {r} miles
                </option>
              ))}
            </select>
          </div>
        </Section>

        {/* Search */}
        <Section title="Search">
          <div className="relative">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Make, model, trim…"
              value={filters.q}
              onChange={(e) => set({ q: e.target.value })}
              className="w-full rounded-lg border border-border bg-bg-primary py-2 pl-9 pr-3 text-sm placeholder:text-text-secondary focus:border-accent focus:outline-none"
            />
          </div>
        </Section>

        {/* Vehicle Type */}
        <Section title="Vehicle Type">
          <div className="grid grid-cols-2 gap-2">
            {[
              { v: '', label: 'All' },
              { v: 'new', label: 'New' },
              { v: 'used', label: 'Used' },
              { v: 'certified', label: 'CPO' },
            ].map((o) => (
              <button
                key={o.label}
                type="button"
                onClick={() => set({ carType: o.v })}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  filters.carType === o.v
                    ? 'border-accent bg-accent text-white'
                    : 'border-border bg-bg-primary text-text-primary hover:bg-bg-card-hover'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </Section>

        {/* Price */}
        <Section title="Price">
          <RangeSlider
            min={0}
            max={150000}
            step={500}
            value={[filters.priceMin || 0, noMaxPrice ? 150000 : filters.priceMax || 150000]}
            onChange={([lo, hi]) => {
              set({ priceMin: lo, priceMax: hi });
              if (hi < 150000) setNoMaxPrice(false);
            }}
            formatLabel={(v) =>
              v >= 150000 ? '$150k+' : `$${(v / 1000).toFixed(0)}k`
            }
          />
          <div className="mt-3 flex items-center gap-2">
            <NumberInput
              prefix="$"
              value={filters.priceMin}
              onChange={(v) => set({ priceMin: v })}
              placeholder="Min"
            />
            <span className="text-text-secondary">–</span>
            <NumberInput
              prefix="$"
              value={noMaxPrice ? '' : filters.priceMax}
              onChange={(v) => {
                set({ priceMax: v });
                if (v) setNoMaxPrice(false);
              }}
              placeholder="Max"
              disabled={noMaxPrice}
            />
          </div>
          <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs text-text-secondary">
            <input
              type="checkbox"
              checked={noMaxPrice}
              onChange={(e) => {
                setNoMaxPrice(e.target.checked);
                set({
                  priceMax: e.target.checked ? 150000 : 60000,
                });
              }}
              className="h-3.5 w-3.5 rounded border-border bg-bg-primary text-accent"
            />
            No Max
          </label>
        </Section>

        {/* Mileage */}
        <Section title="Mileage">
          <RangeSlider
            min={0}
            max={250000}
            step={1000}
            value={[filters.mileageMin || 0, filters.mileageMax || 250000]}
            onChange={([lo, hi]) => set({ mileageMin: lo, mileageMax: hi })}
            formatLabel={(v) =>
              `${(v / 1000).toFixed(0)}k mi`
            }
          />
        </Section>

        {/* Year */}
        <Section title="Year">
          <RangeSlider
            min={1990}
            max={options?.yearRange?.max || new Date().getFullYear()}
            step={1}
            value={[
              filters.yearMin || 1990,
              filters.yearMax ||
                options?.yearRange?.max ||
                new Date().getFullYear(),
            ]}
            onChange={([lo, hi]) => set({ yearMin: lo, yearMax: hi })}
            formatLabel={(v) => v}
          />
        </Section>

        {/* Make / Model */}
        <Section title="Make">
          <SearchableSelect
            value={filters.make}
            onChange={(v) => set({ make: v, model: '' })}
            options={options?.makes || []}
            placeholder="Any make"
          />
        </Section>
        <Section title="Model">
          <SearchableSelect
            value={filters.model}
            onChange={(v) => set({ model: v })}
            options={models}
            placeholder={
              filters.make
                ? loadingModels
                  ? 'Loading…'
                  : 'Any model'
                : 'Pick a make first'
            }
            disabled={!filters.make || loadingModels}
          />
        </Section>

        {/* Body Style */}
        <Section title="Body Style">
          <div className="flex flex-wrap gap-2">
            {BODY_STYLES.map((b) => {
              const active = filters.bodyStyles.includes(b);
              return (
                <button
                  key={b}
                  type="button"
                  onClick={() => toggleArr('bodyStyles', b)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    active
                      ? 'border-accent bg-accent text-white'
                      : 'border-border bg-bg-primary text-text-primary hover:bg-bg-card-hover'
                  }`}
                >
                  {b}
                </button>
              );
            })}
          </div>
        </Section>

        {/* Fuel */}
        <Section title="Fuel Type">
          <div className="flex flex-wrap gap-2">
            {FUEL_TYPES.map((f) => {
              const active = filters.fuelTypes.includes(f);
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => toggleArr('fuelTypes', f)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    active
                      ? 'border-accent bg-accent text-white'
                      : 'border-border bg-bg-primary text-text-primary hover:bg-bg-card-hover'
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </Section>

        {/* Transmission */}
        <Section title="Transmission">
          <div className="grid grid-cols-3 gap-2">
            {[
              { v: '', label: 'Any' },
              { v: 'Automatic', label: 'Auto' },
              { v: 'Manual', label: 'Manual' },
            ].map((o) => (
              <button
                key={o.label}
                type="button"
                onClick={() => set({ transmission: o.v })}
                className={`rounded-lg border px-2 py-2 text-xs font-medium transition ${
                  filters.transmission === o.v
                    ? 'border-accent bg-accent text-white'
                    : 'border-border bg-bg-primary text-text-primary hover:bg-bg-card-hover'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </Section>

        {/* Drivetrain */}
        <Section title="Drivetrain">
          <div className="flex flex-wrap gap-2">
            {DRIVETRAINS.map((d) => {
              const active = filters.drivetrains.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleArr('drivetrains', d)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                    active
                      ? 'border-accent bg-accent text-white'
                      : 'border-border bg-bg-primary text-text-primary hover:bg-bg-card-hover'
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </Section>

        {/* Exterior color swatches */}
        <Section title="Exterior Color">
          <div className="grid grid-cols-6 gap-2">
            {(options?.colors || [])
              .slice(0, 18)
              .map((c) => {
                const active = filters.colors.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    title={titleCase(c)}
                    onClick={() => toggleArr('colors', c)}
                    className={`group flex aspect-square items-center justify-center rounded-lg border transition ${
                      active
                        ? 'border-accent ring-2 ring-accent/40'
                        : 'border-border hover:border-text-secondary'
                    }`}
                  >
                    <span
                      className="block h-5 w-5 rounded-full border border-black/30"
                      style={{ background: colorSwatch(c) }}
                    />
                  </button>
                );
              })}
          </div>
        </Section>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-[280px] shrink-0 border-r border-border bg-bg-card lg:block">
        {inner}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={onClose}
          />
          <aside className="fixed bottom-0 left-0 top-0 z-50 w-[88vw] max-w-[320px] border-r border-border bg-bg-card lg:hidden">
            {inner}
          </aside>
        </>
      )}
    </>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <div className="mb-2 font-display text-xs font-bold uppercase tracking-wider text-text-secondary">
        {title}
      </div>
      {children}
    </div>
  );
}

function NumberInput({ prefix, value, onChange, placeholder, disabled }) {
  return (
    <div
      className={`flex flex-1 items-center rounded-lg border border-border bg-bg-primary px-2 ${
        disabled ? 'opacity-50' : ''
      }`}
    >
      {prefix && (
        <span className="pr-1 text-xs text-text-secondary">{prefix}</span>
      )}
      <input
        type="number"
        disabled={disabled}
        value={value ?? ''}
        onChange={(e) =>
          onChange(e.target.value ? Number(e.target.value) : '')
        }
        placeholder={placeholder}
        className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-text-secondary"
      />
    </div>
  );
}
