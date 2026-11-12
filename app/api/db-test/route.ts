import { NextResponse } from "next/server";
import { checkDatabase } from "@/lib/db";

export async function GET(request: Request) {
  // Reading request data marks this handler as request-time work under Cache Components.
  void request.url;

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { success: false, message: "DATABASE_URL is not configured." },
      { status: 503 }
    );
  }

  try {
    const result = await checkDatabase();
    if (!result.reports_table) {
      return NextResponse.json(
        { success: false, message: "Neon is reachable, but the schema has not been installed." },
        { status: 503 }
      );
    }

    return NextResponse.json({ success: true, message: "Neon PostgreSQL is ready." });
  } catch (error) {
    console.error("Neon database check failed:", error instanceof Error ? error.message : "Unknown database error");
    return NextResponse.json(
      { success: false, message: "The database is unavailable or DATABASE_URL is not configured." },
      { status: 503 }
    );
  }
}
