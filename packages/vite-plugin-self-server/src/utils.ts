import fs, { promises as fsp } from "node:fs";
import path from "node:path";

import { select } from "@inquirer/prompts";

import type { SelfServerUserConfig, ServerEntry } from "./types";

export const SERVER_MANIFEST_FILE_NAME = ".server-manifest.json";

export function normalizeConfig(config: SelfServerUserConfig) {
  return {
    client: {
      entry: config.client?.entry ?? "src/client/main.ts",
      output: {
        entry: config.client?.output?.entry ?? "static/[name].[hash].js",
        chunk: config.client?.output?.chunk ?? "static/chunks/[name].[hash].js",
        asset:
          config.client?.output?.asset ?? "static/assets/[name].[hash].[ext]",
      },
    },
    server: {
      previewEntry: config.server?.previewEntry,
      bootstrapEntryName: config.server?.bootstrapEntryName,
      entry: config.server?.entry ?? "src/server/main.ts",
      output: {
        entry: config.server?.output?.entry ?? "server/[name].js",
        chunk: config.server?.output?.chunk ?? "server/deps/[name].[hash].js",
        asset:
          config.server?.output?.asset ?? "server/assets/[name].[hash].[ext]",
      },
      exportName: config.server?.exportName ?? "default",
      warmupOnStart: config.server?.warmupOnStart ?? false,
    },
  } satisfies SelfServerUserConfig;
}

export async function resolvePreviewEntry(
  outDir: string,
  defaultPreviewEntry?: string
) {
  if (defaultPreviewEntry) {
    return path.resolve(outDir, defaultPreviewEntry);
  }

  const serverManifestPath = path.resolve(outDir, SERVER_MANIFEST_FILE_NAME);

  if (!fs.existsSync(serverManifestPath)) {
    throw new Error(
      "Preview entrypoint not found. You may have forgotten to run `vite build`"
    );
  }

  const serverManifestContent = await fsp.readFile(serverManifestPath, "utf-8");
  const serverManifest = JSON.parse(serverManifestContent);
  const entrypointNames = Object.keys(serverManifest);

  if (entrypointNames.length === 1) {
    return path.resolve(outDir, serverManifest[entrypointNames[0] as string]);
  }

  const name = await select<string>({
    message: "Select entrypoint:",
    choices: entrypointNames,
  });

  return path.resolve(outDir, serverManifest[name]);
}

export function resolveBootstrapEntry(
  input: ServerEntry,
  bootstrapEntryName = "main"
) {
  if (typeof input === "string") {
    return input;
  }

  const entry = input[bootstrapEntryName];

  if (typeof entry !== "string") {
    throw new Error("Invalid entrypoint");
  }

  return entry;
}
