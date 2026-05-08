export const fmtPrice = (n) =>
  typeof n === 'number' && n > 0
    ? `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
    : 'Call for Price';

export const fmtMiles = (n) =>
  typeof n === 'number' ? `${n.toLocaleString('en-US')} mi` : '—';

export const fmtNumber = (n) =>
  typeof n === 'number' ? n.toLocaleString('en-US') : '—';

export const titleCase = (s) =>
  typeof s === 'string' && s.length
    ? s
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .replace(/\bMpg\b/g, 'MPG')
        .replace(/\bSuv\b/g, 'SUV')
        .replace(/\bAwd\b/g, 'AWD')
        .replace(/\bRwd\b/g, 'RWD')
        .replace(/\bFwd\b/g, 'FWD')
        .replace(/\b4wd\b/gi, '4WD')
    : s;

export const daysAgoText = (n) => {
  if (typeof n !== 'number') return '';
  if (n <= 0) return 'Listed today';
  if (n === 1) return 'Listed 1 day ago';
  return `Listed ${n} days ago`;
};

export const carTitle = (c) =>
  [c.year, c.make, c.model].filter(Boolean).join(' ');

const COLOR_MAP = {
  black: '#111111',
  white: '#f4f4f4',
  silver: '#c0c0c0',
  gray: '#7a7d85',
  grey: '#7a7d85',
  red: '#dc2626',
  blue: '#2563eb',
  navy: '#1e3a8a',
  green: '#16a34a',
  yellow: '#eab308',
  orange: '#f97316',
  brown: '#7c4a18',
  beige: '#d6c6a3',
  tan: '#cdb892',
  gold: '#d4a647',
  purple: '#7c3aed',
  maroon: '#7f1d1d',
  bronze: '#9a6a3a',
  charcoal: '#36393e',
  pearl: '#ece9df',
  burgundy: '#5b1717',
};

export const colorSwatch = (name) => {
  if (!name) return '#444';
  const n = String(name).toLowerCase();
  for (const [key, val] of Object.entries(COLOR_MAP)) {
    if (n.includes(key)) return val;
  }
  return '#555';
};
