/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#0b1220',
          800: '#111827',
          700: '#1f2937',
          500: '#6b7280',
        },
        accent: {
          500: '#ef4444',
          600: '#dc2626',
        },
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,.06), 0 4px 12px rgba(15,23,42,.06)',
        cardHover: '0 6px 20px rgba(15,23,42,.12)',
      },
    },
  },
  plugins: [],
};
