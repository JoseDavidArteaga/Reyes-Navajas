/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Tema oscuro elegante con acentos dorados/marrones
        primary: {
          50: '#fef7ed',
          100: '#fdedd3',
          200: '#fbd7a5',
          300: '#f8bc6d',
          400: '#f59e42',
          500: '#f37316',
          600: '#e4590c',
          700: '#bd400c',
          800: '#963412',
          900: '#782d12',
        },
        amber: {
          700: '#b45309',
          800: '#92400e',
        },
        gray: {
          900: '#111827',
          800: '#1f2937',
          700: '#374151',
          600: '#4b5563',
          500: '#6b7280',
          400: '#9ca3af',
          300: '#d1d5db',
          200: '#e5e7eb',
          100: '#f3f4f6',
          50: '#f9fafb',
        },
        barberia: {
          dark: '#0f0f0f',
          darker: '#0a0a0a',
          gold: '#d4af37',
          goldLight: '#f4e7a1',
          brown: '#8b4513',
          brownLight: '#cd853f',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'gold': '0 4px 14px 0 rgba(212, 175, 55, 0.39)',
        'xl-gold': '0 20px 25px -5px rgba(212, 175, 55, 0.1), 0 10px 10px -5px rgba(212, 175, 55, 0.04)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'barberia-pattern': 'linear-gradient(45deg, rgba(212, 175, 55, 0.1) 0%, rgba(139, 69, 19, 0.1) 100%)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}