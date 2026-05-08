// Normalization helpers shared across scrapers.

export function toInt(value) {
  if (value == null) return null;
  const n = parseInt(String(value).replace(/[^0-9-]/g, ''), 10);
  return Number.isFinite(n) ? n : null;
}

export function toFloat(value) {
  if (value == null) return null;
  const n = parseFloat(String(value).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : null;
}

export function cleanText(s) {
  if (!s) return '';
  return String(s).replace(/\s+/g, ' ').trim();
}

const BODY_STYLES = [
  'Sedan', 'SUV', 'Truck', 'Coupe', 'Convertible', 'Van', 'Wagon', 'Hatchback',
];

export function inferBodyStyle(title = '', description = '') {
  const hay = `${title} ${description}`.toLowerCase();
  for (const b of BODY_STYLES) {
    if (hay.includes(b.toLowerCase())) return b;
  }
  // common keyword inference
  if (/\bpickup\b/.test(hay)) return 'Truck';
  if (/\bcrossover\b|\bsuv\b/.test(hay)) return 'SUV';
  return null;
}

export function makeFingerprint(l) {
  // Coarse fingerprint: rough price/mileage buckets so near-duplicates collide.
  const priceBucket = l.price ? Math.round(l.price / 500) : 'x';
  const mileBucket = l.mileage != null ? Math.round(l.mileage / 200) : 'x';
  const trim = (l.trim || '').toLowerCase().replace(/\s+/g, '');
  return [
    l.year || 'x',
    (l.make || '').toLowerCase(),
    (l.model || '').toLowerCase(),
    trim,
    mileBucket,
    priceBucket,
  ].join('|');
}

export function parseTitle(title) {
  // "2021 Toyota RAV4 XLE Premium" -> { year, make, model, trim }
  if (!title) return {};
  const parts = cleanText(title).split(' ');
  const yearMatch = parts[0] && /^\d{4}$/.test(parts[0]) ? parseInt(parts[0], 10) : null;
  const make = parts[1] || null;
  const model = parts[2] || null;
  const trim = parts.slice(3).join(' ') || null;
  return { year: yearMatch, make, model, trim };
}
