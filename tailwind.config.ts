import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        styloire: {
          canvas: "rgb(24 24 24 / <alpha-value>)",
          canvasDeep: "rgb(17 17 17 / <alpha-value>)",
          ink: "rgb(235 228 216 / <alpha-value>)",
          inkSoft: "rgb(212 205 193 / <alpha-value>)",
          inkMuted: "rgb(156 148 138 / <alpha-value>)",
          sand: "rgb(228 221 210 / <alpha-value>)",
          sandFg: "rgb(16 16 16 / <alpha-value>)",
          line: "rgba(235, 228, 216, 0.36)",
          lineSubtle: "rgba(235, 228, 216, 0.14)"
        }
      },
      fontFamily: {
        serif: ["var(--font-styloire-serif)", "ui-serif", "Georgia", "serif"],
        sans: ["var(--font-styloire-sans)", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      fontSize: {
        "styloire-display": [
          "clamp(2.5rem, 5.5vw, 4.25rem)",
          { lineHeight: "1.02", letterSpacing: "-0.02em" }
        ],
        "styloire-title": [
          "clamp(1.75rem, 3vw, 2.65rem)",
          { lineHeight: "1.08", letterSpacing: "0.14em" }
        ],
        "styloire-body": ["0.9375rem", { lineHeight: "1.72" }],
        "styloire-caption": ["0.6875rem", { lineHeight: "1.45" }]
      },
      letterSpacing: {
        styloireWide: "0.26em",
        styloireNav: "0.16em"
      },
      maxWidth: {
        styloire: "66rem",
        "styloire-narrow": "38rem",
        "styloire-prose": "34rem"
      },
      spacing: {
        "styloire-section": "clamp(5.5rem, 11vw, 8.5rem)"
      },
      transitionTimingFunction: {
        styloire: "cubic-bezier(0.22, 1, 0.36, 1)"
      },
      transitionDuration: {
        styloire: "220ms"
      },
      backgroundImage: {
        "styloire-noise":
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.028'/%3E%3C/svg%3E\")"
      }
    }
  },
  plugins: []
};

export default config;
