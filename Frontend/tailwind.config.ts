import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: '#0f172a',
        emerald: {
          DEFAULT: '#00884C',
          50: '#e6f5ee',
          100: '#ccebdc',
          200: '#99d7ba',
          300: '#66c397',
          400: '#33af75',
          500: '#00884C',
          600: '#00703e',
          700: '#005831',
          800: '#004023',
          900: '#002816',
        },
        // `background` is the page-wrapper color already used everywhere
        // (`bg-background`) - point it at the same swappable var as `surface`
        // so every existing page reacts to the theme toggle for free.
        background: 'var(--surface)',
        // Theme-aware semantic tokens (swap value via CSS vars on the .dark
        // class in globals.css) - used across the public marketing site so
        // the light/dark toggle actually repaints every page correctly.
        surface: 'var(--surface)',
        'surface-card': 'var(--surface-card)',
        'surface-muted': 'var(--surface-muted)',
        heading: 'var(--text-heading)',
        body: 'var(--text-body)',
        muted: 'var(--text-muted)',
        subtle: 'var(--border-subtle)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
