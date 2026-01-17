import { configs, type InfiniteDepthConfigWithExtends } from 'typescript-eslint'

const config: InfiniteDepthConfigWithExtends = [
  {
    name: '@retro-flow/typescript-config',
    extends: [configs.recommended],
    rules: {
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': false,
          'ts-ignore': true,
          'ts-nocheck': true,
          'ts-check': false,
        },
      ],
      '@typescript-eslint/consistent-type-assertions': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          vars: 'all',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-use-before-define': [
        'error',
        {
          functions: false,
          ignoreTypeReferences: true,
        },
      ],
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          accessibility: 'no-public',
          overrides: {
            parameterProperties: 'explicit',
          },
        },
      ],
    },
  },
]

export default config
