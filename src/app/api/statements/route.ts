import { NextRequest, NextResponse } from "next/server";
import { readSessionFromCookies } from "@/lib/mawj/session";
import { getSupabase, PROFILE_ID } from "@/lib/mawj/supabase-server";
import { WORK_CATEGORIES } from "@/lib/mawj/workbench";
import { jsPDF } from "jspdf";
import { readFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const NAVY = "#000F32";
const MAGENTA = "#82134C";
const GRAY = "#7F7F7F";

function money(n: number, ccy: string): string {
  const sym = ccy === "EUR" ? "€" : ccy === "USD" ? "$" : ccy === "AED" ? "AED " : "";
  return `${sym}${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * POST /api/statements — generate a CBI-branded account statement PDF.
 * Body: { accountId, from: "YYYY-MM-DD", to: "YYYY-MM-DD" }
 * Returns: application/pdf binary.
 */
export async function POST(req: NextRequest) {
  const session = await readSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const { accountId, from, to } = (body ?? {}) as {
    accountId?: string;
    from?: string;
    to?: string;
  };
  if (!accountId || !from || !to) {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }
  const supabase = getSupabase();

  const { data: account } = await supabase
    .from("accounts")
    .select("*")
    .eq("id", accountId)
    .eq("profile_id", PROFILE_ID)
    .maybeSingle();
  if (!account) {
    return NextResponse.json({ error: "account_not_found" }, { status: 404 });
  }

  // Statement rows: settled/rejected statement entries in the window for this account.
  const { data: rows } = await supabase
    .from("transactions")
    .select("*")
    .eq("profile_id", PROFILE_ID)
    .eq("account_id", accountId)
    .gte("occurred_at", from)
    .lte("occurred_at", `${to}T23:59:59Z`)
    .not("category", "in", `(${WORK_CATEGORIES.map((c) => `"${c}"`).join(",")})`)
    .order("occurred_at", { ascending: true });

  // Opening balance: closing minus movements in window.
  let movements = 0;
  let debit = 0;
  let credit = 0;
  for (const r of rows ?? []) {
    const amt = Number(r.amount) * (r.type === "expense" ? -1 : 1);
    movements += amt;
    if (amt < 0) debit += -amt;
    else credit += amt;
  }
  const closing = Number(account.balance);
  const opening = closing - movements;

  // ---------- PDF ----------
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();

  // Logo — read the authentic CBI lockup from public/ at runtime (small variant keeps the PDF light).
  let logoData: string | null = null;
  try {
    const p = path.join(process.cwd(), "public", "icons", "cbi-logo-sm.png");
    logoData = `data:image/png;base64,${(await readFile(p)).toString("base64")}`;
  } catch {
    /* logo optional */
  }

  // Navy header band.
  doc.setFillColor(0, 15, 50);
  doc.rect(0, 0, W, 96, "F");
  if (logoData) {
    try {
      // cbi-logo-sm is 275×96 → render at height 26 for a crisp header lockup.
      doc.addImage(logoData, "PNG", 40, 22, 74.6, 26);
    } catch {
      /* ignore */
    }
  } else {
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("CBI", 40, 40);
  }
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("Account Statement", W - 40, 36, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(190, 195, 210);
  doc.text("Commercial Bank International PJSC · Regulated by the Central Bank of the UAE", W - 40, 52, { align: "right" });
  doc.text("P.O. Box 3982, Dubai, United Arab Emirates · CLBIAEADXXX", W - 40, 64, { align: "right" });

  // Magenta accent strip.
  doc.setFillColor(130, 19, 76);
  doc.rect(0, 96, W, 4, "F");

  // Account header block.
  let y = 128;
  doc.setTextColor(30, 30, 30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(account.label as string, 40, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  y += 15;
  doc.text(`Account Holder: Aspidus DMCC (DMCC-194827)`, 40, y);
  y += 12;
  doc.text(`IBAN: ${(account.iban as string).replace(/\s/g, "")}   ·   BIC: ${account.bic as string}`, 40, y);
  y += 12;
  const fmtD = (s: string) => new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  doc.text(`Statement period: ${fmtD(from)} — ${fmtD(to)}   ·   Generated ${new Date().toLocaleDateString("en-GB")} ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`, 40, y);

  // Summary box.
  y += 22;
  const boxH = 66;
  doc.setFillColor(247, 247, 247);
  doc.setDrawColor(217, 217, 217);
  doc.roundedRect(40, y, W - 80, boxH, 3, 3, "FD");
  const colW = (W - 80) / 4;
  const labels: [string, string][] = [
    ["Opening Balance", money(opening, account.currency as string)],
    ["Total Debits", money(debit, account.currency as string)],
    ["Total Credits", money(credit, account.currency as string)],
    ["Closing Balance", money(closing, account.currency as string)],
  ];
  labels.forEach(([label, value], i) => {
    const x = 40 + colW * i + 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(127, 127, 127);
    doc.text(label.toUpperCase(), x, y + 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(30, 30, 30);
    doc.text(value, x, y + 38);
  });

  // Table header.
  y += boxH + 18;
  doc.setFillColor(0, 15, 50);
  doc.rect(40, y - 12, W - 80, 22, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("DATE", 46, y + 3);
  doc.text("DESCRIPTION", 130, y + 3);
  doc.text("REFERENCE", 330, y + 3);
  doc.text("DEBIT", 430, y + 3, { align: "right" });
  doc.text("CREDIT", W - 46, y + 3, { align: "right" });

  // Rows.
  y += 22;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const list = rows ?? [];
  if (list.length === 0) {
    doc.setTextColor(127, 127, 127);
    doc.text("No transactions in this period.", 46, y + 4);
    y += 20;
  }
  for (const r of list) {
    if (y > 780) {
      doc.addPage();
      y = 60;
    }
    const d = new Date(r.occurred_at as string).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const desc = `${r.counterparty as string} — ${r.category as string}`;
    const amt = Number(r.amount);
    const isExpense = r.type === "expense";
    doc.setTextColor(60, 60, 60);
    doc.text(d, 46, y);
    doc.setTextColor(30, 30, 30);
    doc.text(desc.length > 46 ? `${desc.slice(0, 46)}…` : desc, 130, y);
    doc.setTextColor(110, 110, 110);
    doc.text(r.reference as string, 330, y);
    doc.setTextColor(isExpense ? 150 : 30, isExpense ? 40 : 30, isExpense ? 60 : 30);
    if (isExpense) doc.text(`(${money(amt, r.currency as string).replace("AED ", "")})`, 430, y, { align: "right" });
    else doc.text(money(amt, r.currency as string).replace("AED ", ""), W - 46, y, { align: "right" });
    if (r.status === "Rejected") {
      doc.setTextColor(130, 19, 76);
      doc.text("REJECTED", W - 46, y - 9, { align: "right" });
      doc.setFontSize(9);
    }
    y += 6;
    doc.setDrawColor(235, 235, 235);
    doc.line(46, y, W - 46, y);
    y += 12;
  }

  // Footer.
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setDrawColor(217, 217, 217);
    doc.line(40, 800, W - 40, 800);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(127, 127, 127);
    doc.text(`Aspidus DMCC · ${account.label as string} · ${new Date(from).toLocaleDateString("en-GB")} – ${new Date(to).toLocaleDateString("en-GB")}`, 40, 814);
    doc.text(`Page ${i} of ${pages}`, W - 40, 814, { align: "right" });
  }

  const buf = Buffer.from(doc.output("arraybuffer"));
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="CBI-Statement-${(account.currency as string)}-${from}-to-${to}.pdf"`,
    },
  });
}
