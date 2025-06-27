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
        'pulse-primary': '#8B4513',
        'pulse-secondary': '#D2691E',
        'pulse-accent': '#F4A460',
      },
    },
  },
  plugins: [],
}
