import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
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
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "background-shine": {
          from: { backgroundPosition: "0 0" },
          to: { backgroundPosition: "-200% 0" },
        },
        "border-width": {
          from: { width: "10px", opacity: "0" },
          to: { width: "100px", opacity: "1" },
        },
        "text-gradient": {
          to: { backgroundPosition: "200% center" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "shimmer-wave": {
          "0%": {
            transform:
              "translateZ(calc(var(--z-distance) * -50px)) scale(var(--scale-distance)) rotateY(calc(var(--rotate-y-distance) * -1))",
            filter: "brightness(0.5) contrast(0.5)",
            opacity: "0",
          },
          "50%": {
            transform: "translateZ(0) scale(1) rotateY(0deg)",
            filter: "brightness(1) contrast(1)",
            opacity: "1",
          },
          "100%": {
            transform:
              "translateZ(calc(var(--z-distance) * -50px)) scale(var(--scale-distance)) rotateY(var(--rotate-y-distance))",
            filter: "brightness(0.5) contrast(0.5)",
            opacity: "0",
          },
        },
        "slide-up-fade": {
          "0%": {
            opacity: "0",
            transform: "translateY(var(--offset, 10px))",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
          },
          "100%": {
            opacity: "1",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "background-shine": "background-shine 2s linear infinite",
        "border-width": "border-width 3s infinite alternate",
        "text-gradient": "text-gradient 1.5s linear infinite",
        "spin-slow": "spin-slow 8s linear infinite",
        "shimmer-wave": "shimmer-wave calc(var(--duration) * 2) ease-in-out calc(var(--delay) * -1) infinite",
        "slide-up-fade": "slide-up-fade 1s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fade-in 0.2s ease-in-out forwards",
        "fade-in-out": "fadeInOut 3s ease-in-out infinite",
      },
    },
    // Add this to the base section of the CSS:

    "--sidebar-background": "0 0% 98%",
    "--sidebar-foreground": "240 5.3% 26.1%",
    "--sidebar-primary": "240 5.9% 10%",
    "--sidebar-primary-foreground": "0 0% 98%",
    "--sidebar-accent": "240 4.8% 95.9%",
    "--sidebar-accent-foreground": "240 5.9% 10%",
    "--sidebar-border": "220 13% 91%",
    "--sidebar-ring": "217.2 91.2% 59.8%",

    // And in the dark mode section
    "--sidebar-background": "240 5.9% 10%",
    "--sidebar-foreground": "240 4.8% 95.9%",
    "--sidebar-primary": "0 0% 98%",
    "--sidebar-primary-foreground": "240 5.9% 10%",
    "--sidebar-accent": "240 3.7% 15.9%",
    "--sidebar-accent-foreground": "240 4.8% 95.9%",
    "--sidebar-border": "240 3.7% 15.9%",
    "--sidebar-ring": "217.2 91.2% 59.8%",
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
