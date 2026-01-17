import typescript from '@rollup/plugin-typescript'

export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'esm',
    entryFileNames: '[name].mjs',
  },
  plugins: [
    typescript({
      tsconfig: './tsconfig.lib.json',
    }),
  ],
  external: [
    'eslint-plugin-import',
    'eslint-plugin-prettier/recommended',
    'eslint-plugin-react-hooks',
    'eslint-plugin-react',
    'eslint/config',
    'typescript-eslint',
  ],
}
