import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import type { AnalysisReport } from "@/lib/types";

export type FirebaseIdentity = {
  uid: string;
  email?: string;
  displayName?: string;
};

export type SavedReport = {
  id: string;
  report: AnalysisReport;
  analyzedAt: string;
};

let neonClient: NeonQueryFunction<false, false> | undefined;

function getSql() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  neonClient ??= neon<false, false>(connectionString);
  return neonClient;
}

export async function checkDatabase() {
  const sql = getSql();
  const rows = await sql`SELECT current_database() AS database_name, to_regclass('public.analysis_reports') AS reports_table`;
  return rows[0] as { database_name: string; reports_table: string | null };
}

export async function reserveWebRiskLookup() {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO web_risk_usage (usage_month, request_count)
    VALUES (date_trunc('month', now())::date, 1)
    ON CONFLICT (usage_month) DO UPDATE SET
      request_count = web_risk_usage.request_count + 1,
      updated_at = now()
    WHERE web_risk_usage.request_count < 75000
    RETURNING request_count
  `;
  return rows.length > 0;
}

export async function claimWelcomeEmail(user: FirebaseIdentity) {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO users (firebase_uid, email, display_name, welcome_email_claimed_at)
    VALUES (${user.uid}, ${user.email ?? null}, ${user.displayName ?? null}, now())
    ON CONFLICT (firebase_uid) DO UPDATE SET
      email = COALESCE(EXCLUDED.email, users.email),
      display_name = COALESCE(EXCLUDED.display_name, users.display_name),
      welcome_email_claimed_at = now(),
      updated_at = now()
    WHERE users.welcome_email_sent_at IS NULL
      AND (users.welcome_email_claimed_at IS NULL OR users.welcome_email_claimed_at < now() - interval '10 minutes')
    RETURNING firebase_uid
  `;
  return rows.length > 0;
}

export async function markWelcomeEmailSent(userId: string) {
  const sql = getSql();
  await sql`
    UPDATE users
    SET welcome_email_claimed_at = NULL, welcome_email_sent_at = now(), updated_at = now()
    WHERE firebase_uid = ${userId} AND welcome_email_sent_at IS NULL
  `;
}

export async function releaseWelcomeEmailClaim(userId: string) {
  const sql = getSql();
  await sql`
    UPDATE users SET welcome_email_claimed_at = NULL, updated_at = now()
    WHERE firebase_uid = ${userId} AND welcome_email_sent_at IS NULL
  `;
}

export async function saveAnalysisReport(
  user: FirebaseIdentity,
  reportId: string,
  report: AnalysisReport
) {
  const sql = getSql();
  const companyId = crypto.randomUUID();
  const verificationId = crypto.randomUUID();
  const auditId = crypto.randomUUID();
  const analyzedAt = new Date(report.analyzedAt);

  await sql`
    WITH user_row AS (
      INSERT INTO users (firebase_uid, email)
      VALUES (${user.uid}, ${user.email ?? null})
      ON CONFLICT (firebase_uid) DO UPDATE SET
        email = COALESCE(EXCLUDED.email, users.email),
        updated_at = now()
      RETURNING firebase_uid
    ),
    company_row AS (
      INSERT INTO companies (id, name, normalized_name)
      VALUES (${companyId}::uuid, ${report.internship.company}, lower(trim(${report.internship.company})))
      ON CONFLICT (normalized_name) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    ),
    report_row AS (
      INSERT INTO analysis_reports (id, user_id, company_id, report_json, analyzed_at)
      SELECT ${reportId}::uuid, user_row.firebase_uid, company_row.id, ${JSON.stringify(report)}::jsonb, ${analyzedAt.toISOString()}::timestamptz
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

  return reportId;
}

export async function listAnalysisReports(userId: string, limit: number) {
  const sql = getSql();
  const rows = await sql`
    SELECT id::text, report_json, analyzed_at
    FROM analysis_reports
    WHERE user_id = ${userId}
    ORDER BY analyzed_at DESC
    LIMIT ${limit}
  `;

  return rows.map((row) => ({
    id: String(row.id),
    report: row.report_json as AnalysisReport,
    analyzedAt: new Date(String(row.analyzed_at)).toISOString(),
  })) satisfies SavedReport[];
}

export async function getAnalysisReport(userId: string, reportId: string) {
  const sql = getSql();
  const rows = await sql`
    SELECT id::text, report_json, analyzed_at
    FROM analysis_reports
    WHERE user_id = ${userId} AND id = ${reportId}::uuid
    LIMIT 1
  `;
  const row = rows[0];

  if (!row) return null;
  return {
    id: String(row.id),
    report: row.report_json as AnalysisReport,
    analyzedAt: new Date(String(row.analyzed_at)).toISOString(),
  } satisfies SavedReport;
}
