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
          canvas: "rgb(31 33 39 / <alpha-value>)",
          canvasDeep: "rgb(20 22 27 / <alpha-value>)",
          ink: "rgb(236 232 220 / <alpha-value>)",
          inkSoft: "rgb(195 192 183 / <alpha-value>)",
          inkMuted: "rgb(143 145 151 / <alpha-value>)",
          champagne: "rgb(180 166 132 / <alpha-value>)",
          champagneLight: "rgb(223 214 193 / <alpha-value>)",
          champagneMuted: "rgb(154 149 136 / <alpha-value>)",
          champagneFg: "rgb(31 31 33 / <alpha-value>)",
          line: "rgba(173, 177, 190, 0.34)",
          lineSubtle: "rgba(126, 130, 142, 0.28)"
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
