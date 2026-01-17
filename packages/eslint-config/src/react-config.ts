import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import type { InfiniteDepthConfigWithExtends } from 'typescript-eslint'

const config: InfiniteDepthConfigWithExtends = {
  name: '@retro-flow/react-config',
  extends: [
    // @ts-expect-error
    react.configs.flat.recommended,
    reactHooks.configs.flat['recommended-latest'],
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'off',
    'react/display-name': 'off',
    'react/jsx-handler-names': 'off',
    'react/jsx-no-literals': 'off',
    'react/jsx-sort-props': 'off',
    'react/no-multi-comp': 'off',
    'react/no-set-state': 'off',
    'react/prop-types': 'off',
    'react/require-optimization': 'off',

    'react/forbid-prop-types': [
      'error',
      {
        checkChildContextTypes: true,
        checkContextTypes: true,
        forbid: ['any', 'array', 'object'],
      },
    ],
    'react/jsx-boolean-value': 'error',
    'react/jsx-curly-brace-presence': [
      'error',
      {
        children: 'never',
        props: 'never',
      },
    ],
    'react/jsx-no-bind': ['error', { ignoreDOMComponents: true }],
    'react/self-closing-comp': 'error',
    'react/style-prop-object': 'error',
    'react/void-dom-elements-no-children': 'error',
    'react-hooks/exhaustive-deps': 'error',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}

export default config
