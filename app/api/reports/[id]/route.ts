import { NextResponse } from "next/server";
import { getAnalysisReport } from "@/lib/db";
import { authenticateFirebaseRequest } from "@/lib/firebase-server-auth";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const authentication = await authenticateFirebaseRequest(request);
  if (!authentication.ok) {
    return NextResponse.json(
      { success: false, message: authentication.message },
      { status: authentication.status }
    );
  }

  const { id } = await context.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json(
      { success: false, message: "Report not found." },
      { status: 404 }
    );
  }

  try {
    const report = await getAnalysisReport(authentication.user.uid, id);
    if (!report) {
      return NextResponse.json(
        { success: false, message: "Report not found." },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error("Neon report lookup failed:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load this report." },
      { status: 503 }
    );
  }
}
