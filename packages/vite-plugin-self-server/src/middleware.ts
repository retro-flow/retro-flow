import type { Connect } from "vite";

import type { ServerHandler } from "./types";

export function createMiddleware(
  resolveHandler: () => ServerHandler | Promise<ServerHandler>
): Connect.NextHandleFunction {
  return async (req, res, next) => {
    try {
      const handler = await resolveHandler();

      await handler(req, res);
    } catch (err) {
      next(err);
    }
  };
}
