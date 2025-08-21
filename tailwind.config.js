/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brightet.com color palette
        primary: {
          50: '#faf9f7',
          100: '#f5f2ed',
          200: '#ebe4d9',
          300: '#ddd1c0',
          400: '#ccb89f',
          500: '#b8a082',
          600: '#a08a6e',
          700: '#85725c',
          800: '#6d5e4e',
          900: '#584d42',
        },
        accent: {
          50: '#f7f5f5',
          100: '#ede9e9',
          200: '#ddd6d6',
          300: '#c4b8b8',
          400: '#a69393',
          500: '#715555', // Main accent color from brightet.com
          600: '#654c4c',
          700: '#553f3f',
          800: '#493636',
          900: '#3f3030',
        },
        warm: {
          50: '#fffcfa',
          100: '#fef7f2',
          200: '#feeee5',
          300: '#ffddcf', // Highlight color from brightet.com
          400: '#fdc4a6',
          500: '#faa572',
          600: '#f18a47',
          700: '#e5732a',
          800: '#c05621',
          900: '#9a4820',
        },
        cream: {
          50: '#fefefe',
          100: '#fdfcfb',
          200: '#faf0e7', // Main background color from brightet.com
          300: '#f5e6d3',
          400: '#eed5b7',
          500: '#e4c29f',
          600: '#d5a677',
          700: '#c4915a',
          800: '#a3784c',
          900: '#856240',
        },
        charcoal: {
          50: '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#6d6d6d',
          600: '#5d5d5d',
          700: '#4f4f4f',
          800: '#454545',
          900: '#171717', // Main text color from brightet.com
        }
      },
      fontFamily: {
        'gilda': ['Gilda Display', 'serif'],
        'heading': ['Gilda Display', 'serif'],
        'body': ['Gilda Display', 'serif'],
      },
      fontSize: {
        '3xs': '0.625rem',
        '2xs': '0.6875rem',
        '2sm': '0.8125rem',
      },
      spacing: {
        '0.5': '0.125rem',
        '1.5': '0.375rem',
        '2.5': '0.625rem',
        '3.5': '0.875rem',
        '4.5': '1.125rem',
        '5.5': '1.375rem',
        '6.5': '1.625rem',
        '7.5': '1.875rem',
        '8.5': '2.125rem',
        '9.5': '2.375rem',
        '10.5': '2.625rem',
        '15': '3.875rem',
        '23': '5.625rem',
        '100': '32rem',
      },
      borderRadius: {
        'button': '3.75rem',
        'card': '0.625rem',
        'block': '0.625rem',
      },
      boxShadow: {
        'soft': '0 1px 3px 0 rgba(168, 232, 226, 0.1)',
        'warm': '0 4px 6px -1px rgba(113, 85, 85, 0.1), 0 2px 4px -1px rgba(113, 85, 85, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
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
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
