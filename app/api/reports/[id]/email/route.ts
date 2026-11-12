import { getAnalysisReport } from "@/lib/db";
import { reportEmailFailureMessage, sendReportEmail } from "@/lib/email-report";
import { authenticateFirebaseRequest } from "@/lib/firebase-server-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const authentication = await authenticateFirebaseRequest(request);
  if (!authentication.ok) return NextResponse.json({ success: false, message: authentication.message }, { status: authentication.status });
  if (!authentication.user.emailVerified || !authentication.user.email) {
    return NextResponse.json({ success: false, message: "Verify your account email before sending reports." }, { status: 403 });
  }
  const { id } = await context.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ success: false, message: "Report not found." }, { status: 404 });
  }
  try {
    const saved = await getAnalysisReport(authentication.user.uid, id);
    if (!saved) return NextResponse.json({ success: false, message: "Report not found." }, { status: 404 });
    await sendReportEmail(saved.report, authentication.user.email);
    return NextResponse.json({ success: true, message: `PDF report sent to ${authentication.user.email}.` });
  } catch (error) {
    console.error("Report email delivery failed:", error);
    const message = reportEmailFailureMessage(error);
    return NextResponse.json({ success: false, code: error instanceof Error ? error.message.split(":")[0] : "EMAIL_DELIVERY_FAILED", message: `${message} PDF download is available now.` }, { status: 503 });
  }
}
