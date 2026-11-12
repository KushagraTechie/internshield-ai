import { readFile } from "node:fs/promises";
import path from "node:path";
import nextEnv from "@next/env";
import { neon } from "@neondatabase/serverless";

const projectDir = process.cwd();
const { loadEnvConfig } = nextEnv;
loadEnvConfig(projectDir);

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is missing. Add your Neon connection string to .env.local first.");
  process.exit(1);
}

const schemaPath = path.join(projectDir, "db", "schema.sql");
const schema = await readFile(schemaPath, "utf8");
const statements = schema
  .split(";")
  .map((statement) => statement.trim())
  .filter((statement) =>
    statement &&
    !statement.split(/\r?\n/).every((line) => !line.trim() || line.trim().startsWith("--"))
  );

const sql = neon(connectionString);
for (const statement of statements) {
  await sql.query(statement);
}

const result = await sql`
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('users', 'companies', 'analysis_reports', 'verification_records', 'audit_logs')
`;
const installedTables = new Set(result.map((row) => String(row.table_name)));
const requiredTables = ["users", "companies", "analysis_reports", "verification_records", "audit_logs"];
const missingTables = requiredTables.filter((table) => !installedTables.has(table));
if (missingTables.length > 0) {
  throw new Error(`Schema setup finished, but these tables are missing: ${missingTables.join(", ")}.`);
}

console.log(`Neon schema is ready. Confirmed tables: ${requiredTables.join(", " )}.`);

const requiredWelcomeColumns = ["display_name", "welcome_email_claimed_at", "welcome_email_sent_at"];
const welcomeColumns = await sql`
  SELECT column_name
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'users'
    AND column_name IN ('display_name', 'welcome_email_claimed_at', 'welcome_email_sent_at')
`;
const installedWelcomeColumns = new Set(welcomeColumns.map((row) => String(row.column_name)));
const missingWelcomeColumns = requiredWelcomeColumns.filter((column) => !installedWelcomeColumns.has(column));
if (missingWelcomeColumns.length > 0) {
  throw new Error(`Schema setup finished, but these user email columns are missing: ${missingWelcomeColumns.join(", ")}.`);
}
console.log(`Confirmed account-email columns: ${requiredWelcomeColumns.join(", ")}.`);
