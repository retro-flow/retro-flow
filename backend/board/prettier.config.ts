import type { Config } from 'prettier'

const QS = '([?].*)?'
const STYLE_EXT = 'css|less|sass|scss|styl|stylus|pcss|postcss|sss'
const IMAGE_EXT = 'apng|bmp|png|jpe?g|jfif|pjpeg|pjp|gif|svg|ico|webp|avif|cur|jxl'
const NOT_STYLE_OR_ASSET = `(.(?![.](?:${STYLE_EXT}|${IMAGE_EXT})${QS}$))*`
const ALIASES = ['app']

const SCOPED_RE = `^@(?!${ALIASES.join('|')}).`
const ALIASES_RE = ALIASES.map((alias) => `^@${alias}/`)
const RELATVIE_RE = `^[.]{1,2}${NOT_STYLE_OR_ASSET}$`
const IMAGE_RE = `^[.]{1,2}.+[.](${IMAGE_EXT})${QS}$`
const STYLE_RE = `^[.]{1,2}.+[.](${STYLE_EXT})${QS}$`

export default {
  arrowParens: 'always',
  endOfLine: 'lf',
  printWidth: 100,
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
  overrides: [
    {
      files: ['*.json'],
      options: {
        parser: 'json',
        trailingComma: 'none',
      },
    },
    {
      files: ['*.md'],
      options: {
        parser: 'markdown',
      },
    },
    {
      files: ['*.mdx'],
      options: {
        parser: 'mdx',
      },
    },
  ],
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
  importOrderTypeScriptVersion: '5.0.0',
  importOrder: [
    '<BUILTIN_MODULES>',
    '',
    '^react',
    '<THIRD_PARTY_MODULES>',
    SCOPED_RE,
    '',
    ...ALIASES_RE,
    '',
    RELATVIE_RE,
    '',
    IMAGE_RE,
    '',
    STYLE_RE,
  ],
  plugins: ['@ianvs/prettier-plugin-sort-imports'],
} satisfies Config
