import React from 'react';

const STYLES = {
  'Cars.com': 'bg-blue-100 text-blue-800',
  'CarGurus': 'bg-emerald-100 text-emerald-800',
  'AutoTrader': 'bg-amber-100 text-amber-800',
};

export default function SourceBadge({ site }) {
  return (
    <span className={`chip ${STYLES[site] || 'bg-slate-100 text-slate-700'}`}>{site}</span>
  );
}
