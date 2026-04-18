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
          canvas: "rgb(12 11 9 / <alpha-value>)",
          canvasDeep: "rgb(6 5 4 / <alpha-value>)",
          ink: "rgb(244 241 235 / <alpha-value>)",
          inkSoft: "rgb(210 204 192 / <alpha-value>)",
          inkMuted: "rgb(145 132 118 / <alpha-value>)",
          champagne: "rgb(201 170 110 / <alpha-value>)",
          champagneLight: "rgb(228 212 176 / <alpha-value>)",
          champagneMuted: "rgb(158 138 94 / <alpha-value>)",
          champagneFg: "rgb(26 24 20 / <alpha-value>)",
          line: "rgba(212, 202, 186, 0.28)",
          lineSubtle: "rgba(148, 134, 118, 0.22)"
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
