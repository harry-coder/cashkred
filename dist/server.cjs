var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path3 = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_nodemailer = __toESM(require("nodemailer"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_multer = __toESM(require("multer"), 1);
var import_crypto = __toESM(require("crypto"), 1);
var import_fs2 = __toESM(require("fs"), 1);

// db.ts
var import_promise = __toESM(require("mysql2/promise"), 1);
var pool = null;
function isDbConfigured() {
  return !!(process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME && process.env.DB_TABLE);
}
function getPool() {
  if (!pool) {
    pool = import_promise.default.createPool({
      host: process.env.DB_HOST.trim(),
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER.trim(),
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME.trim(),
      connectionLimit: 5,
      connectTimeout: 1e4
    });
  }
  return pool;
}
async function pingDb() {
  await getPool().query("SELECT 1");
}
function getTableName() {
  const table = process.env.DB_TABLE.trim();
  if (!/^[A-Za-z0-9_]+$/.test(table)) {
    throw new Error(`[DB] Invalid DB_TABLE name: ${table}`);
  }
  return table;
}
async function insertLead(lead) {
  const row = {
    first_name: lead.firstName,
    last_name: lead.lastName,
    email: lead.email,
    mobile: lead.phone,
    dob: lead.dob || null,
    gender: lead.gender,
    pan: lead.panNumber,
    aadhar: lead.aadhaarNumber,
    address: lead.address,
    pincode: lead.pinCode,
    emp_type: lead.employmentType,
    income: lead.monthlyIncome,
    company_name: lead.companyName,
    designation: lead.designation,
    amount: lead.loanAmount,
    duration: lead.loanTenure,
    // New leads always start at status 0
    status: 0
  };
  const columns = Object.keys(row);
  const sql = `INSERT INTO \`${getTableName()}\` (${columns.map((c) => `\`${c}\``).join(", ")}, \`lead_date\`)
    VALUES (${columns.map(() => "?").join(", ")}, NOW())`;
  const [result] = await getPool().execute(sql, Object.values(row));
  return result.insertId;
}
async function getLeadByLoanNumber(loanNumber) {
  const [rows] = await getPool().execute(
    `SELECT * FROM \`${getTableName()}\` WHERE \`loan_number\` = ? LIMIT 1`,
    [loanNumber]
  );
  return rows[0];
}
async function getLoanDetails(loanNumber) {
  const [rows] = await getPool().execute(
    "SELECT * FROM `tbl_loan_details` WHERE `loan_number` = ? LIMIT 1",
    [loanNumber]
  );
  return rows[0];
}
async function getDocsPaths(loanNumber) {
  const [rows] = await getPool().execute(
    `SELECT \`docs_paths\` FROM \`${getTableName()}\` WHERE \`loan_number\` = ? LIMIT 1`,
    [loanNumber]
  );
  if (rows.length === 0) return void 0;
  return rows[0].docs_paths ?? null;
}
async function saveDocsPaths(loanNumber, docsPaths) {
  await getPool().execute(
    `UPDATE \`${getTableName()}\` SET \`docs_paths\` = ? WHERE \`loan_number\` = ?`,
    [docsPaths, loanNumber]
  );
}

// storage.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_app = require("firebase-admin/app");
var import_storage = require("firebase-admin/storage");
function isStorageConfigured() {
  return !!(process.env.FIREBASE_SERVICE_ACCOUNT_PATH && process.env.FIREBASE_STORAGE_BUCKET);
}
function getBucket() {
  if ((0, import_app.getApps)().length === 0) {
    const keyPath = import_path.default.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH.trim());
    (0, import_app.initializeApp)({
      credential: (0, import_app.cert)(JSON.parse(import_fs.default.readFileSync(keyPath, "utf8"))),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET.trim()
    });
  }
  return (0, import_storage.getStorage)().bucket();
}
async function uploadFile(filePath, data, contentType) {
  await getBucket().file(filePath).save(data, { contentType, resumable: false });
  return filePath;
}

