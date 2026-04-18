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
          canvas: "#1a1a1a",
          canvasDeep: "#121212",
          ink: "#e5ded0",
          inkSoft: "#d6cfc3",
          inkMuted: "#a89f91",
          line: "rgba(229, 222, 208, 0.45)",
          lineSubtle: "rgba(229, 222, 208, 0.22)",
          overlay: "rgba(10, 10, 10, 0.55)",
          overlayHeavy: "rgba(10, 10, 10, 0.72)",
          /** Solid pill CTA: warm fill, dark type */
          sand: "#e8e1d6",
          sandFg: "#141414"
        }
      },
      fontFamily: {
        serif: ["var(--font-styloire-serif)", "ui-serif", "Georgia", "serif"],
        sans: ["var(--font-styloire-sans)", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      fontSize: {
        /** Editorial display — fluid between breakpoints */
        "styloire-display": [
          "clamp(2.75rem, 6vw, 4.75rem)",
          { lineHeight: "0.95", letterSpacing: "0.02em" }
        ],
        "styloire-title": [
          "clamp(2rem, 3.5vw, 3rem)",
          { lineHeight: "1.05", letterSpacing: "0.08em" }
        ],
        "styloire-body": ["0.9375rem", { lineHeight: "1.75" }],
        "styloire-caption": ["0.6875rem", { lineHeight: "1.5" }]
      },
      letterSpacing: {
        styloireWide: "0.28em",
        styloireNav: "0.18em"
      },
      maxWidth: {
        styloire: "68rem",
        "styloire-narrow": "40rem",
        "styloire-prose": "36rem"
      },
      spacing: {
        "styloire-section": "clamp(5rem, 12vw, 8rem)"
      },
      backgroundImage: {
        "styloire-noise":
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")"
      }
    }
  },
  plugins: []
};

export default config;
