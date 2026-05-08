import React from 'react';
import ListingCard from './ListingCard.jsx';

function Skeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-card overflow-hidden">
      <div className="aspect-[4/3] skeleton" />
      <div className="p-4 space-y-2">
        <div className="h-5 skeleton w-3/4" />
        <div className="h-7 skeleton w-1/3" />
        <div className="h-4 skeleton w-full" />
      </div>
    </div>
  );
}

export default function ListingGrid({ listings, view, loading, onSelect }) {
  if (loading) {
    return (
      <div className={view === 'list' ? 'space-y-4' : 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'}>
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}
      </div>
    );
  }
  return (
    <div className={view === 'list' ? 'space-y-4' : 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'}>
      {listings.map((l) => (
        <ListingCard key={l.id} listing={l} onSelect={onSelect} view={view} />
      ))}
    </div>
  );
}
