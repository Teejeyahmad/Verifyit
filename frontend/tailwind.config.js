/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#edf7f1', 100: '#d0ecd9', 200: '#a3d9b5',
          300: '#6ec28a', 400: '#3da865', 500: '#1a8c47',
          600: '#0B6E37', 700: '#0B4D2E', 800: '#093d25', 900: '#06291a',
        },
        gold: { 100: '#fdf3d9', 300: '#f5d07a', 500: '#C9952A', 700: '#9a6e18' },
        cream: '#F8F5F0',
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
      },
      boxShadow: {
        card:     '0 2px 12px rgba(11,77,46,0.07)',
        elevated: '0 8px 32px rgba(11,77,46,0.13)',
      },
    },
  },
  plugins: [],
}
