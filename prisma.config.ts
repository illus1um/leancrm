import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // For Turso (libSQL) the auth token is appended to DATABASE_URL as a query
  // parameter, e.g. libsql://<db>.turso.io?authToken=<token>. The runtime
  // Prisma client (src/lib/db.ts) reads TURSO_AUTH_TOKEN separately.
  datasource: {
    url: process.env["DATABASE_URL"] ?? "file:./dev.db",
  },
});
