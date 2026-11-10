/** @format */

import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{vue,js,ts,jsx,tsx}", "./components/**/*.{vue,js,ts,jsx,tsx}", "./layouts/**/*.{vue,js,ts,jsx,tsx}", "./pages/**/*.{vue,js,ts,jsx,tsx}", "./plugins/**/*.{js,ts}", "./app.vue"],
  theme: {
    extend: {
      colors: {
        // Blue Ocean Pastels Palette
        ocean: {
          blue: "#89CBDD", // Primary Ocean Sky Blue
          cyan: "#ADDFF1", // Soft Breeze Cyan
          ice: "#D0F2F9", // Light Ice Water Aqua
          mist: "#E9F8FF", // Ultra-light Pastel Mist
          mint: "#A3EEEC", // Seafoam Mint Accent
          navy: "#0D253A", // Deep Ocean Navy (Text/Headers)
          charcoal: "#0D2235", // Deep Charcoal Navy (Headings)
          slate: "#486581", // Muted Ocean Slate (Body/Labels)
          border: "#ADDFF1", // Pastel Border
        },
        // Backward-compatible semantic tokens mapped to new palette
        scientific: {
          turquoise: "#89CBDD",
          navy: "#0D253A",
          ivory: "#E9F8FF",
          amber: "#F2A23A",
          charcoal: "#0D2235",
          slate: "#486581",
          border: "#ADDFF1",
          mint: "#A3EEEC",
          ice: "#D0F2F9",
          cyan: "#ADDFF1",
          blue: "#89CBDD",
          mist: "#E9F8FF",
        },
      },
      fontFamily: {
        manrope: ["Manrope", "sans-serif"],
        sans: ["DM Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
