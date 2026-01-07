// @ts-check
// import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import eslint from '@eslint/js'

export default defineConfig([
  globalIgnores(['build']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [eslint.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
    },
  },
])
