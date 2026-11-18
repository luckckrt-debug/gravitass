/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#071011',
        'bg-primary': '#071011',
        'bg-secondary': '#0B1719',
        'bg-deep': '#020303',
        'bg-card': '#0B1719',
        'bg-card-hover': '#102225',
        'border-subtle': 'rgba(145, 160, 158, 0.15)',
        'border-glow': 'rgba(115, 216, 196, 0.3)',
        accent: {
          DEFAULT: '#73D8C4',
          hover: '#87E5D3',
          light: '#A5E8DE',
          muted: 'rgba(115, 216, 196, 0.15)',
          glow: 'rgba(115, 216, 196, 0.45)',
        },
        'accent-secondary': '#A5E8DE',
        text: {
          primary: '#F4F5F3',
          secondary: '#91A09E',
          muted: '#627371',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-teal': '0 0 35px -5px rgba(115, 216, 196, 0.35)',
        'glow-soft': '0 0 25px -4px rgba(165, 232, 222, 0.25)',
        'glass-card': '0 20px 40px -15px rgba(2, 3, 3, 0.7)',
      },
      animation: {
        'float-slow': 'float 7s ease-in-out infinite',
        'float-reverse': 'floatRev 8s ease-in-out infinite',
        'pulse-slow': 'pulse 5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-very-slow': 'spin 36s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        floatRev: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(14px)' },
        },
      },
    },
  },
  plugins: [],
}
