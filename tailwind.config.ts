import { heroui } from '@heroui/react'
import { addDynamicIconSelectors } from '@iconify/tailwind'
import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

const config: Config = {
  content: ['./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    screens: {
      xs: '650px',
      sm: '960px',
      md: '1280px',
      lg: '1400px',
      xl: '1920px',
    },
  },
  darkMode: 'class',
  plugins: [
    heroui(),
    require('tailwindcss-animate'),
    addDynamicIconSelectors(),
    plugin(function ({ addVariant }) {
      addVariant('light', '&:is(.light *)')
    }),
  ],
}

export default config
