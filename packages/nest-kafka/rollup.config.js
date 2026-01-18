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
}
