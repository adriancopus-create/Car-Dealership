/* eslint-disable react/prop-types */
import { titleCase } from '../lib/format.js';
import { IconClose } from './Icons.jsx';

export default function ActiveFilterPills({ filters, onChange, onClear }) {
  const pills = [];

  const push = (key, label, reset) =>
    pills.push({ key, label, reset });

  if (filters.zip)
    push('zip', `ZIP ${filters.zip} · ${filters.radius}mi`, { zip: '' });
  if (filters.q) push('q', `"${filters.q}"`, { q: '' });
  if (filters.carType)
    push('carType', titleCase(filters.carType), { carType: '' });
  if (filters.make) push('make', filters.make, { make: '', model: '' });
  if (filters.model) push('model', filters.model, { model: '' });
  if (filters.transmission)
    push('transmission', filters.transmission, { transmission: '' });

  if ((filters.priceMin && filters.priceMin > 0) || (filters.priceMax && filters.priceMax < 150000)) {
    const lo = filters.priceMin ? `$${(filters.priceMin / 1000).toFixed(0)}k` : '$0';
    const hi = filters.priceMax && filters.priceMax < 150000
      ? `$${(filters.priceMax / 1000).toFixed(0)}k`
      : 'Any';
    push('price', `${lo} – ${hi}`, { priceMin: 0, priceMax: 150000 });
  }
  if ((filters.mileageMin && filters.mileageMin > 0) || (filters.mileageMax && filters.mileageMax < 250000)) {
    const lo = `${((filters.mileageMin || 0) / 1000).toFixed(0)}k`;
    const hi = `${((filters.mileageMax || 250000) / 1000).toFixed(0)}k`;
    push('mileage', `${lo} – ${hi} mi`, { mileageMin: 0, mileageMax: 250000 });
  }
  if (
    (filters.yearMin && filters.yearMin > 1990) ||
    (filters.yearMax && filters.yearMax < new Date().getFullYear())
  ) {
    push(
      'year',
      `${filters.yearMin || 1990} – ${filters.yearMax || new Date().getFullYear()}`,
      { yearMin: 1990, yearMax: new Date().getFullYear() }
    );
  }

  for (const b of filters.bodyStyles)
    pills.push({
      key: `body-${b}`,
      label: b,
      reset: { bodyStyles: filters.bodyStyles.filter((x) => x !== b) },
    });
  for (const f of filters.fuelTypes)
    pills.push({
      key: `fuel-${f}`,
      label: f,
      reset: { fuelTypes: filters.fuelTypes.filter((x) => x !== f) },
    });
  for (const d of filters.drivetrains)
    pills.push({
      key: `drive-${d}`,
      label: d,
      reset: { drivetrains: filters.drivetrains.filter((x) => x !== d) },
    });
  for (const c of filters.colors)
    pills.push({
      key: `color-${c}`,
      label: titleCase(c),
      reset: { colors: filters.colors.filter((x) => x !== c) },
    });

  if (pills.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 pt-3 md:px-6">
      {pills.map((p) => (
        <button
          key={p.key}
          type="button"
          onClick={() => onChange(p.reset)}
          className="flex items-center gap-1 rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-accent ring-1 ring-accent/30 hover:bg-accent/25"
        >
          {p.label}
          <IconClose className="h-3 w-3" />
        </button>
      ))}
      <button
        type="button"
        onClick={onClear}
        className="rounded-full px-3 py-1 text-xs font-medium text-text-secondary hover:text-text-primary"
      >
        Clear All
      </button>
    </div>
  );
}
