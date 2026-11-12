import assert from "node:assert/strict";
import nextEnv from "@next/env";
import { neon } from "@neondatabase/serverless";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is missing. Add the Neon connection string to .env.local first.");
}

const sql = neon(connectionString);
const suffix = crypto.randomUUID();
const userId = `neon-smoke-${suffix}`;
const companyName = `Neon smoke test ${suffix}`;
const reportId = crypto.randomUUID();
const verificationId = crypto.randomUUID();
const auditId = crypto.randomUUID();
const analyzedAt = new Date().toISOString();
const report = {
  internship: {
    company: companyName,
    title: "Temporary database smoke test",
    description: "Synthetic record created and removed by the Neon report smoke test.",
    recruiterEmail: "",
    applicationUrl: "",
  },
  riskScore: 0,
  riskLevel: "low",
  findings: [],
  recommendedAction: "Smoke test only.",
  checksPerformed: [],
  limitations: [],
  analyzedAt,
};

let passed = false;
try {
  await sql`
    WITH user_row AS (
      INSERT INTO users (firebase_uid, email)
      VALUES (${userId}, NULL)
      ON CONFLICT (firebase_uid) DO UPDATE SET updated_at = now()
      RETURNING firebase_uid
    ),
    company_row AS (
      INSERT INTO companies (id, name, normalized_name)
      VALUES (${crypto.randomUUID()}::uuid, ${companyName}, lower(trim(${companyName})))
      ON CONFLICT (normalized_name) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    ),
    report_row AS (
      INSERT INTO analysis_reports (id, user_id, company_id, report_json, analyzed_at)
      SELECT ${reportId}::uuid, user_row.firebase_uid, company_row.id, ${JSON.stringify(report)}::jsonb, ${analyzedAt}::timestamptz
      FROM user_row CROSS JOIN company_row
      RETURNING id, user_id, company_id
    ),
    verification_row AS (
      INSERT INTO verification_records (id, report_id, user_id, company_id, status, risk_score, risk_level)
      SELECT ${verificationId}::uuid, report_row.id, report_row.user_id, report_row.company_id,
        'completed', ${report.riskScore}, ${report.riskLevel}
      FROM report_row
      RETURNING id
    )
    INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details)
    SELECT ${auditId}::uuid, report_row.user_id, 'analysis_report.created', 'analysis_report', report_row.id,
      jsonb_build_object('verification_record_id', verification_row.id, 'risk_level', ${report.riskLevel}::text)
    FROM report_row CROSS JOIN verification_row
  `;

  const history = await sql`
    SELECT id::text, report_json
    FROM analysis_reports
    WHERE user_id = ${userId}
    ORDER BY analyzed_at DESC
    LIMIT 5
  `;
  assert.equal(history.length, 1, "The temporary report should appear in this user's history.");
  assert.equal(history[0].id, reportId, "History should return the saved report ID.");
  assert.equal(history[0].report_json.internship.company, companyName);

  const individual = await sql`
    SELECT id::text, report_json
    FROM analysis_reports
    WHERE user_id = ${userId} AND id = ${reportId}::uuid
    LIMIT 1
  `;
  assert.equal(individual.length, 1, "The temporary report should be retrievable by its owner and ID.");
  assert.equal(individual[0].report_json.internship.title, report.internship.title);
  passed = true;
} finally {
  await sql`DELETE FROM audit_logs WHERE entity_id = ${reportId}::uuid`;
  await sql`DELETE FROM analysis_reports WHERE id = ${reportId}::uuid AND user_id = ${userId}`;
  await sql`DELETE FROM users WHERE firebase_uid = ${userId}`;
  await sql`
    DELETE FROM companies
    WHERE normalized_name = lower(trim(${companyName}))
      AND NOT EXISTS (
        SELECT 1 FROM analysis_reports WHERE analysis_reports.company_id = companies.id
      )
  `;
}

if (passed) {
  console.log("Neon report insert, history, retrieval, and cleanup smoke test passed.");
}
