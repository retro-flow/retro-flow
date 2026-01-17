import type { Config } from "prettier";

import recommended from "./recomended-config";

export const configs = {
  recommended,
};

export function defineConfig(config: Config): Config {
  return config;
}
