import swc from 'unplugin-swc'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import selfServer from '@retro-flow/vite-plugin-self-server'

export default defineConfig(() => {
  return {
    build: {
      outDir: 'build',
      minify: false,
    },
    server: {
      host: true,
      port: Number(process.env.PORT),
      // proxy: {
      //   '/ws': {
      //     target: 'http://localhost:8083',
      //     ws: true,
      //     changeOrigin: true,
      //   },
      // },
    },
    plugins: [
      swc.vite({
        tsconfigFile: 'tsconfig.app.json',
        jsc: {
          target: 'es2022',
          experimental: {
            cacheRoot: 'node_modules/.cache/swc',
          },
        },
      }),
      selfServer({
        server: {
          warmupOnStart: true,
          entry: 'src/main.ts',
          output: {
            entry: '[name].mjs',
            chunk: 'chunks/[hash:8].mjs',
            asset: 'static/assets/[hash:8].[ext]',
          },
        },
      }),
      tsconfigPaths(),
    ],
  }
})
