import { drizzle } from "drizzle-orm/neon-http";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn("[Database] Missing DATABASE_URL in env.");
}

export const db = drizzle(databaseUrl || "");
