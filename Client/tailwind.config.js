/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: { colors: { forest: '#173d32', moss: '#58735b', sage: '#e9eee4', cream: '#f8f8f4', ink: '#202a24' }, fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui'] } } },
  plugins: [],
}
