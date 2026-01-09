import type { RuntimeContract } from "./types";

export interface ResolverConfig {
  runtime: RuntimeContract;
  entrypoint: string;
  exportName: string;
}

export function createResolver(config: ResolverConfig) {
  const { entrypoint, exportName, runtime } = config;

  return async () => {
    const mod = await runtime.executeEntrypoint(entrypoint);
    const handler = mod[exportName];

    return handler;
  };
}
