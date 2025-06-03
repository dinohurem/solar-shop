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
        "second-fg": "#5D65FF",
        "selection": "#373DACFF",
        "success": "#4BCF4B",
        "warning": "#ffcc00",
        "error": "#F8546A",
        "info": "#5D65FF",
        // SolarShop brand colors from Figma
        "heyhome": {
          "primary": "#0ACF83",
          "primary-dark": "#09b574",
          "dark-green": "#0A3430",
          "medium-green": "#1C3E3B",
          "light-green": "#0B8F5C",
          "darker-green": "#044741",
          "cream": "#FFFAF1",
          "italian-green": "#009246",
          "italian-red": "#CE2B37",
        }
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
