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
        background: '#050505',
        'bg-main': '#050505',
        'bg-secondary': '#0B0B0F',
        'bg-card': '#121218',
        'bg-card-hover': '#181822',
        'bg-glass': 'rgba(18, 18, 24, 0.7)',
        'border-subtle': '#22222E',
        'border-glow': 'rgba(139, 92, 246, 0.3)',
        primary: {
          DEFAULT: '#8B5CF6',
          hover: '#7C3AED',
          light: '#A78BFA',
          glow: 'rgba(139, 92, 246, 0.4)',
        },
        cyan: {
          accent: '#06B6D4',
          neon: '#00F0FF',
          glow: 'rgba(6, 182, 212, 0.4)',
        },
        muted: '#94A3B8',
        'muted-dark': '#64748B',
      },
      boxShadow: {
        'neon-violet': '0 0 20px -3px rgba(139, 92, 246, 0.35)',
        'neon-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.35)',
        'card-glow': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'float-reverse': 'floatRev 7s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        floatRev: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(12px)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: 0.6 },
          '50%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
}
