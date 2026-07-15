module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './context/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    '!./lib/pactKnowledge.ts',
    '!./lib/pactChatEngine.ts',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Instrument Serif', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        white: 'rgb(var(--color-white) / <alpha-value>)',
        background: 'var(--color-bg)',
        primary:   '#7B61FF',
        secondary: '#B7A5FF',
        accent:    '#C084FC',
        surface: {
          DEFAULT: 'rgba(255,255,255,0.04)',
          2: 'rgba(255,255,255,0.07)',
        },
      },
      borderRadius: {
        DEFAULT: '14px',
        sm: '8px',
        md: '14px',
        lg: '20px',
        xl: '28px',
        '2xl': '36px',
      },
      animation: {
        'fade-up':     'fadeUp 0.6s cubic-bezier(0.4,0,0.2,1) both',
        'fade-in':     'fadeIn 0.4s cubic-bezier(0.4,0,0.2,1) both',
        'scale-in':    'scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
        'float':       'float 4s ease-in-out infinite',
        'seal-pulse':  'sealPulse 2s ease-in-out infinite',
        'shimmer':     'shimmer 2s linear infinite',
        'bounce-in':   'bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
        'spin-slow':   'spin 3s linear infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.92)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        sealPulse: {
          '0%, 100%': { boxShadow: '0 0 30px rgba(123,97,255,0.4), 0 0 60px rgba(123,97,255,0.15)' },
          '50%':      { boxShadow: '0 0 50px rgba(123,97,255,0.7), 0 0 100px rgba(123,97,255,0.3)' },
        },
        shimmer: {
          from: { backgroundPosition: '-200% center' },
          to:   { backgroundPosition: '200% center' },
        },
        bounceIn: {
          '0%':   { transform: 'scale(0)',    opacity: '0' },
          '60%':  { transform: 'scale(1.1)',  opacity: '1' },
          '80%':  { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      backdropBlur: {
        xs: '4px',
      },
      boxShadow: {
        'glow-sm': '0 0 12px rgba(123,97,255,0.25)',
        'glow':    '0 0 24px rgba(123,97,255,0.35), 0 0 48px rgba(123,97,255,0.1)',
        'glow-lg': '0 0 40px rgba(123,97,255,0.5), 0 0 80px rgba(123,97,255,0.2)',
      },
    },
  },
  plugins: [],
};
