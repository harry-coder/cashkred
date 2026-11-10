import fs from "fs/promises";
import path from "path";
import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";

export function getTemplatePath() {
  return path.resolve(process.cwd(), (process.env.ESIGN_TEMPLATE_PATH || "templates/loan-agreement.pdf").trim());
}

export interface AgreementValues {
  borrowerName: string;
  address: string;
  pan: string;
  email: string;
  phone: string;
  executionDate: string;
  applicationId: string;
  sanctionDate: string;
  principal: string;
  principalPlain: string; // page 2 already prints "Rupees" before it
  interestRate: string;
  processingFee: string;
  gst: string;
  disbursedAmount: string;
  repaymentDate: string;
  repaymentAmount: string;
  tenure: string;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDayMonthYear(day: number, monthIndex: number, year: number) {
  return `${String(day).padStart(2, "0")}-${MONTHS[monthIndex]}-${year}`;
}

// mysql2 returns DATE columns as Date objects at local midnight, so read them with local getters
function formatDbDate(value: unknown) {
  if (!(value instanceof Date) || isNaN(value.getTime())) return null;
  return formatDayMonthYear(value.getDate(), value.getMonth(), value.getFullYear());
}

function todayInIndia() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", day: "numeric", month: "numeric", year: "numeric" })
      .formatToParts(new Date())
      .map((part) => [part.type, part.value])
  );
  return formatDayMonthYear(Number(parts.day), Number(parts.month) - 1, Number(parts.year));
}

