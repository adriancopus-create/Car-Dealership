const BASE = '/api';

function qs(obj) {
  const params = new URLSearchParams();
  Object.entries(obj || {}).forEach(([k, v]) => {
    if (v == null || v === '' || (Array.isArray(v) && v.length === 0)) return;
    params.set(k, Array.isArray(v) ? v.join(',') : v);
  });
  const s = params.toString();
  return s ? `?${s}` : '';
}

export async function fetchListings(filters) {
  const r = await fetch(`${BASE}/listings${qs(filters)}`);
  if (!r.ok) throw new Error(`listings ${r.status}`);
  return r.json();
}

export async function fetchListing(id) {
  const r = await fetch(`${BASE}/listings/${id}`);
  if (!r.ok) throw new Error(`listing ${r.status}`);
  return r.json();
}

export async function fetchFilterOptions() {
  const r = await fetch(`${BASE}/filters/options`);
  if (!r.ok) throw new Error(`filters ${r.status}`);
  return r.json();
}

export async function refreshScrape({ force = false } = {}) {
  const r = await fetch(`${BASE}/scrape/refresh${force ? '?force=true' : ''}`, { method: 'POST' });
  if (!r.ok) throw new Error(`refresh ${r.status}`);
  return r.json();
}
