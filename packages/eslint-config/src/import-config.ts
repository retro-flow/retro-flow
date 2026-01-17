import importPlugin from 'eslint-plugin-import'
import type { InfiniteDepthConfigWithExtends } from 'typescript-eslint'

const config: InfiniteDepthConfigWithExtends = {
  name: '@retro-flow/import-config',
  extends: [importPlugin.flatConfigs.recommended, importPlugin.flatConfigs.typescript],
  rules: {
    'import/no-named-as-default': 'off',
    'import/first': 'warn',
    'import/no-anonymous-default-export': [
      'warn',
      {
        allowAnonymousClass: false,
        allowAnonymousFunction: false,
        allowArray: true,
        allowArrowFunction: false,
        allowCallExpression: true,
        allowLiteral: true,
        allowObject: true,
      },
    ],
    'import/no-cycle': 'error',
    'import/no-extraneous-dependencies': 'error',
    'import/no-useless-path-segments': 'error',
    'import/order': 'off',
    'import/no-duplicates': 'error',
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
}

export default config