// agreement.ts
var import_promises = __toESM(require("fs/promises"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_pdf_lib = require("pdf-lib");
function getTemplatePath() {
  return import_path2.default.resolve(process.cwd(), (process.env.ESIGN_TEMPLATE_PATH || "templates/loan-agreement.pdf").trim());
}
var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function formatDayMonthYear(day, monthIndex, year) {
  return `${String(day).padStart(2, "0")}-${MONTHS[monthIndex]}-${year}`;
}
function formatDbDate(value) {
  if (!(value instanceof Date) || isNaN(value.getTime())) return null;
  return formatDayMonthYear(value.getDate(), value.getMonth(), value.getFullYear());
}
function todayInIndia() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", day: "numeric", month: "numeric", year: "numeric" }).formatToParts(/* @__PURE__ */ new Date()).map((part) => [part.type, part.value])
  );
  return formatDayMonthYear(Number(parts.day), Number(parts.month) - 1, Number(parts.year));
}
function parseNumber(value) {
  const text2 = String(value ?? "").replace(/rs\.?|₹|,|days?|\s/gi, "");
  if (!text2) return null;
  const number = Number(text2);
  return Number.isFinite(number) && number >= 0 ? number : null;
}
function formatMoney(value) {
  const number = parseNumber(value);
  return number === null ? null : `Rs. ${number.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}
function text(value) {
  const result = String(value ?? "").trim();
  return result || null;
}
function buildAgreementValues(customer, loan) {
  const name = [text(customer.first_name), text(customer.last_name)].filter(Boolean).join(" ") || null;
  const pincode = text(customer.pincode);
  const address = text(customer.address);
  const tenureDays = parseNumber(loan.tenure);
  const roi = parseNumber(loan.roi);
  const email = text(customer.email);
  const mobile = text(customer.mobile);
  const today = todayInIndia();
  const sources = [
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
    ["tenure", "tbl_loan_details.tenure", tenureDays === null ? null : `${tenureDays} days`]
  ];
  const missing = sources.filter(([, , value]) => !value).map(([, column]) => column);
  const values = Object.fromEntries(sources.map(([key, , value]) => [key, value ?? ""]));
  return { values, missing };
}
var SCHEDULE = (y) => ({ page: 7, x: 282, y, size: 11, maxWidth: 240, font: "table" });
var KFS = (y) => ({ page: 8, x: 304.9, y, size: 8.5, maxWidth: 236, font: "table" });
var SLOTS = [
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
  ["repaymentAmount", KFS(214)]
];
function layoutText(text2, font, slot) {
  const maxLines = slot.maxLines ?? 1;
  for (let size = slot.size; size >= 7; size -= 0.5) {
    const lines = [];
    for (const word of text2.split(/\s+/).filter(Boolean)) {
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
async function fillAgreement(values) {
  const pdf = await import_pdf_lib.PDFDocument.load(await import_promises.default.readFile(getTemplatePath()));
  const fonts = {
    body: await pdf.embedFont(import_pdf_lib.StandardFonts.Helvetica),
    table: await pdf.embedFont(import_pdf_lib.StandardFonts.TimesRoman)
  };
  const pages = pdf.getPages();
  for (const [key, slot] of SLOTS) {
    const page = pages[slot.page - 1];
    if (!page) throw new Error(`[Agreement] Template has no page ${slot.page}.`);
    const text2 = values[key].replace(/\s+/g, " ").trim();
    if (!/^[\x20-\x7E -ÿ]*$/.test(text2)) {
      throw Object.assign(new Error(`${key} contains characters that can't be printed on the agreement.`), { code: "UNPRINTABLE_TEXT" });
    }
    const layout = layoutText(text2, fonts[slot.font], slot);
    if (!layout) {
      throw Object.assign(new Error(`${key} is too long to fit on the agreement.`), { code: "TEXT_TOO_LONG" });
    }
    layout.lines.forEach((line, i) => {
      page.drawText(line, {
        x: slot.x,
        y: page.getHeight() - slot.y - i * layout.size,
        size: layout.size,
        font: fonts[slot.font],
        color: (0, import_pdf_lib.rgb)(0, 0, 0)
      });
    });
  }
  return { pdf: await pdf.save(), pageCount: pages.length };
}
function signaturePositions(pageCount) {
  const positions = {};
  for (let page = 1; page <= pageCount; page++) positions[String(page)] = [{ x: 400, y: 15 }];
  return positions;
}

