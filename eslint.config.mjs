import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'

const config = [
  ...nextCoreWebVitals,
  {
    files: ['**/*.tsx'],
    rules: {
      'import/no-unresolved': 'off',
    },
  },
]

export default config
