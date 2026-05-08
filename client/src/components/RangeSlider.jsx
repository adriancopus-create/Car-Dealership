import React from 'react';

// Dual-handle range slider built from two stacked native inputs.
export default function RangeSlider({ min, max, step = 1, value, onChange, format = (v) => v }) {
  const [lo, hi] = value;
  const pct = (v) => ((v - min) / (max - min)) * 100;

  function setLo(v) {
    const n = Math.min(parseFloat(v), hi);
    onChange([n, hi]);
  }
  function setHi(v) {
    const n = Math.max(parseFloat(v), lo);
    onChange([lo, n]);
  }

  return (
    <div>
      <div className="relative h-6">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 rounded" />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1 bg-accent-500 rounded"
          style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }}
        />
        <input
          type="range" min={min} max={max} step={step} value={lo}
          onChange={(e) => setLo(e.target.value)}
          className="absolute inset-0 w-full"
        />
        <input
          type="range" min={min} max={max} step={step} value={hi}
          onChange={(e) => setHi(e.target.value)}
          className="absolute inset-0 w-full"
        />
      </div>
      <div className="flex justify-between text-xs text-ink-500 mt-2">
        <span>{format(lo)}</span>
        <span>{format(hi)}</span>
      </div>
    </div>
  );
}
