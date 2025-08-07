import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      spacing: {
        '80': '20rem',
        '88': '22rem',
        '96': '24rem',
      },
      minHeight: {
        'touch-target': '80px', // Accessibility: minimum 80px touch targets
      },
      minWidth: {
        'touch-target': '80px', // Accessibility: minimum 80px touch targets
      },
      fontSize: {
        'elderly-sm': ['18px', '24px'], // Larger text for elderly users
        'elderly-base': ['20px', '28px'],
        'elderly-lg': ['24px', '32px'],
      },
      animation: {
        'ai-thinking': 'pulse 1.5s ease-in-out infinite',
        'scan-line': 'scanLine 2s ease-in-out infinite',
        'health-ring': 'healthRing 0.8s ease-out',
      },
      keyframes: {
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '50%': { transform: 'translateY(0%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        healthRing: {
          '0%': { strokeDashoffset: '283', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { strokeDashoffset: '0', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config