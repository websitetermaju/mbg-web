/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bgn: {
          50:  '#eef4fb',
          100: '#d6e8f5',
          200: '#b5e0ea',
          300: '#87c9d9',
          400: '#56afc5',
          500: '#3594ae',
          600: '#247893',
          700: '#1a5f78',
          800: '#0d3d5c',
          900: '#071e49',
        },
      },
    },
  },
  plugins: [],
}
