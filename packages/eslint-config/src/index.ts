import prettierConfig from 'eslint-plugin-prettier/recommended'
import { defineConfig, type Config } from 'eslint/config'

import baseConfig from './eslint-config'
import importConfig from './import-config'
import reactConfig from './react-config'
import typescriptConfig from './typescript-config'

const recommended = defineConfig(
  baseConfig as Config,
  typescriptConfig as Config,
  importConfig as Config,
  prettierConfig,
)
const react = defineConfig(reactConfig as Config)

export const configs = { recommended, react }
