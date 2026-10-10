/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#84cc16',
          darkBg: '#0f1115',
          darkCard: '#17191e',
          darkBorder: '#23272f',
        }
      }
    },
  },
  plugins: [],
}
