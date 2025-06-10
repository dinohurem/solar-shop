/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      boxShadow: {
        'custom': '0 1px 2px 0 rgba(0, 0, 0, 0.5)', // Customize as needed
      },
      transitionProperty: {
        width: "width",
      },
      colors: {
        "main-bg": "#ffffff",
        "second-bg": "#f4f4f4",
        "main-fg": "#0a2541",
        "second-fg": "#f47424",
        "selection": "#f47424",
        "success": "#4BCF4B",
        "warning": "#ffcc00",
        "error": "#F8546A",
        "info": "#f47424",
        // SolarShop brand colors - Updated with orange/red theme
        "heyhome": {
          "primary": "#f47424",           // Main orange
          "primary-dark": "#e05d1a",      // Darker orange
          "dark-green": "#8B2635",        // Dark red-brown
          "medium-green": "#A63446",      // Medium red-brown
          "light-green": "#D2691E",       // Light orange-brown
          "darker-green": "#6B1E2F",      // Very dark red-brown
          "cream": "#FFF8F0",             // Warm cream
          "italian-green": "#009246",     // Keep original
          "italian-red": "#CE2B37",       // Keep original
        },
        // Additional orange/red color palette
        "solar": {
          "50": "#fef7ed",               // Very light orange
          "100": "#fdedd3",              // Light orange
          "200": "#fbd6a5",              // Light orange
          "300": "#f8b76d",              // Medium light orange
          "400": "#f47424",              // Primary orange
          "500": "#f47424",              // Primary orange (same as 400)
          "600": "#e05d1a",              // Darker orange
          "700": "#c9490f",              // Dark orange
          "800": "#a0390c",              // Very dark orange
          "900": "#7c2d0a",              // Darkest orange
          "950": "#431508",              // Almost black orange
        },
        // Red accent colors
        "accent": {
          "50": "#fef2f2",               // Very light red
          "100": "#fee2e2",              // Light red
          "200": "#fecaca",              // Light red
          "300": "#fca5a5",              // Medium light red
          "400": "#f87171",              // Medium red
          "500": "#ef4444",              // Base red
          "600": "#dc2626",              // Dark red
          "700": "#b91c1c",              // Darker red
          "800": "#991b1b",              // Very dark red
          "900": "#7f1d1d",              // Darkest red
          "950": "#450a0a",              // Almost black red
        },
        // Neutral colors with warm undertones
        "neutral-warm": {
          "50": "#fafaf9",
          "100": "#f5f5f4",
          "200": "#e7e5e4",
          "300": "#d6d3d1",
          "400": "#a8a29e",
          "500": "#78716c",
          "600": "#57534e",
          "700": "#44403c",
          "800": "#292524",
          "900": "#1c1917",
          "950": "#0c0a09",
        },
        // B2B theme colors (based on the provided image)
        "b2b": {
          "50": "#f0f9ff",               // Very light blue
          "100": "#e0f2fe",              // Light blue
          "200": "#bae6fd",              // Light blue
          "300": "#7dd3fc",              // Medium light blue
          "400": "#38bdf8",              // Light blue
          "500": "#0ea5e9",              // Primary blue
          "600": "#0284c7",              // Medium blue
          "700": "#0369a1",              // Dark blue
          "800": "#075985",              // Darker blue
          "900": "#0c4a6e",              // Darkest blue
          "950": "#082f49",              // Almost black blue
        },
        // B2B secondary colors (teal/green accents)
        "b2b-secondary": {
          "50": "#f0fdfa",               // Very light teal
          "100": "#ccfbf1",              // Light teal
          "200": "#99f6e4",              // Light teal
          "300": "#5eead4",              // Medium light teal
          "400": "#2dd4bf",              // Medium teal
          "500": "#14b8a6",              // Base teal
          "600": "#0d9488",              // Dark teal
          "700": "#0f766e",              // Darker teal
          "800": "#115e59",              // Very dark teal
          "900": "#134e4a",              // Darkest teal
          "950": "#042f2e",              // Almost black teal
        },
        // B2B neutral grays
        "b2b-gray": {
          "50": "#f8fafc",
          "100": "#f1f5f9",
          "200": "#e2e8f0",
          "300": "#cbd5e1",
          "400": "#94a3b8",
          "500": "#64748b",
          "600": "#475569",
          "700": "#334155",
          "800": "#1e293b",
          "900": "#0f172a",
          "950": "#020617",
        },
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
        'dm-sans': ["DM Sans", "sans-serif"],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ["hover"],
      textColor: ["hover"],
    },
  },
  plugins: [],
};
