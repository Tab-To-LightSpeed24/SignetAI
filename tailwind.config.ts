import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "Courier New", "monospace"],
      },
      colors: {
        // ClauseGuard Design System v2.0 — Part 1.1
        navy: "#0D1B2A",
        "ink-dark": "#1A2A3A",
        "off-white": "#F5F0E8",
        "pure-white": "#FFFFFF",
        teal: "#1D9E75",
        "teal-dark": "#0F6E56",
        amber: "#BA7517",
        "amber-light": "#FAEEDA",
        "red-alert": "#E24B4A",
        "red-light": "#FCEBEB",
        "green-safe": "#639922",
        "green-light": "#EAF3DE",

        // shadcn compatibility layer
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        button: "6px",
        card: "12px",
        modal: "16px",
        pill: "100px",
        input: "8px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(13,27,42,0.08), 0 4px 16px rgba(13,27,42,0.04)",
        raised: "0 4px 24px rgba(13,27,42,0.12)",
        cta: "0 2px 8px rgba(29,158,117,0.35)",
        "cta-hover": "0 4px 16px rgba(29,158,117,0.4)",
      },
      fontSize: {
        // Part 1.2 Typography scale
        "h1": ["52px", { lineHeight: "56px", fontWeight: "400" }],
        "h2": ["36px", { lineHeight: "42px", fontWeight: "400" }],
        "h3": ["24px", { lineHeight: "32px", fontWeight: "400" }],
        "h4": ["18px", { lineHeight: "26px", fontWeight: "500" }],
        "body": ["16px", { lineHeight: "26px", fontWeight: "400" }],
        "small": ["14px", { lineHeight: "22px", fontWeight: "400" }],
        "label": ["12px", { lineHeight: "16px", fontWeight: "500", letterSpacing: "0.05em" }],
      },
      spacing: {
        // Part 1.3 Spacing scale
        "4": "4px",
        "8": "8px",
        "12": "12px",
        "16": "16px",
        "24": "24px",
        "32": "32px",
        "48": "48px",
        "64": "64px",
        "80": "80px",
        "96": "96px",
        "128": "128px",
      },
      animation: {
        "fade-in-up": "fadeInUp 300ms ease forwards",
        "spin": "spin 1s linear infinite",
        "pulse-border": "pulse-border 2s ease-in-out infinite",
        "bounce-chevron": "bounceChevron 2s ease-in-out infinite",
      },
      keyframes: {
        fadeInUp: {
          "from": { opacity: "0", transform: "translateY(10px)" },
          "to": { opacity: "1", transform: "translateY(0)" },
        },
        pulseBorder: {
          "0%, 100%": { borderColor: "rgba(29,158,117,0.3)" },
          "50%": { borderColor: "rgba(29,158,117,0.7)" },
        },
        bounceChevron: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(6px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;