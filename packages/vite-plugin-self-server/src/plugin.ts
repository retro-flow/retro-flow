import path from "node:path";
import { type ConfigEnv, type Plugin, type UserConfig } from "vite";

import { createMiddleware } from "./middleware";
import { createResolver } from "./resolver";
import { createDevRuntime, createProdRuntime } from "./runtime";
import type { SelfServerUserConfig } from "./types";
import {
  SERVER_MANIFEST_FILE_NAME,
  normalizeConfig,
  resolveBootstrapEntry,
  resolvePreviewEntry,
} from "./utils";

export function vitePluginSelfServer(config: SelfServerUserConfig = {}) {
  const normalizedConfig = normalizeConfig(config);
  const { client: clientOption, server: serverOptions } = normalizedConfig;
  const { exportName, warmupOnStart } = serverOptions;

  let configEnv: ConfigEnv | undefined;

  const selfServerManifest: Plugin = {
    name: "vite:self-server-manifest",
    apply: "build",
    config(_config, env) {
      configEnv = env;
    },
    generateBundle(_options, bundle) {
      if (!configEnv?.isSsrBuild) {
        return;
      }

      const entries: Record<string, string> = {};

      for (const chunk of Object.values(bundle)) {
        if (chunk && chunk.type === "chunk" && chunk.isEntry) {
          entries[chunk.name] = chunk.fileName;
        }
      }

      this.emitFile({
        type: "asset",
        source: JSON.stringify(entries),
        fileName: SERVER_MANIFEST_FILE_NAME,
      });
    },
  };

  const viteSelfServer: Plugin = {
    name: "vite:self-server",
    config(inlineConfig, env) {
      const options = env.isSsrBuild ? serverOptions : clientOption;

      const pluginConfig: UserConfig = {
        appType: "custom",
        build: {
          emptyOutDir: false,
          rollupOptions: {
            input: options.entry,
            output: {
              entryFileNames: options.output.entry,
              chunkFileNames: options.output.chunk,
              assetFileNames: options.output.asset,
            },
          },
        },
        preview: {
          port: inlineConfig.preview?.port ?? inlineConfig.server?.port,
          proxy: inlineConfig.preview?.proxy ?? inlineConfig.server?.proxy,
          cors: inlineConfig.preview?.cors ?? inlineConfig.server?.cors,
          host: inlineConfig.preview?.host ?? inlineConfig.server?.host,
          headers:
            inlineConfig.preview?.headers ?? inlineConfig.server?.headers,
          https: inlineConfig.preview?.https ?? inlineConfig.server?.https,
          strictPort:
            inlineConfig.preview?.strictPort ?? inlineConfig.server?.strictPort,
        },
      };

      return pluginConfig;
    },
    async configureServer(server) {
      const runtime = await createDevRuntime(server);
      const entry = resolveBootstrapEntry(
        serverOptions.entry,
        serverOptions.bootstrapEntryName
      );
      const entrypoint = path.resolve(server.config.root, entry);
      const resolveHandler = createResolver({
        entrypoint,
        exportName,
        runtime,
      });
      const middleware = createMiddleware(resolveHandler);

      if (warmupOnStart) {
        server.httpServer?.once("listening", async () => {
          await resolveHandler();
        });
      }

      return () => {
        server.middlewares.use(middleware);
      };
    },
    async configurePreviewServer(server) {
      const runtime = createProdRuntime();

      const entrypoint = await resolvePreviewEntry(
        server.config.build.outDir,
        serverOptions.previewEntry
      );
      const resolveHandler = createResolver({
        entrypoint,
        exportName,
        runtime,
      });
      const middleware = createMiddleware(resolveHandler);

      if (warmupOnStart) {
        server.httpServer.once("listening", async () => {
          await resolveHandler();
        });
      }

      return () => {
        server.middlewares.use(middleware);
      };
    },
  };

  return [viteSelfServer, selfServerManifest];
}
