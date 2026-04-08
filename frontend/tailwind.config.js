/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'atc-dark': '#0a0e1a',
        'atc-darker': '#060810',
        'atc-radar': '#0a1a2e',
        'atc-green': '#00ff9d',
        'atc-red': '#ff3366',
        'atc-orange': '#ff9933',
        'atc-blue': '#3399ff',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'monospace'],
        'sans': ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}