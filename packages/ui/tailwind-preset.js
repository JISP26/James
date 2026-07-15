/**
 * Shared Tailwind design tokens for JISP (Journey in Sculpture).
 * Both apps/storefront and apps/admin extend this preset so the two
 * properties stay visually consistent.
 */
module.exports = {
  theme: {
    extend: {
      colors: {
        jisp: {
          black: "#111111",
          dark: "#242424",
          grey: "#707070",
          light: "#E8E8E8",
          white: "#FFFFFF",
          blue: "#BFDFF5",
          "blue-hover": "#D9EDFA",
        },
      },
      fontFamily: {
        display: ["'Neue Montreal'", "'Helvetica Neue'", "Arial", "sans-serif"],
        body: ["'Inter'", "'Helvetica Neue'", "Arial", "sans-serif"],
      },
      fontSize: {
        h1: ["clamp(2.25rem, 4vw, 4rem)", { lineHeight: "1.05", letterSpacing: "-0.02em", fontWeight: "500" }],
        h2: ["clamp(1.75rem, 2.5vw, 2.5rem)", { lineHeight: "1.1", letterSpacing: "-0.01em", fontWeight: "500" }],
        h3: ["1.25rem", { lineHeight: "1.3", fontWeight: "500" }],
        body: ["0.95rem", { lineHeight: "1.6" }],
        caption: ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.04em" }],
      },
      borderRadius: {
        none: "0px",
        sm: "2px",
        DEFAULT: "2px",
        md: "4px",
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
    },
  },
};
