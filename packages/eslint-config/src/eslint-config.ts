import type { InfiniteDepthConfigWithExtends } from 'typescript-eslint'

const config: InfiniteDepthConfigWithExtends = {
  name: '@retro-flow/eslint-config',
  rules: {
    'array-callback-return': [
      'error',
      {
        allowImplicit: false,
        checkForEach: true,
      },
    ],
    'block-scoped-var': 'error',
    camelcase: [
      'error',
      {
        ignoreDestructuring: false,
        ignoreGlobals: false,
        ignoreImports: false,
        properties: 'never',
      },
    ],
    complexity: 'off',
    'dot-notation': 'error',
    eqeqeq: [
      'error',
      'always',
      {
        null: 'ignore',
      },
    ],
    'max-depth': ['warn', 4],
    'max-params': ['error', 5],
    'newline-after-var': 'off',
    'no-caller': 'error',
    'no-cond-assign': ['error', 'except-parens'],
    'no-console': ['error', { allow: ['warn', 'error', 'debug', 'info'] }],
    'no-const-assign': 'error',
    'no-constant-condition': 'error',
    'no-debugger': 'error',
    'no-dupe-args': 'error',
    'no-dupe-keys': 'error',
    'no-duplicate-case': 'error',
    'no-else-return': 'error',
    'no-empty': [
      'error',
      {
        allowEmptyCatch: true,
      },
    ],
    'no-eq-null': 'off',
    'no-extra-bind': 'error',
    'no-extra-boolean-cast': 'error',
    'no-func-assign': 'error',
    'no-implicit-coercion': 'error',
    'no-lonely-if': 'error',
    'no-nested-ternary': 'error',
    'no-new': 'error',
    'no-param-reassign': 'error',
    'no-restricted-globals': ['error', 'fdescribe', 'fit'],
    'no-return-assign': 'off',
    'no-sequences': 'error',
    'no-sparse-arrays': 'error',
    'no-undef': 'off',
    'no-unneeded-ternary': 'error',
    'no-unreachable': 'error',
    'no-unused-expressions': 'off',
    'no-use-before-define': 'off',
    'no-var': 'warn',
    'no-warning-comments': [
      'error',
      {
        location: 'anywhere',
        terms: ['FIXME'],
      },
    ],
    'one-var': [
      'error',
      {
        const: 'never',
        let: 'never',
      },
    ],
    'padding-line-between-statements': [
      'error',
      {
        blankLine: 'always',
        next: '*',
        prev: ['const', 'let', 'var'],
      },
      {
        blankLine: 'any',
        next: ['const', 'let', 'var'],
        prev: ['const', 'let', 'var'],
      },
      {
        blankLine: 'always',
        next: 'return',
        prev: '*',
      },
    ],
    'prefer-const': [
      'error',
      {
        destructuring: 'all',
        ignoreReadBeforeAssign: true,
      },
    ],
    'use-isnan': 'error',
    yoda: 'error',
  },
}

export default config
