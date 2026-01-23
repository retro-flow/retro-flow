import { defineConfig, globalIgnores } from 'eslint/config'
import { configs } from '@retro-flow/eslint-config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['*.{js,ts,tsx}'],
    extends: [configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
