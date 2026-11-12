import { getAnalysisReport } from "@/lib/db";
import { createReportPdf } from "@/lib/report-pdf";
import { authenticateFirebaseRequest } from "@/lib/firebase-server-auth";
import { NextResponse } from "next/server";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const authentication = await authenticateFirebaseRequest(request);
  if (!authentication.ok) return NextResponse.json({ success: false, message: authentication.message }, { status: authentication.status });
  const { id } = await context.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ success: false, message: "Report not found." }, { status: 404 });
  }
  try {
    const saved = await getAnalysisReport(authentication.user.uid, id);
    if (!saved) return NextResponse.json({ success: false, message: "Report not found." }, { status: 404 });
    const bytes = await createReportPdf(saved.report);
    const filename = `internshield-${saved.report.internship.company.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "report"}.pdf`;
    return new Response(Buffer.from(bytes), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${filename}"`, "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Report PDF generation failed:", error);
    return NextResponse.json({ success: false, message: "Unable to prepare the PDF right now." }, { status: 503 });
  }
}
