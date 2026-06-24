import type { Config } from "tailwindcss";

/**
 * KW Sports design tokens.
 *
 * Mirrors the public website's identity (../KW/KW): condensed all-caps display
 * type, a single electric blue accent, true-black "ink" chrome, sharp geometry
 * and buttery expo easing. The legacy `navy` / `brand` scales are kept as the
 * canonical token names (remapped to KW values) so existing markup adopts the
 * new identity without a rewrite.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // KW ink — true-black chrome used for header/nav/dark heroes.
        navy: {
          50: "#f5f6f7",
          100: "#e6e7e8",
          600: "#4b4b4d",
          700: "#2a2a2c",
          800: "#1a1a1c",
          900: "#101011",
          950: "#0a0a0a"
        },
        // KW electric blue — the single accent. The legacy `brand` name maps here.
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          300: "#7aa8ff",
          500: "#0055ff",
          600: "#0044cc",
          700: "#003399"
        },
        // Semantic alias for new code that wants to say what it means.
        blue: {
          DEFAULT: "#0055ff",
          bright: "#0066ff",
          dark: "#0044cc",
          deep: "#003399"
        },
        ink: "#0a0a0a"
      },
      fontFamily: {
        // Default UI/body type.
        sans: ["var(--font-body)", "Outfit", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "Outfit", "ui-sans-serif", "system-ui", "sans-serif"],
        // Condensed all-caps display type for big headings, stat numbers, wordmark.
        display: ["var(--font-display)", "Bebas Neue", "Impact", "sans-serif"]
      },
      letterSpacing: {
        tightHero: "-0.02em",
        label: "0.1em",
        eyebrow: "0.2em"
      },
      borderRadius: {
        // Sharp by default — KW geometry is architectural, not pill-soft.
        none: "0px",
        sm: "2px",
        DEFAULT: "2px",
        md: "2px",
        lg: "3px",
        xl: "4px",
        "2xl": "6px",
        "3xl": "8px",
        chip: "12px",
        full: "9999px"
      },
      boxShadow: {
        soft: "0 16px 36px rgba(10, 10, 10, 0.08)",
        card: "0 10px 40px rgba(10, 10, 10, 0.08)",
        cardHover: "0 24px 60px rgba(10, 10, 10, 0.16)",
        blueGlow: "0 4px 24px rgba(0, 85, 255, 0.30)"
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "out-quart": "cubic-bezier(0.25, 1, 0.5, 1)"
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        wipeIn: {
          from: { width: "0%" },
          to: { width: "100%" }
        }
      },
      animation: {
        fadeUp: "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both"
      }
    }
  },
  plugins: []
};

export default config;
