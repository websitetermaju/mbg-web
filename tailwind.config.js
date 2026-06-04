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
        'bgn-green': {
          50:  '#f4fce8',
          100: '#e5f8cc',
          200: '#cbf099',
          300: '#aae360',
          400: '#92d05d',
          500: '#72b03e',
          600: '#568e2b',
          700: '#3f6e1e',
          800: '#2a4f13',
          900: '#18300a',
        },
        'bgn-gold': {
          50:  '#fdf8ee',
          100: '#f9edcf',
          200: '#f3d99e',
          300: '#e9c06d',
          400: '#d1b06c',
          500: '#b8924a',
          600: '#96732e',
          700: '#74551e',
          800: '#523b12',
          900: '#322308',
        },
      },
    },
  },
  plugins: [],
}