// surepass.ts
function isSurepassConfigured() {
  return !!process.env.SUREPASS_TOKEN;
}
function getBaseUrl() {
  return (process.env.SUREPASS_BASE_URL || "https://kyc-api.surepass.app").trim().replace(/\/+$/, "");
}
async function callSurepass(endpoint, body) {
  const isForm = body instanceof FormData;
  const response = await fetch(`${getBaseUrl()}${endpoint}`, {
    method: "POST",
    // For FormData, fetch sets the multipart Content-Type (with boundary) itself
    headers: {
      Authorization: `Bearer ${process.env.SUREPASS_TOKEN.trim()}`,
      ...isForm ? {} : { "Content-Type": "application/json" }
    },
    body: isForm ? body : JSON.stringify(body),
    signal: AbortSignal.timeout(3e4)
  });
  const json = await response.json().catch(() => null);
  if (!response.ok || !json?.success) {
    const error = new Error(`[Surepass] ${endpoint} failed (HTTP ${response.status}): ${json?.message || response.statusText}`);
    error.code = json?.message_code || `HTTP_${response.status}`;
    throw error;
  }
  return json.data;
}
async function uploadEsignFile(pdf, fileName) {
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(pdf)], { type: "application/pdf" }), fileName);
  form.append("file_name", fileName);
  const data = await callSurepass("/api/v1/files/esign/upload", form);
  if (!data?.uploaded || !data.file_id) {
    throw new Error(`[Surepass] ${fileName} was not uploaded.`);
  }
  return data.file_id;
}
async function initializeEsign(fileId, signer, positions, reason) {
  return callSurepass("/api/v1/esign/initialize", {
    file_id: fileId,
    pdf_pre_uploaded: true,
    send_email: true,
    config: {
      reason,
      positions,
      // Every signature must go through Aadhaar OTP; no virtual or uploaded signatures
      accept_virtual_sign: false,
      allow_virtual_sign_upload: false,
      skip_otp: false,
      allow_number_change: false,
      allow_download: true,
      name_match: { match: true, score: 80 }
    },
    prefill_options: {
      full_name: signer.fullName,
      mobile_number: signer.mobile,
      user_email: signer.email
    },
    sign_type: "aadhaar"
  });
}

