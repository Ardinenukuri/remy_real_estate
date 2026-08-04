import type { Config } from 'tailwindcss';

const config: Config = {
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
        background: '#f8fafc',
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
