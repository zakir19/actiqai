import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn("[Database] Missing DATABASE_URL in env.");
}

// Create a lazy database connection that only initializes when accessed
let _db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!_db) {
    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    const sql = neon(databaseUrl);
    _db = drizzle(sql);
  }
  return _db;
}

// Export a Proxy that lazily initializes the database connection
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    const dbInstance = getDb();
    const value = dbInstance[prop as keyof typeof dbInstance];
    return typeof value === 'function' ? value.bind(dbInstance) : value;
  }
});
