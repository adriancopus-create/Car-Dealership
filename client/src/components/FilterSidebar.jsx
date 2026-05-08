import React, { useMemo } from 'react';
import RangeSlider from './RangeSlider.jsx';
import MultiSelect from './MultiSelect.jsx';
import { fmtPrice, fmtMiles } from '../format.js';

const BODY_STYLES = ['Sedan', 'SUV', 'Truck', 'Coupe', 'Convertible', 'Van', 'Wagon', 'Hatchback'];
const FUEL_TYPES = ['Gas', 'Hybrid', 'Electric', 'Diesel', 'Plug-in Hybrid'];
const TRANSMISSIONS = ['Automatic', 'Manual', 'CVT'];
const DRIVETRAINS = ['FWD', 'RWD', 'AWD', '4WD'];
const SOURCES = ['Cars.com', 'CarGurus', 'AutoTrader'];

export default function FilterSidebar({
  filters, setFilters, options, activeCount, onClear, drawerOpen, onCloseDrawer,
}) {
  const set = (patch) => setFilters((f) => ({ ...f, ...patch }));

  const priceRange = options?.priceRange || { min: 0, max: 150000 };
  const mileageRange = options?.mileageRange || { min: 0, max: 200000 };
  const yearRange = options?.yearRange || { min: 1990, max: new Date().getFullYear() };

  const priceVal = [
    Number.isFinite(parseFloat(filters.minPrice)) ? parseFloat(filters.minPrice) : priceRange.min,
    Number.isFinite(parseFloat(filters.maxPrice)) ? parseFloat(filters.maxPrice) : priceRange.max,
  ];
  const mileVal = [
    Number.isFinite(parseFloat(filters.minMileage)) ? parseFloat(filters.minMileage) : mileageRange.min,
    Number.isFinite(parseFloat(filters.maxMileage)) ? parseFloat(filters.maxMileage) : mileageRange.max,
  ];
  const yearVal = [
    Number.isFinite(parseFloat(filters.minYear)) ? parseFloat(filters.minYear) : yearRange.min,
    Number.isFinite(parseFloat(filters.maxYear)) ? parseFloat(filters.maxYear) : yearRange.max,
  ];

  // Models filtered by selected makes (data is array of {a: make, b: model})
  const availableModels = useMemo(() => {
    if (!options?.models) return [];
    if (!filters.make.length) return [...new Set(options.models.map((m) => m.b))];
    const set = new Set();
    options.models.forEach((m) => { if (filters.make.includes(m.a)) set.add(m.b); });
    return [...set];
  }, [options, filters.make]);

  const content = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="heading-display text-xl font-bold uppercase">Filters</h2>
        {activeCount > 0 && (
          <button className="text-xs text-accent-500 hover:underline font-medium" onClick={onClear}>
            Clear all ({activeCount})
          </button>
        )}
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-500 mb-2">Price</h3>
        <RangeSlider
          min={priceRange.min} max={Math.max(priceRange.max, 150000)} step={500}
          value={priceVal}
          onChange={([lo, hi]) => set({ minPrice: lo, maxPrice: hi })}
          format={fmtPrice}
        />
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-500 mb-2">Mileage</h3>
        <RangeSlider
          min={mileageRange.min} max={Math.max(mileageRange.max, 200000)} step={1000}
          value={mileVal}
          onChange={([lo, hi]) => set({ minMileage: lo, maxMileage: hi })}
          format={fmtMiles}
        />
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-500 mb-2">Year</h3>
        <RangeSlider
          min={yearRange.min} max={yearRange.max} step={1}
          value={yearVal}
          onChange={([lo, hi]) => set({ minYear: lo, maxYear: hi })}
        />
      </div>

      <MultiSelect
        label="Make"
        options={options?.makes || []}
        values={filters.make}
        onChange={(v) => set({ make: v, model: [] })}
      />
      <MultiSelect
        label="Model"
        options={availableModels}
        values={filters.model}
        onChange={(v) => set({ model: v })}
      />
      <MultiSelect
        label="Body Style"
        options={(options?.bodyStyles?.length ? options.bodyStyles : BODY_STYLES)}
        values={filters.bodyStyle}
        onChange={(v) => set({ bodyStyle: v })}
      />
      <MultiSelect
        label="Fuel Type"
        options={(options?.fuelTypes?.length ? options.fuelTypes : FUEL_TYPES)}
        values={filters.fuelType}
        onChange={(v) => set({ fuelType: v })}
      />
      <MultiSelect
        label="Transmission"
        options={(options?.transmissions?.length ? options.transmissions : TRANSMISSIONS)}
        values={filters.transmission}
        onChange={(v) => set({ transmission: v })}
      />
      <MultiSelect
        label="Drivetrain"
        options={(options?.drivetrains?.length ? options.drivetrains : DRIVETRAINS)}
        values={filters.drivetrain}
        onChange={(v) => set({ drivetrain: v })}
      />
      <MultiSelect
        label="Exterior Color"
        options={options?.exteriorColors || []}
        values={filters.exteriorColor}
        onChange={(v) => set({ exteriorColor: v })}
      />
      <MultiSelect
        label="Source Site"
        options={(options?.sources?.length ? options.sources : SOURCES)}
        values={filters.source}
        onChange={(v) => set({ source: v })}
      />
    </div>
  );

  return (
    <>
      {/* Desktop sticky sidebar */}
      <aside className="hidden lg:block self-start sticky top-6 max-h-[calc(100vh-4rem)] overflow-y-auto bg-white border border-slate-200 rounded-lg p-5 shadow-card">
        {content}
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={onCloseDrawer} />
          <aside className="absolute left-0 top-0 bottom-0 w-[88%] max-w-sm bg-white p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="heading-display text-xl font-bold uppercase">Filters</span>
              <button className="btn-ghost" onClick={onCloseDrawer}>Done</button>
            </div>
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
