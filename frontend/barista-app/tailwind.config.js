/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'coffee-brown': '#6B4423',
        'coffee-light': '#8B5A3C',
        'coffee-cream': '#F5E6D3',
        'coffee-dark': '#3D2817',
        'pulse-green': '#10B981',
        'pulse-red': '#EF4444',
        'pulse-orange': '#F59E0B',
        'pulse-blue': '#3B82F6',
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
    },
  },
  plugins: [],
}
