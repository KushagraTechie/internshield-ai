import { NextResponse } from "next/server";
import { listAnalysisReports } from "@/lib/db";
import { authenticateFirebaseRequest } from "@/lib/firebase-server-auth";

export async function GET(request: Request) {
  const authentication = await authenticateFirebaseRequest(request);
  if (!authentication.ok) {
    return NextResponse.json(
      { success: false, message: authentication.message },
      { status: authentication.status }
    );
  }

  const requestedLimit = Number(new URL(request.url).searchParams.get("limit") ?? 20);
  const limit = Number.isFinite(requestedLimit)
    ? Math.max(1, Math.min(100, Math.floor(requestedLimit)))
    : 20;

  try {
    const reports = await listAnalysisReports(authentication.user.uid, limit);
    return NextResponse.json({ success: true, reports });
  } catch (error) {
    console.error("Neon report history lookup failed:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load report history." },
      { status: 503 }
    );
  }
}
