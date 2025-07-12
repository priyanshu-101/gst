/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B4CCA', // Indigo Blue
        accent: '#14B8A6', // Fresh Teal
        background: '#F8FAFC', // Light Grey
        card: '#FFFFFF', // White
        text: {
          primary: '#1E293B', // Charcoal
          secondary: '#64748B', // Slate
        },
        error: '#EF4444', // Soft Red
        success: '#84CC16', // Lime Green
      },
    },
  },
  plugins: [],
}

