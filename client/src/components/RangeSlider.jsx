/* eslint-disable react/prop-types */
import { useMemo } from 'react';

export default function RangeSlider({
  min,
  max,
  step = 1,
  value,
  onChange,
  formatLabel = (v) => v,
}) {
  const [lo, hi] = value;
  const pctLo = useMemo(
    () => ((lo - min) / (max - min)) * 100,
    [lo, min, max]
  );
  const pctHi = useMemo(
    () => ((hi - min) / (max - min)) * 100,
    [hi, min, max]
  );

  const handleLo = (e) => {
    const v = Math.min(Number(e.target.value), hi - step);
    onChange([v, hi]);
  };
  const handleHi = (e) => {
    const v = Math.max(Number(e.target.value), lo + step);
    onChange([lo, v]);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs text-text-secondary">
        <span>{formatLabel(lo)}</span>
        <span>{formatLabel(hi)}</span>
      </div>
      <div className="relative h-6">
        {/* Track */}
        <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-border" />
        {/* Active fill */}
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-accent"
          style={{ left: `${pctLo}%`, right: `${100 - pctHi}%` }}
        />
        <input
          type="range"
          className="ag-range"
          min={min}
          max={max}
          step={step}
          value={lo}
          onChange={handleLo}
        />
        <input
          type="range"
          className="ag-range"
          min={min}
          max={max}
          step={step}
          value={hi}
          onChange={handleHi}
        />
      </div>
    </div>
  );
}
