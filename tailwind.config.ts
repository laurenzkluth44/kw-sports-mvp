import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#f5f5f2",
          100: "#e8e7e1",
          600: "#4b4b45",
          700: "#2f2f2b",
          800: "#1b1b18",
          900: "#10100e",
          950: "#050505"
        },
        brand: {
          50: "#eef5ff",
          100: "#d9e8ff",
          300: "#7aa8ff",
          500: "#0b55e8",
          600: "#074bd3",
          700: "#073aa5"
        }
      },
      boxShadow: {
        soft: "0 18px 50px rgba(5, 5, 5, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
