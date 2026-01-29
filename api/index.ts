/**
 * Vercel serverless entry: all /api/* requests are handled here.
 * Static files (client) are served by Vercel from dist/public (outputDirectory).
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createApp } from "../server/index";

let cached: Awaited<ReturnType<typeof createApp>> | null = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!cached) {
    cached = await createApp();
  }
  return cached.app(req as any, res as any);
}
