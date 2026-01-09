import type { IncomingMessage, ServerResponse } from "node:http";
import type { Rollup } from "vite";

export interface RuntimeContract {
  executeEntrypoint(id: string): Promise<Record<string, any>>;
}

export type ServerHandler = (
  req: IncomingMessage,
  res: ServerResponse
) => void | Promise<void>;

export type ServerEntry = string | Record<string, string>;

export interface OutputOptions {
  /**
   * @default
   * For client:
   * - 'static/[name].[hash].js'
   * For server:
   * - 'server/[name].js'
   */
  entry?: Rollup.OutputOptions["entryFileNames"];
  /**
   * @default
   * For client:
   * - 'static/chunks/[name].[hash].js'
   * For server:
   * - 'server/deps/[name].[hash].js'
   */
  chunk?: Rollup.OutputOptions["chunkFileNames"];
  /**
   * @default
   * For client:
   * - 'static/assets/[name].[hash].[ext]'
   * For server:
   * - 'server/assets/[name].[hash].[ext]'
   */
  asset?: Rollup.OutputOptions["assetFileNames"];
}

export interface CommonOptions {
  output?: OutputOptions;
}

export interface ClientOptions extends CommonOptions {
  /**
   * @default 'src/client/main.ts'
   */
  entry?: Rollup.InputOption;
}

export interface ServerOptions extends CommonOptions {
  /**
   * @default 'src/server/main.ts'
   */
  entry?: ServerEntry;
  /**
   * @default 'main'
   */
  bootstrapEntryName?: string;
  /**
   * @default 'server/main.js'
   */
  previewEntry?: string;
  /**
   * @default 'default'
   */
  exportName?: string;
  /**
   * @default false
   */
  warmupOnStart?: boolean;
}

export interface SelfServerUserConfig {
  server?: ServerOptions;
  client?: ClientOptions;
}
