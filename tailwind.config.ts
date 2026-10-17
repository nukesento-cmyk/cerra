// tailwind.config.ts
export default {
    theme: {
      extend: {
        keyframes: {
          wisp: {
            "0%":   { transform: "translateY(0) scale(1)", opacity: "0" },
            "20%":  { opacity: "0.9" },
            "100%": { transform: "translateY(-14px) scale(0.4)", opacity: "0" },
          },
          "brand-wiggle": {
            "0%, 100%": { transform: "rotate(0deg)" },
            "25%":       { transform: "rotate(-2deg)" },
            "75%":       { transform: "rotate(2deg)" },
          },
        },
        animation: {
          wisp: "wisp 1.2s ease-out infinite",
        },
      },
    },
  };