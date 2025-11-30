/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        sm: { min: "0px", max: "640px" },
        md: { min: "641px", max: "767px" },
        lg: { min: "768px", max: "1024px" },
      },
    },
  },
  plugins: [],
}

