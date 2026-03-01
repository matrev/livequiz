import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/utils/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        landing: {
          border: "var(--color-landing-border)",
          text: "var(--color-landing-text)",
          surface: "var(--color-landing-surface)",
          panel: "var(--color-landing-panel)",
          label: "var(--color-landing-label)",
          inputBorder: "var(--color-landing-input-border)",
          inputBg: "var(--color-landing-input-bg)",
          inputText: "var(--color-landing-input-text)",
          focus: "var(--color-landing-focus)",
          primary: "var(--color-landing-primary)",
          primaryText: "var(--color-landing-primary-text)",
          outlineText: "var(--color-landing-outline-text)",
        },
      },
      borderRadius: {
        "landing-pill": "var(--radius-landing-pill)",
        "landing-card": "var(--radius-landing-card)",
        "landing-input": "var(--radius-landing-input)",
      },
      boxShadow: {
        "landing-panel": "var(--shadow-landing-panel)",
      },
    },
  },
  plugins: [],
};

export default config;
