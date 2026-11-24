/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        transit: {
          dark: '#0b0f19',
          card: '#111827',
          border: '#1f2937',
          accent: '#3b82f6',
          brand: '#2563eb'
        }
      }
    },
  },
  plugins: [],
}

