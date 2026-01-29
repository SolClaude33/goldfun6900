/**
 * Vercel serverless: todas las peticiones /api/* llegan aquí.
 * App autónoma en api/lib (sin depender de ../server) para evitar ERR_MODULE_NOT_FOUND.
 */
import { createApp } from "./lib/app";

let cached: ReturnType<typeof createApp> | null = null;

export default async function handler(req: any, res: any) {
  if (!cached) cached = createApp();
  return new Promise<void>((resolve, reject) => {
    const onDone = () => resolve();
    res.once("finish", onDone);
    res.once("close", onDone);
    res.on("error", reject);
    try {
      cached!(req, res);
    } catch (err) {
      reject(err);
    }
  });
}
