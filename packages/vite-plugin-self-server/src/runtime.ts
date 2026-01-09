import assert from "node:assert";
import type { ViteDevServer } from "vite";

import type { RuntimeContract } from "./types";

export function createProdRuntime(): RuntimeContract {
  return {
    executeEntrypoint(id: string) {
      return import(id);
    },
  };
}

export async function createDevRuntime(
  server: ViteDevServer
): Promise<RuntimeContract> {
  const vite = await import("vite");
  const version = parseInt(vite.version.split(".")[0] as string, 10);

  // support legacy runtime
  if (version < 6) {
    assert(
      "createViteRuntime" in vite &&
        typeof vite.createViteRuntime === "function",
      `createViteRuntime is not supported in vite@${vite.version}. Please update vite to latest version!`
    );

    const runtime = await vite.createViteRuntime(server);

    return {
      executeEntrypoint(id: string) {
        return runtime.executeEntrypoint(id);
      },
    };
  }

  const ssrEnvironment = server.environments.ssr;

  assert(vite.isRunnableDevEnvironment(ssrEnvironment));

  return {
    executeEntrypoint(id: string) {
      return ssrEnvironment.runner.import(id);
    },
  };
}
