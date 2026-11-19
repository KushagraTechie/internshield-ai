import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { AnalysisReport } from "@/lib/types";

const ink = rgb(0.08, 0.1, 0.16);
const muted = rgb(0.34, 0.39, 0.47);
const olive = rgb(0.31, 0.43, 0.26);
const line = rgb(0.85, 0.86, 0.81);

function printable(value: string) {
  return value.normalize("NFKD").replace(/[^\x20-\x7E]/g, " ").replace(/\s+/g, " ").trim();
}

function wrap(text: string, font: PDFFont, size: number, width: number) {
  const words = printable(text).split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && font.widthOfTextAtSize(candidate, size) > width) {
      lines.push(current);
      current = word;
    } else current = candidate;
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

export async function createReportPdf(report: AnalysisReport) {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`InternShield report - ${printable(report.internship.company)}`);
  pdf.setAuthor("InternShield AI");
  pdf.setSubject("Internship opportunity risk review");
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const logoBytes = await readFile(path.join(process.cwd(), "public", "logo.png"));
  const logo = await pdf.embedPng(logoBytes);
  const pageSize: [number, number] = [612, 792];
  const margin = 52;
  const contentWidth = pageSize[0] - margin * 2;
  let page: PDFPage = pdf.addPage(pageSize);
  let isFirstPage = true;
  let y = 0;

  const newPage = () => {
    if (isFirstPage) isFirstPage = false;
    else page = pdf.addPage(pageSize);
    y = 740;
    page.drawRectangle({ x: 0, y: 770, width: 612, height: 22, color: olive });
    page.drawImage(logo, { x: margin, y: 727, width: 28, height: 28 });
    page.drawText("INTERNSHIELD AI  /  OPPORTUNITY REVIEW", { x: margin + 36, y: 737, size: 9, font: bold, color: olive });
    y = 708;
  };
  const ensure = (height: number) => { if (y - height < 52) newPage(); };
  const paragraph = (text: string, size = 10, font = regular, color = muted, indent = 0) => {
    const lines = wrap(text, font, size, contentWidth - indent);
    ensure(lines.length * (size + 5) + 8);
    for (const item of lines) {
      page.drawText(item, { x: margin + indent, y, size, font, color });
      y -= size + 5;
    }
    y -= 5;
  };

  newPage();
  page.drawText("Internship risk review", { x: margin, y, size: 24, font: bold, color: ink }); y -= 32;
  page.drawText(printable(report.internship.company) || "Company not provided", { x: margin, y, size: 15, font: bold, color: ink }); y -= 22;
  paragraph(report.internship.title || "Role not provided", 11, regular, muted);
  const riskColor = report.riskLevel === "high" ? rgb(0.72, 0.2, 0.25) : report.riskLevel === "medium" ? rgb(0.68, 0.42, 0.06) : rgb(0.12, 0.48, 0.34);
  ensure(68);
  page.drawRectangle({ x: margin, y: y - 48, width: contentWidth, height: 60, color: rgb(0.96, 0.96, 0.98), borderColor: line, borderWidth: 1 });
  page.drawText(`RISK SCORE  ${report.riskScore}/100`, { x: margin + 14, y: y - 10, size: 10, font: bold, color: muted });
  page.drawText(printable(report.riskLevel).toUpperCase(), { x: margin + 14, y: y - 34, size: 17, font: bold, color: riskColor });
  y -= 70;
  paragraph(report.recommendedAction, 11, bold, ink);
  page.drawText("FINDINGS", { x: margin, y, size: 10, font: bold, color: olive }); y -= 19;
  if (!report.findings.length) paragraph("No warning indicators matched the submitted details. This does not prove that the opportunity is legitimate.");
  for (const finding of report.findings) {
    ensure(40);
    page.drawText(`${printable(finding.severity).toUpperCase()}  ${printable(finding.title)}`, { x: margin, y, size: 11, font: bold, color: ink }); y -= 17;
    paragraph(finding.description, 10, regular, muted, 8);
    if (finding.evidence.length) paragraph(`Evidence: ${finding.evidence.join("; ")}`, 9, regular, muted, 8);
    paragraph(`Suggested next step: ${finding.severity === "high" ? "Do not pay or share sensitive information; independently verify the employer." : "Check this detail using an independently found official source."}`, 9, bold, ink, 8);
    page.drawLine({ start: { x: margin, y: y + 2 }, end: { x: margin + contentWidth, y: y + 2 }, thickness: 0.6, color: line });
    y -= 10;
  }
  if (report.checksPerformed.length) {
    ensure(26);
    page.drawText("WHAT WAS CHECKED", { x: margin, y, size: 10, font: bold, color: olive }); y -= 17;
    for (const check of report.checksPerformed) paragraph(`- ${check}`, 9, regular, muted, 6);
  }
  if (report.websiteCheck) {
    ensure(26);
    page.drawText("WEBSITE AND THREAT REPUTATION", { x: margin, y, size: 10, font: bold, color: olive }); y -= 17;
    const web = report.websiteCheck;
    paragraph(`URL: ${web.finalUrl ?? web.requestedUrl}`, 9, regular, muted, 6);
    paragraph(`Google Web Risk: ${web.webRisk.status}${web.webRisk.threatTypes.length ? ` (${web.webRisk.threatTypes.join(", ")})` : ""}${web.webRisk.checkedAt ? `; checked ${new Date(web.webRisk.checkedAt).toISOString()}` : ""}`, 9, regular, muted, 6);
    for (const item of [...web.evidence, ...web.limitations]) paragraph(`- ${item}`, 9, regular, muted, 6);
  }
  if (report.limitations.length) {
    ensure(26);
    page.drawText("LIMITATIONS", { x: margin, y, size: 10, font: bold, color: olive }); y -= 17;
    for (const limitation of report.limitations) paragraph(`- ${limitation}`, 9, regular, muted, 6);
  }
  paragraph(`Reviewed ${new Date(report.analyzedAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })} (UTC).`, 8, regular, muted);
  page.drawLine({ start: { x: margin, y: 42 }, end: { x: margin + contentWidth, y: 42 }, thickness: 0.7, color: line });
  page.drawText("Informational screening only. A score is not proof of legitimacy or fraud. Verify important claims independently.", { x: margin, y: 27, size: 7.5, font: regular, color: muted, maxWidth: contentWidth });
  return pdf.save();
}
