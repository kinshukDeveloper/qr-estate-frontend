/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // QR Estate brand colors (matches the roadmap doc)
        brand: {
          bg:      '#080F17',
          surface: '#0D1821',
          card:    '#111C28',
          border:  '#1A2D40',
          teal:    '#00D4C8',
          'teal-dim': '#007A74',
          gold:    '#FFB830',
          red:     '#FF4D6A',
          green:   '#2ECC8A',
          purple:  '#A78BFA',
          blue:    '#60A5FA',
          gray:    '#4A6580',
          'gray-light': '#7A95AE',
        },
      },
      fontFamily: {
        sans: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
