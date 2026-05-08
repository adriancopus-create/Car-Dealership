import React, { useState } from 'react';

export default function MultiSelect({ label, options = [], values = [], onChange, max = 8 }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? options : options.slice(0, max);

  function toggle(v) {
    if (values.includes(v)) onChange(values.filter((x) => x !== v));
    else onChange([...values, v]);
  }

  if (!options.length) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</h3>
        {values.length > 0 && (
          <button className="text-xs text-accent-500 hover:underline" onClick={() => onChange([])}>Clear</button>
        )}
      </div>
      <div className="space-y-1.5 max-h-48 overflow-auto pr-1">
        {visible.map((opt) => (
          <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={values.includes(opt)}
              onChange={() => toggle(opt)}
              className="rounded border-slate-300 text-accent-500 focus:ring-accent-500"
            />
            <span className="text-ink-700">{opt}</span>
          </label>
        ))}
      </div>
      {options.length > max && (
        <button className="text-xs text-ink-500 hover:underline mt-1" onClick={() => setExpanded((e) => !e)}>
          {expanded ? 'Show less' : `Show all (${options.length})`}
        </button>
      )}
    </div>
  );
}