// server.ts
var dotenvResult = import_dotenv.default.config({ path: import_path3.default.resolve(process.cwd(), ".env") });
if (dotenvResult.error) {
  console.warn("[Env] .env file could not be loaded from project root.", dotenvResult.error.message);
}
var app = (0, import_express.default)();
var PORT = Number(process.env.PORT) || 3e3;
app.use(import_express.default.json());
app.get("/api/health", async (_req, res) => {
  let db = "not_configured";
  if (isDbConfigured()) {
    try {
      await pingDb();
      db = "connected";
    } catch (error) {
      console.error(`[Health] Database check failed (${error?.code || "UNKNOWN"}): ${error?.message || error}`);
      db = "unreachable";
    }
  }
  const healthy = db === "connected";
  res.set("Cache-Control", "no-store");
  return res.status(healthy ? 200 : 503).json({
    status: healthy ? "ok" : "degraded",
    server: "up",
    db,
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.post("/api/apply", async (req, res) => {
  let stage = "other";
  let leadId = null;
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      dob,
      gender,
      panNumber,
      aadhaarNumber,
      employmentType,
      monthlyIncome,
      companyName,
      designation,
      loanAmount,
      loanTenure,
      bankName,
      accountNumber,
      ifscCode,
      accountHolderName,
      address,
      pinCode
    } = req.body;
    const missingFields = Object.entries({
      "first name": firstName,
      "last name": lastName,
      "phone number": phone,
      "loan amount": loanAmount
    }).filter(([, value]) => !value).map(([label]) => label);
    if (missingFields.length > 0) {
      console.warn(`[Apply] Missing fields: ${missingFields.join(", ")}. Received keys: ${Object.keys(req.body || {}).join(", ") || "(empty body)"}`);
      return res.status(400).json({
        success: false,
        error: `Missing mandatory fields: ${missingFields.join(", ")}.`
      });
    }
    const fullName = `${firstName} ${lastName}`.trim();
    if (isDbConfigured()) {
      stage = "db";
      leadId = await insertLead({
        firstName,
        lastName,
        email,
        phone,
        dob,
        gender,
        panNumber,
        aadhaarNumber,
        address,
        pinCode,
        employmentType,
        monthlyIncome,
        companyName,
        designation,
        loanAmount,
        loanTenure
      });
      console.log(`[DB] Lead saved with id ${leadId}`);
    } else {
      console.log("[DB] Database settings are not configured in .env. Skipping lead insert.");
    }
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #2563eb;">
          <h2 style="color: #1e3a8a; margin: 0; font-size: 24px;">CashKred</h2>
          <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">New Loan Application Received</p>
        </div>
        
        <div style="margin-top: 20px;">
          <h3 style="color: #1e293b; border-bottom: 1px solid #f1f5f9; padding-bottom: 5px; font-size: 16px;">Loan Requirement</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px; width: 40%;">Amount Requested:</td>
              <td style="padding: 6px 0; color: #0f172a; font-size: 14px; font-weight: bold; font-family: monospace;">\u20B9${Number(loanAmount).toLocaleString("en-IN")}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Tenure / Duration:</td>
              <td style="padding: 6px 0; color: #0f172a; font-size: 14px; font-weight: bold;">${loanTenure} Days</td>
            </tr>
          </table>

          <h3 style="color: #1e293b; border-bottom: 1px solid #f1f5f9; padding-bottom: 5px; font-size: 16px;">Personal Information</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px; width: 40%;">Full Name:</td>
              <td style="padding: 6px 0; color: #0f172a; font-size: 14px; font-weight: bold;">${fullName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Mobile Number:</td>
              <td style="padding: 6px 0; color: #0f172a; font-size: 14px; font-weight: bold; font-family: monospace;">${phone}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Email Address:</td>
              <td style="padding: 6px 0; color: #0f172a; font-size: 14px;">${email || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Date of Birth:</td>
              <td style="padding: 6px 0; color: #0f172a; font-size: 14px;">${dob || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Gender:</td>
              <td style="padding: 6px 0; color: #0f172a; font-size: 14px; text-transform: capitalize;">${gender || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px;">PAN Card Number:</td>
              <td style="padding: 6px 0; color: #0f172a; font-size: 14px; font-family: monospace; font-weight: bold; text-transform: uppercase;">${panNumber || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Aadhaar Number:</td>
              <td style="padding: 6px 0; color: #0f172a; font-size: 14px; font-family: monospace;">${aadhaarNumber || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Residential Address:</td>
              <td style="padding: 6px 0; color: #0f172a; font-size: 14px;">${address || "N/A"} ${pinCode ? `(PIN: ${pinCode})` : ""}</td>
            </tr>
          </table>

          <h3 style="color: #1e293b; border-bottom: 1px solid #f1f5f9; padding-bottom: 5px; font-size: 16px;">Employment & Income</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px; width: 40%;">Employment Type:</td>
              <td style="padding: 6px 0; color: #0f172a; font-size: 14px; font-weight: bold; text-transform: capitalize;">${employmentType || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Monthly Net Income:</td>
              <td style="padding: 6px 0; color: #0f172a; font-size: 14px; font-weight: bold; font-family: monospace;">\u20B9${monthlyIncome ? Number(monthlyIncome).toLocaleString("en-IN") : "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Company Name:</td>
              <td style="padding: 6px 0; color: #0f172a; font-size: 14px;">${companyName || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Designation:</td>
              <td style="padding: 6px 0; color: #0f172a; font-size: 14px;">${designation || "N/A"}</td>
            </tr>
          </table>

          <h3 style="color: #1e293b; border-bottom: 1px solid #f1f5f9; padding-bottom: 5px; font-size: 16px;">Bank Details</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px; width: 40%;">Bank Name:</td>
              <td style="padding: 6px 0; color: #0f172a; font-size: 14px; font-weight: bold;">${bankName || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Account Number:</td>
              <td style="padding: 6px 0; color: #0f172a; font-size: 14px; font-family: monospace; font-weight: bold;">${accountNumber || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px;">IFSC Code:</td>
              <td style="padding: 6px 0; color: #0f172a; font-size: 14px; font-family: monospace; font-weight: bold; text-transform: uppercase;">${ifscCode || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Account Holder Name:</td>
              <td style="padding: 6px 0; color: #0f172a; font-size: 14px;">${accountHolderName || "N/A"}</td>
            </tr>
          </table>
        </div>

        <div style="margin-top: 30px; padding: 12px; border-radius: 8px; background-color: #f8fafc; border: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b;">
          This application was processed securely via the CashKred Online Portal.
        </div>
      </div>
    `;
    const smtpHost = (process.env.SMTP_HOST || process.env.SMTP_SERVER || "").trim();
    const smtpPort = (process.env.SMTP_PORT || "587").trim();
    const smtpUser = (process.env.SMTP_USER || process.env.SMTP_USERNAME || "").trim();
    const smtpPass = (process.env.SMTP_PASS || process.env.SMTP_PASSWORD || "").trim();
    const allowSelfSigned = (process.env.SMTP_ALLOW_SELF_SIGNED || "false").trim().toLowerCase() === "true";
    const smtpDebug = (process.env.SMTP_DEBUG || "false").trim().toLowerCase() === "true";
    const notificationEmails = (process.env.NOTIFICATION_EMAIL || "applications@cashkred.com").split(/[,;\n]+/).map((emailAddress) => emailAddress.trim()).filter(Boolean);
    const invalidNotificationEmails = notificationEmails.filter(
      (emailAddress) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)
    );
    if (notificationEmails.length === 0 || invalidNotificationEmails.length > 0) {
      throw new Error(
        `Invalid NOTIFICATION_EMAIL value. Check these addresses: ${invalidNotificationEmails.join(", ") || "none provided"}`
      );
    }
    const isSmtpConfigured = !!(smtpHost && smtpUser && smtpPass);
    console.log(`SMTP Configured: ${isSmtpConfigured ? "Yes" : "No"}`);
    if (!isSmtpConfigured) {
      console.log(
        `[SMTP Debug] Missing values -> host:${smtpHost ? "set" : "missing"}, user:${smtpUser ? "set" : "missing"}, pass:${smtpPass ? "set" : "missing"}`
      );
    }
    if (allowSelfSigned) {
      console.log("[SMTP Warning] SMTP_ALLOW_SELF_SIGNED=true. TLS certificate verification is relaxed.");
    }
    if (smtpDebug) {
      console.log("[SMTP Debug] Verbose SMTP protocol logs enabled (SMTP_DEBUG=true).");
    }
    console.log("------------------ NEW APPLICATION ------------------");
    console.log(`Full Name: ${fullName}`);
    console.log(`Phone: ${phone}`);
    console.log(`Email: ${email}`);
    console.log(`Loan Amount: \u20B9${Number(loanAmount).toLocaleString("en-IN")}`);
    console.log(`Tenure: ${loanTenure} Days`);
    console.log(`PAN: ${panNumber}`);
    console.log(`Aadhaar: ${aadhaarNumber}`);
    console.log(`Employment: ${employmentType}, Net Monthly: \u20B9${monthlyIncome}`);
    console.log(`Company: ${companyName}, Designation: ${designation}`);
    console.log(`Bank: ${bankName}, A/C: ${accountNumber}, IFSC: ${ifscCode}`);
    console.log("-----------------------------------------------------");
    if (isSmtpConfigured) {
      stage = "email";
      const primaryPort = Number(smtpPort);
      const smtpAttempts = [
        { port: primaryPort, secure: primaryPort === 465, label: "primary" },
        { port: 587, secure: false, label: "fallback-starttls" },
        { port: 465, secure: true, label: "fallback-ssl" }
      ].filter(
        (attempt, index, arr) => Number.isFinite(attempt.port) && arr.findIndex((a) => a.port === attempt.port && a.secure === attempt.secure) === index
      );
      let sent = false;
      let lastSmtpError;
      for (const attempt of smtpAttempts) {
        try {
          console.log(
            `[SMTP] Attempt ${attempt.label}: host=${smtpHost}, port=${attempt.port}, secure=${attempt.secure ? "true" : "false"}`
          );
          const transporter = import_nodemailer.default.createTransport({
            host: smtpHost,
            port: attempt.port,
            secure: attempt.secure,
            requireTLS: !attempt.secure,
            auth: {
              user: smtpUser,
              pass: smtpPass
            },
            logger: smtpDebug,
            debug: smtpDebug,
            connectionTimeout: 15e3,
            greetingTimeout: 1e4,
            socketTimeout: 2e4,
            tls: {
              minVersion: "TLSv1.2",
              servername: smtpHost,
              rejectUnauthorized: !allowSelfSigned
            }
          });
          await transporter.verify();
          await transporter.sendMail({
            from: `"${fullName} via CashKred" <${smtpUser}>`,
            to: notificationEmails.join(", "),
            subject: `\u{1F6A8} [New Application] - \u20B9${Number(loanAmount).toLocaleString("en-IN")} requested by ${fullName}`,
            html: emailHtml
          });
          sent = true;
          break;
        } catch (smtpError) {
          lastSmtpError = smtpError;
          console.error(
            `[SMTP] Attempt ${attempt.label} failed (${smtpError?.code || "UNKNOWN"}): ${smtpError?.message || smtpError}`
          );
          if ((smtpError?.message || "").toLowerCase().includes("self-signed certificate") && !allowSelfSigned) {
            console.error("[SMTP Hint] If your provider/network uses a self-signed chain, set SMTP_ALLOW_SELF_SIGNED=true in .env.");
          }
        }
      }
      if (!sent) {
        throw lastSmtpError;
      }
      return res.json({
        success: true,
        smtpConfigured: true,
        message: "Your application has been submitted successfully and delivered directly to our underwriting team."
      });
    } else {
      console.log("\u26A0\uFE0F [WARNING] SMTP settings are not configured in environment variables (.env).");
      console.log("The application was logged above successfully in the terminal.");
      return res.json({
        success: true,
        smtpConfigured: false,
        message: "Your application details have been received successfully! (Note: The application has been stored securely in our system ledger, and is awaiting manual review)."
      });
    }
  } catch (error) {
    console.error(`Error processing application (stage: ${stage}):`, error);
    const errorMessages = {
      db: "We couldn't save your application right now. Please try again in a few minutes.",
      email: `Your application has been saved${leadId ? ` (reference #${leadId})` : ""}, but we couldn't notify our team by email. You don't need to submit again; we'll pick it up from our records.`,
      other: "An internal server error occurred while processing your application. Please try again later."
    };
    res.status(500).json({
      success: false,
      stage,
      errorCode: error?.code || null,
      error: errorMessages[stage]
    });
  }
});
app.get("/api/customers/:loanNumber", async (req, res) => {
  try {
    const loanNumber = req.params.loanNumber.trim();
    if (!/^[A-Za-z0-9_-]+$/.test(loanNumber)) {
      return res.status(400).json({ success: false, error: "A valid loan number is required (letters, numbers, - or _)." });
    }
    if (!isDbConfigured()) {
      console.error("[Customers] Database settings are missing in .env.");
      return res.status(500).json({ success: false, error: "The database is not configured on the server." });
    }
    const customer = await getLeadByLoanNumber(loanNumber);
    if (!customer) {
      return res.status(404).json({ success: false, error: `No customer found for loan number ${loanNumber}.` });
    }
    return res.json({ success: true, customer });
  } catch (error) {
    console.error("Error fetching customer:", error);
    return res.status(500).json({
      success: false,
      errorCode: error?.code || null,
      error: "We couldn't fetch the customer details right now. Please try again in a few minutes."
    });
  }
});
function hasValidApiKey(req) {
  const expected = (process.env.ESIGN_API_KEY || "").trim();
  const received = String(req.get("x-api-key") || "");
  if (!expected || !received) return false;
  const digest = (value) => import_crypto.default.createHash("sha256").update(value).digest();
  return import_crypto.default.timingSafeEqual(digest(expected), digest(received));
}
app.post("/api/esign/:loanNumber", async (req, res) => {
  let stage = "other";
  try {
    if (!hasValidApiKey(req)) {
      return res.status(401).json({ success: false, error: "A valid x-api-key header is required." });
    }
    const loanNumber = req.params.loanNumber.trim();
    if (!/^[A-Za-z0-9_-]+$/.test(loanNumber)) {
      return res.status(400).json({ success: false, error: "A valid loan number is required (letters, numbers, - or _)." });
    }
    if (!isDbConfigured() || !isSurepassConfigured() || !import_fs2.default.existsSync(getTemplatePath())) {
      console.error("[eSign] Database settings, SUREPASS_TOKEN or the agreement template is missing.");
      return res.status(500).json({ success: false, error: "eSign is not configured on the server." });
    }
    stage = "db";
    const [customer, loan] = await Promise.all([getLeadByLoanNumber(loanNumber), getLoanDetails(loanNumber)]);
    if (!customer || !loan) {
      return res.status(404).json({
        success: false,
        error: `No ${!customer ? "customer" : "loan details"} found for loan number ${loanNumber}.`
      });
    }
    const { values, missing } = buildAgreementValues(customer, loan);
    if (missing.length > 0) {
      return res.status(422).json({ success: false, error: `Missing or invalid values for the agreement: ${missing.join(", ")}.` });
    }
    stage = "pdf";
    const { pdf, pageCount } = await fillAgreement(values);
    stage = "esign";
    const fileId = await uploadEsignFile(pdf, `${loanNumber}-loan-agreement.pdf`);
    const session = await initializeEsign(
      fileId,
      { fullName: values.borrowerName, mobile: values.phone, email: values.email },
      signaturePositions(pageCount),
      "Loan agreement"
    );
    console.log(`[eSign] Sent loan ${loanNumber} for signing (file_id ${fileId}, client_id ${session.client_id})`);
    return res.json({ success: true, loan_number: loanNumber, client_id: session.client_id, url: session.url });
  } catch (error) {
    console.error(`Error sending agreement for eSign (stage: ${stage}):`, error?.message || error);
    if (error?.code === "UNPRINTABLE_TEXT" || error?.code === "TEXT_TOO_LONG") {
      return res.status(422).json({ success: false, stage, error: error.message });
    }
    const errorMessages = {
      db: "We couldn't read the loan details right now. Please try again in a few minutes.",
      pdf: "We couldn't prepare the loan agreement. Please check the template and try again.",
      esign: "We couldn't send the agreement to Surepass for signing. Please try again in a few minutes.",
      other: "An internal server error occurred. Please try again later."
    };
    return res.status(500).json({ success: false, stage, errorCode: error?.code || null, error: errorMessages[stage] });
  }
});
var MAX_FILE_SIZE_MB = 5;
var DOC_FIELDS = ["aadhar", "pan", "bank_statement", "address_proof"].map((name) => ({ name, maxCount: 1 }));
var documentUpload = (0, import_multer.default)({
  storage: import_multer.default.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") return cb(null, true);
    cb(new Error(`${file.fieldname}: only PDF files are allowed.`));
  }
}).fields(DOC_FIELDS);
app.post("/api/documents", (req, res) => {
  documentUpload(req, res, async (uploadError) => {
    if (uploadError) {
      const message = uploadError.code === "LIMIT_FILE_SIZE" ? `${uploadError.field}: each file must be ${MAX_FILE_SIZE_MB} MB or smaller.` : uploadError.code === "LIMIT_UNEXPECTED_FILE" ? `Unexpected or too many files in field "${uploadError.field}". Allowed fields: ${DOC_FIELDS.map((f) => f.name).join(", ")}.` : uploadError.message;
      return res.status(400).json({ success: false, error: message });
    }
    try {
      const loanNumber = String(req.body?.loan_number || "").trim();
      if (!/^[A-Za-z0-9_-]+$/.test(loanNumber)) {
        return res.status(400).json({ success: false, error: "A valid loan_number is required (letters, numbers, - or _)." });
      }
      const files = req.files || {};
      if (Object.keys(files).length === 0) {
        return res.status(400).json({ success: false, error: "No documents uploaded." });
      }
      if (!isDbConfigured() || !isStorageConfigured()) {
        console.error("[Documents] Database or Firebase Storage settings are missing in .env.");
        return res.status(500).json({ success: false, error: "Document storage is not configured on the server." });
      }
      const existing = await getDocsPaths(loanNumber);
      if (existing === void 0) {
        return res.status(404).json({ success: false, error: `No application found for loan number ${loanNumber}.` });
      }
      let docsPaths = {};
      try {
        docsPaths = existing ? JSON.parse(existing) : {};
      } catch {
        console.warn(`[Documents] docs_paths for ${loanNumber} was not valid JSON; replacing it.`);
      }
      await Promise.all(
        Object.entries(files).map(async ([field, [file]]) => {
          docsPaths[field] = await uploadFile(`${loanNumber}/${field}.pdf`, file.buffer, file.mimetype);
        })
      );
      await saveDocsPaths(loanNumber, JSON.stringify(docsPaths));
      console.log(`[Documents] Saved ${Object.keys(files).join(", ")} for loan ${loanNumber}`);
      return res.json({ success: true, loan_number: loanNumber, docs_paths: docsPaths });
    } catch (error) {
      console.error("Error uploading documents:", error);
      return res.status(500).json({
        success: false,
        errorCode: error?.code || null,
        error: "We couldn't upload the documents right now. Please try again in a few minutes."
      });
    }
  });
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path3.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path3.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[CashKred Backend Server] Running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
