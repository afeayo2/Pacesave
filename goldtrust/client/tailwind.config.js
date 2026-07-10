/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F6F3EA",
        ink: {
          DEFAULT: "#10201A",
          soft: "#1B2E26",
        },
        forest: {
          50: "#EAF3EE",
          100: "#CDE4D6",
          300: "#7CB697",
          500: "#0F6B4C",
          600: "#0B5A3F",
          700: "#0A3D2C",
          900: "#07271C",
        },
        gold: {
          100: "#F3E7C9",
          300: "#DEC17E",
          500: "#C6A15B",
          600: "#A9843F",
          700: "#8A6B31",
        },
        rust: "#B5473A",
        sky: "#2F8F7A",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Manrope", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,32,26,0.06), 0 8px 24px -12px rgba(16,32,26,0.15)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
