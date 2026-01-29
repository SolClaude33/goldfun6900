// Para que funcione en Windows sin cross-env
if (typeof process.env.NODE_ENV === "undefined") process.env.NODE_ENV = "development";

import express, { type Request, Response, NextFunction, type Express } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

/** Build and return the Express app (and server for local listen). */
export async function createApp(): Promise<{ app: Express; httpServer: ReturnType<typeof createServer> }> {
  const app = express();
  const httpServer = createServer(app);

  app.use(
    express.json({
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );
  app.use(express.urlencoded({ extended: false }));

  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;
    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }
        log(logLine);
      }
    });
    next();
  });

  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
    serveStatic(app);
  } else if (!process.env.VERCEL) {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  return { app, httpServer };
}

// Run HTTP server only when not on Vercel (serverless uses api/index.ts)
if (!process.env.VERCEL) {
  (async () => {
    const { httpServer } = await createApp();
    const port = parseInt(process.env.PORT || "5000", 10);
    const host = process.env.HOST || "127.0.0.1";
    httpServer.listen({ port, host }, () => {
      log(`serving at http://${host}:${port}`);
    });
  })();
}
