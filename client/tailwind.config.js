/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Lora', 'Georgia', 'Cambria', 'serif'],
        display: ['Lora', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: {
          bg: '#f8f9fa',
          card: '#ffffff',
          border: '#e5e7eb',
          subtle: '#f3f4f6'
        }
      }
    },
  },
  plugins: [],
}
