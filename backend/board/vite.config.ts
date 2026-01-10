import swc from 'unplugin-swc'
import { defineConfig } from 'vite'
import selfServer from 'vite-plugin-self-server'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig(() => {
  return {
    build: {
      outDir: 'build',
      minify: false,
    },
    server: {
      allowedHosts: ['.finance.yandex.ru'],
      host: true,
      port: Number(process.env.PORT),
      strictPort: true,
      proxy: {},
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
