/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base:     'var(--bg-base)',
        surface:  'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
        line:     'var(--border)',
        'fg-1':   'var(--fg-1)',
        'fg-2':   'var(--fg-2)',
        'fg-3':   'var(--fg-3)',
      },
    },
  },
  plugins: [],
}
