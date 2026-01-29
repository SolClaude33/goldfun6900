import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

const isDev = process.env.NODE_ENV !== "production";
const hasDatabaseUrl = !!process.env.DATABASE_URL;

if (!hasDatabaseUrl && !isDev) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const hasDb = hasDatabaseUrl;
if (!hasDatabaseUrl && isDev) {
  console.log("[db] Sin DATABASE_URL: usando almacenamiento en memoria (solo desarrollo).");
}
export const pool = hasDatabaseUrl
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : (null as unknown as pg.Pool);
export const db = hasDatabaseUrl ? drizzle(pool, { schema }) : (null as unknown as ReturnType<typeof drizzle<typeof schema>>);
