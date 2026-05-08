const BASE = '/api';

const toQuery = (obj) => {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === '') continue;
    p.set(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : '';
};

export const fetchListings = async (params, signal) => {
  const res = await fetch(`${BASE}/listings${toQuery(params)}`, { signal });
  if (!res.ok) throw new Error(`Listings request failed (${res.status})`);
  return res.json();
};

export const fetchListing = async (id, signal) => {
  const res = await fetch(`${BASE}/listings/${encodeURIComponent(id)}`, {
    signal,
  });
  if (!res.ok) throw new Error(`Listing request failed (${res.status})`);
  return res.json();
};

export const fetchFilterOptions = async (signal) => {
  const res = await fetch(`${BASE}/filters/options`, { signal });
  if (!res.ok) throw new Error(`Filter options failed (${res.status})`);
  return res.json();
};

export const fetchModels = async (make, signal) => {
  const res = await fetch(`${BASE}/models${toQuery({ make })}`, { signal });
  if (!res.ok) throw new Error(`Models request failed (${res.status})`);
  return res.json();
};
