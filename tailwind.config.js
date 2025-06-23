/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./web/**/*.{html,js,ts,jsx,tsx}", // Configure Tailwind to scan files in web/
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: ["light", "dark", "cupcake"], // Optional: configure DaisyUI themes
  },
}
