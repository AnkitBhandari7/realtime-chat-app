/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",   // scan all React/TS file types
  ],
  theme: {
    extend: {
      colors: {
        // custom dark‑mode palette similar to your chat screenshot
        dark: {
          100: "#2B3042",
          200: "#232738",
          300: "#1E2230",
          400: "#191C28",
        },
        accent: {
          blue: "#2563EB",
          gray: "#3A3F54",
        },
      },
      fontFamily: {
        //  modern sans font
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};