// Amount columns are varchar, so accept values like "30000", "30,000" or "Rs. 30000"
function parseNumber(value: unknown) {
  const text = String(value ?? "").replace(/rs\.?|₹|,|days?|\s/gi, "");
  if (!text) return null;
  const number = Number(text);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function formatMoney(value: unknown) {
  const number = parseNumber(value);
  return number === null ? null : `Rs. ${number.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function text(value: unknown) {
  const result = String(value ?? "").trim();
  return result || null;
}

// Builds the printed values from the user_info and tbl_loan_details rows.
// Returns the source column names of any value that is missing or invalid.
export function buildAgreementValues(customer: Record<string, any>, loan: Record<string, any>) {
  const name = [text(customer.first_name), text(customer.last_name)].filter(Boolean).join(" ") || null;
  const pincode = text(customer.pincode);
  const address = text(customer.address);
  const tenureDays = parseNumber(loan.tenure);
  const roi = parseNumber(loan.roi);
  const email = text(customer.email);
  const mobile = text(customer.mobile);
  const today = todayInIndia();

  const sources: [keyof AgreementValues, string, string | null][] = [
    ["borrowerName", "user_info.first_name/last_name", name],
    ["address", "user_info.address", address && pincode && !address.includes(pincode) ? `${address} ${pincode}` : address],
    ["pan", "user_info.pan", text(customer.pan)?.toUpperCase() ?? null],
    ["email", "user_info.email", email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null],
    ["phone", "user_info.mobile", mobile && /^[6-9]\d{9}$/.test(mobile) ? mobile : null],
    // The sample agreement uses the signing date for both of these
    ["executionDate", "(today)", today],
    ["sanctionDate", "(today)", today],
    ["applicationId", "loan_number", text(loan.loan_number)],
    ["principal", "tbl_loan_details.approved_amount", formatMoney(loan.approved_amount)],
    ["principalPlain", "tbl_loan_details.approved_amount", parseNumber(loan.approved_amount)?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? null],
    ["interestRate", "tbl_loan_details.roi", roi === null ? null : `${roi}% per day`],
    ["processingFee", "tbl_loan_details.admin_fee", formatMoney(loan.admin_fee)],
    ["gst", "tbl_loan_details.gst", formatMoney(loan.gst)],
    ["disbursedAmount", "tbl_loan_details.disbursed_amount", formatMoney(loan.disbursed_amount)],
    ["repaymentDate", "tbl_loan_details.repayment_date", formatDbDate(loan.repayment_date)],
    ["repaymentAmount", "tbl_loan_details.repayment_amount", formatMoney(loan.repayment_amount)],
    ["tenure", "tbl_loan_details.tenure", tenureDays === null ? null : `${tenureDays} days`],
  ];

  const missing = sources.filter(([, , value]) => !value).map(([, column]) => column);
  const values = Object.fromEntries(sources.map(([key, , value]) => [key, value ?? ""])) as unknown as AgreementValues;
  return { values, missing };
}

interface Slot {
  page: number; // 1-based, in the template exported from blank.docx
  x: number;
  y: number; // text baseline, measured from the top of the page
  size: number;
  maxWidth: number;
  maxLines?: number;
  font: "body" | "table";
}

// Positions of the empty cells in the template, in PDF points (measured from the Word export)
const SCHEDULE = (y: number): Slot => ({ page: 7, x: 282, y, size: 11, maxWidth: 240, font: "table" });
const KFS = (y: number): Slot => ({ page: 8, x: 304.9, y, size: 8.5, maxWidth: 236, font: "table" });

const SLOTS: [keyof AgreementValues, Slot][] = [
  // Position still to be confirmed against the real blank PDF's gap in "(Rupees ____ only)"
  ["principalPlain", { page: 2, x: 51.6, y: 273, size: 9.5, maxWidth: 70, font: "body" }],

  ["borrowerName", { ...SCHEDULE(322.2), x: 284.8 }],
  ["address", { ...SCHEDULE(335), x: 284.8, maxLines: 3 }],
  ["pan", { ...SCHEDULE(371.8), x: 284.8 }],
  ["email", { ...SCHEDULE(408.7), x: 284.8 }],
  ["phone", { ...SCHEDULE(423), x: 284.8 }],
  ["executionDate", SCHEDULE(477.1)],
  ["applicationId", SCHEDULE(491.1)],
  ["sanctionDate", SCHEDULE(505.5)],
  ["principal", SCHEDULE(519.7)],
  ["interestRate", SCHEDULE(534)],
  ["processingFee", SCHEDULE(548.4)],
  ["gst", SCHEDULE(562.8)],
  ["disbursedAmount", SCHEDULE(577.1)],
  ["repaymentDate", SCHEDULE(591.2)],
  ["repaymentAmount", SCHEDULE(605.6)],
  ["tenure", SCHEDULE(620)],

  ["principal", KFS(140.5)],
  ["interestRate", KFS(151.1)],
  ["processingFee", KFS(161.7)],
  ["gst", KFS(172.1)],
  ["disbursedAmount", KFS(182.4)],
  ["tenure", KFS(193)],
  ["repaymentDate", KFS(203.5)],
  ["repaymentAmount", KFS(214)],
];

// Word-wraps text to the slot width, shrinking the font if it still doesn't fit
function layoutText(text: string, font: PDFFont, slot: Slot) {
  const maxLines = slot.maxLines ?? 1;
  for (let size = slot.size; size >= 7; size -= 0.5) {
    const lines: string[] = [];
    for (const word of text.split(/\s+/).filter(Boolean)) {
      const candidate = lines.length ? `${lines[lines.length - 1]} ${word}` : word;
      if (lines.length && font.widthOfTextAtSize(candidate, size) <= slot.maxWidth) {
        lines[lines.length - 1] = candidate;
      } else {
        lines.push(word);
      }
    }
    if (lines.length <= maxLines && lines.every((line) => font.widthOfTextAtSize(line, size) <= slot.maxWidth)) {
      return { lines, size };
    }
  }
  return null;
}

export async function fillAgreement(values: AgreementValues) {
  const pdf = await PDFDocument.load(await fs.readFile(getTemplatePath()));
  const fonts = {
    body: await pdf.embedFont(StandardFonts.Helvetica),
    table: await pdf.embedFont(StandardFonts.TimesRoman),
  };
  const pages = pdf.getPages();

  for (const [key, slot] of SLOTS) {
    const page = pages[slot.page - 1];
    if (!page) throw new Error(`[Agreement] Template has no page ${slot.page}.`);

    // Standard PDF fonts only cover Latin characters, so fail loudly rather than print garbage
    const text = values[key].replace(/\s+/g, " ").trim();
    if (!/^[\x20-\x7E -ÿ]*$/.test(text)) {
      throw Object.assign(new Error(`${key} contains characters that can't be printed on the agreement.`), { code: "UNPRINTABLE_TEXT" });
    }

    const layout = layoutText(text, fonts[slot.font], slot);
    if (!layout) {
      throw Object.assign(new Error(`${key} is too long to fit on the agreement.`), { code: "TEXT_TOO_LONG" });
    }

    layout.lines.forEach((line, i) => {
      page.drawText(line, {
        x: slot.x,
        y: page.getHeight() - slot.y - i * layout.size,
        size: layout.size,
        font: fonts[slot.font],
        color: rgb(0, 0, 0),
      });
    });
  }

  return { pdf: await pdf.save(), pageCount: pages.length };
}

// Signature stamp at the bottom-right of every page. Schedule 1 (page 7) has text down to ~70pt
// above the bottom edge, so the stamp sits below that.
// Surepass doesn't document its coordinate origin; this assumes bottom-left (PDF default) and needs a live check.
export function signaturePositions(pageCount: number) {
  const positions: Record<string, { x: number; y: number }[]> = {};
  for (let page = 1; page <= pageCount; page++) positions[String(page)] = [{ x: 400, y: 15 }];
  return positions;
}
