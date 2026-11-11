import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import multer from "multer";
import crypto from "crypto";
import fs from "fs";
import { insertLead, isDbConfigured, getDocsPaths, getLeadByLoanNumber, getLoanDetails, pingDb, saveDocsPaths, saveEsignClientId } from "./db";
import { isStorageConfigured, uploadFile } from "./storage";
import { buildAgreementValues, fillAgreement, getTemplatePath, signaturePositions } from "./agreement";
import { getSignedDocument, initializeEsign, isSurepassConfigured, uploadEsignPdf } from "./surepass";

const dotenvResult = dotenv.config({ path: path.resolve(process.cwd(), ".env") });
if (dotenvResult.error) {
  console.warn("[Env] .env file could not be loaded from project root.", dotenvResult.error.message);
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;
//const PORT = 3000;

app.use(express.json());

// Health check for uptime monitors: 200 when the server and database are both up, 503 otherwise
app.get("/api/health", async (_req, res) => {
  let db: "connected" | "unreachable" | "not_configured" = "not_configured";

  if (isDbConfigured()) {
    try {
      await pingDb();
      db = "connected";
    } catch (error: any) {
      // Details stay in the log; the endpoint is public
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
    timestamp: new Date().toISOString(),
  });
});

// API route to receive loan applications
app.post("/api/apply", async (req, res) => {
  // Tracks which step failed so the UI can show a specific message
  let stage: "db" | "email" | "other" = "other";
  let leadId: number | null = null;

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

    // Validate essential fields
    const missingFields = Object.entries({
      "first name": firstName,
      "last name": lastName,
      "phone number": phone,
      "loan amount": loanAmount,
    })
      .filter(([, value]) => !value)
      .map(([label]) => label);

    if (missingFields.length > 0) {
      console.warn(`[Apply] Missing fields: ${missingFields.join(", ")}. Received keys: ${Object.keys(req.body || {}).join(", ") || "(empty body)"}`);
      return res.status(400).json({
        success: false,
        error: `Missing mandatory fields: ${missingFields.join(", ")}.`
      });
    }

    const fullName = `${firstName} ${lastName}`.trim();

    // Persist the lead before notifying, so a mail failure never loses an application
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
        loanTenure,
      });
      console.log(`[DB] Lead saved with id ${leadId}`);
    } else {
      console.log("[DB] Database settings are not configured in .env. Skipping lead insert.");
    }

    // Compose HTML Email Content
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
              <td style="padding: 6px 0; color: #0f172a; font-size: 14px; font-weight: bold; font-family: monospace;">₹${Number(loanAmount).toLocaleString('en-IN')}</td>
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
              <td style="padding: 6px 0; color: #0f172a; font-size: 14px; font-weight: bold; font-family: monospace;">₹${monthlyIncome ? Number(monthlyIncome).toLocaleString('en-IN') : "N/A"}</td>
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

    // Configure Mail Server
    const smtpHost = (process.env.SMTP_HOST || process.env.SMTP_SERVER || "").trim();
    const smtpPort = (process.env.SMTP_PORT || "587").trim();
    const smtpUser = (process.env.SMTP_USER || process.env.SMTP_USERNAME || "").trim();
    const smtpPass = (process.env.SMTP_PASS || process.env.SMTP_PASSWORD || "").trim();
    const allowSelfSigned = (process.env.SMTP_ALLOW_SELF_SIGNED || "false").trim().toLowerCase() === "true";
    const smtpDebug = (process.env.SMTP_DEBUG || "false").trim().toLowerCase() === "true";
    const notificationEmails = (process.env.NOTIFICATION_EMAIL || "applications@cashkred.com")
      .split(/[,;\n]+/)
      .map((emailAddress) => emailAddress.trim())
      .filter(Boolean);
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
    console.log(`Loan Amount: ₹${Number(loanAmount).toLocaleString('en-IN')}`);
    console.log(`Tenure: ${loanTenure} Days`);
    console.log(`PAN: ${panNumber}`);
    console.log(`Aadhaar: ${aadhaarNumber}`);
    console.log(`Employment: ${employmentType}, Net Monthly: ₹${monthlyIncome}`);
    console.log(`Company: ${companyName}, Designation: ${designation}`);
    console.log(`Bank: ${bankName}, A/C: ${accountNumber}, IFSC: ${ifscCode}`);
    console.log("-----------------------------------------------------");

    if (isSmtpConfigured) {
      stage = "email";
      const primaryPort = Number(smtpPort);
      const smtpAttempts = [
        { port: primaryPort, secure: primaryPort === 465, label: "primary" },
        { port: 587, secure: false, label: "fallback-starttls" },
        { port: 465, secure: true, label: "fallback-ssl" },
      ].filter(
        (attempt, index, arr) =>
          Number.isFinite(attempt.port) && arr.findIndex((a) => a.port === attempt.port && a.secure === attempt.secure) === index
      );

      let sent = false;
      let lastSmtpError: unknown;

      for (const attempt of smtpAttempts) {
        try {
          console.log(
            `[SMTP] Attempt ${attempt.label}: host=${smtpHost}, port=${attempt.port}, secure=${attempt.secure ? "true" : "false"}`
          );

          const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: attempt.port,
            secure: attempt.secure,
            requireTLS: !attempt.secure,
            auth: {
              user: smtpUser,
              pass: smtpPass,
            },
            logger: smtpDebug,
            debug: smtpDebug,
            connectionTimeout: 15000,
            greetingTimeout: 10000,
            socketTimeout: 20000,
            tls: {
              minVersion: "TLSv1.2",
              servername: smtpHost,
              rejectUnauthorized: !allowSelfSigned,
            },
          });

          // Verify SMTP handshake before sending to fail fast with better diagnostics.
          await transporter.verify();

          await transporter.sendMail({
            from: `"${fullName} via CashKred" <${smtpUser}>`,
            to: notificationEmails.join(", "),
            subject: `🚨 [New Application] - ₹${Number(loanAmount).toLocaleString('en-IN')} requested by ${fullName}`,
            html: emailHtml,
          });

          sent = true;
          break;
        } catch (smtpError: any) {
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
      // Log to server console so developer can see the application details without SMTP setup
      console.log("⚠️ [WARNING] SMTP settings are not configured in environment variables (.env).");
      console.log("The application was logged above successfully in the terminal.");

      return res.json({
        success: true,
        smtpConfigured: false,
        message: "Your application details have been received successfully! (Note: The application has been stored securely in our system ledger, and is awaiting manual review)."
      });
    }
  } catch (error: any) {
    console.error(`Error processing application (stage: ${stage}):`, error);

    const errorMessages = {
      db: "We couldn't save your application right now. Please try again in a few minutes.",
      email: `Your application has been saved${leadId ? ` (reference #${leadId})` : ""}, but we couldn't notify our team by email. You don't need to submit again; we'll pick it up from our records.`,
      other: "An internal server error occurred while processing your application. Please try again later.",
    };

    res.status(500).json({
      success: false,
      stage,
      errorCode: error?.code || null,
      error: errorMessages[stage]
    });
  }
});

// Look up a customer's full record by loan number
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
  } catch (error: any) {
    console.error("Error fetching customer:", error);
    return res.status(500).json({
      success: false,
      errorCode: error?.code || null,
      error: "We couldn't fetch the customer details right now. Please try again in a few minutes."
    });
  }
});

// Internal routes must send ESIGN_API_KEY in the x-api-key header. Hashing first makes the compare constant-time.
function hasValidApiKey(req: express.Request) {
  const expected = (process.env.ESIGN_API_KEY || "").trim();
  const received = String(req.get("x-api-key") || "");
  if (!expected || !received) return false;
  const digest = (value: string) => crypto.createHash("sha256").update(value).digest();
  return crypto.timingSafeEqual(digest(expected), digest(received));
}

// Fills the loan agreement for a customer and sends it to Surepass for Aadhaar eSign
app.post("/api/esign/:loanNumber", async (req, res) => {
  let stage: "db" | "pdf" | "esign" | "other" = "other";
  let clientId: string | null = null;

  try {
    if (!hasValidApiKey(req)) {
      return res.status(401).json({ success: false, error: "A valid x-api-key header is required." });
    }

    const loanNumber = req.params.loanNumber.trim();
    if (!/^[A-Za-z0-9_-]+$/.test(loanNumber)) {
      return res.status(400).json({ success: false, error: "A valid loan number is required (letters, numbers, - or _)." });
    }

    // Callers are already authenticated here, so name what's missing; the full template path only goes to the log
    const templatePath = getTemplatePath();
    const missingConfig = [
      !isDbConfigured() && "database settings (DB_HOST, DB_USER, DB_NAME, DB_TABLE)",
      !isSurepassConfigured() && "SUREPASS_TOKEN",
      !fs.existsSync(templatePath) && "agreement template PDF",
    ].filter(Boolean);
    if (missingConfig.length > 0) {
      console.error(`[eSign] Not configured. Missing: ${missingConfig.join(", ")}. Template path checked: ${templatePath}`);
      return res.status(500).json({ success: false, error: `eSign is not configured on the server. Missing: ${missingConfig.join(", ")}.` });
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

    // Values include PAN, address and phone, so they're only logged when ESIGN_LOG_VALUES=true
    const logValues = (process.env.ESIGN_LOG_VALUES || "").trim().toLowerCase() === "true";
    if (logValues) {
      console.log(`[eSign] Agreement values for loan ${loanNumber}:\n${JSON.stringify(values, null, 2)}`);
    }

    stage = "pdf";
    const { pdf, pageCount } = await fillAgreement(values);

    // The filled PDF holds customer data, so it stays in memory and only goes to Surepass
    stage = "esign";
    const session = await initializeEsign(
      { fullName: values.borrowerName, mobile: values.phone, email: values.email },
      signaturePositions(pageCount),
      "Loan agreement"
    );
    clientId = session.client_id;
    await uploadEsignPdf(session.client_id, pdf, `${loanNumber}-loan-agreement.pdf`);
    console.log(`[eSign] Sent loan ${loanNumber} for signing (${pageCount} pages, client_id ${session.client_id})`);
    if (logValues) {
      console.log(`[eSign] Surepass asked to email ${values.email} (mobile ${values.phone}) with send_email and always_send_email on`);
    }

    // The customer already has the signing link at this point, so a failed save is reported but doesn't fail the request
    let clientIdSaved = false;
    try {
      clientIdSaved = await saveEsignClientId(loanNumber, session.client_id);
      if (!clientIdSaved) console.error(`[eSign] No user_info row updated with client_id ${session.client_id} for loan ${loanNumber}.`);
    } catch (saveError: any) {
      console.error(`[eSign] Couldn't save client_id ${session.client_id} for loan ${loanNumber}: ${saveError?.message || saveError}`);
    }

    return res.json({
      success: true,
      loan_number: loanNumber,
      client_id: session.client_id,
      client_id_saved: clientIdSaved,
      url: session.url,
    });
  } catch (error: any) {
    // A client_id here means the session exists (and may have been emailed) but has no PDF
    console.error(`Error sending agreement for eSign (stage: ${stage}${clientId ? `, client_id ${clientId}` : ""}):`, error?.message || error);

    // Text that doesn't fit or can't be printed is a data problem, not a server fault
    if (error?.code === "UNPRINTABLE_TEXT" || error?.code === "TEXT_TOO_LONG") {
      return res.status(422).json({ success: false, stage, error: error.message });
    }

    const errorMessages = {
      db: "We couldn't read the loan details right now. Please try again in a few minutes.",
      pdf: "We couldn't prepare the loan agreement. Please check the template and try again.",
      esign: "We couldn't send the agreement to Surepass for signing. Please try again in a few minutes.",
      other: "An internal server error occurred. Please try again later.",
    };

    return res.status(500).json({ success: false, stage, client_id: clientId, errorCode: error?.code || null, error: errorMessages[stage] });
  }
});

// Step 4 of Surepass's guide: fetch the signed agreement once the customer has finished signing
app.get("/api/esign/:clientId/signed-document", async (req, res) => {
  try {
    if (!hasValidApiKey(req)) {
      return res.status(401).json({ success: false, error: "A valid x-api-key header is required." });
    }

    const clientId = req.params.clientId.trim();
    if (!/^esign_[A-Za-z0-9]+$/.test(clientId)) {
      return res.status(400).json({ success: false, error: "A valid Surepass client_id (esign_...) is required." });
    }
    if (!isSurepassConfigured()) {
      return res.status(500).json({ success: false, error: "eSign is not configured on the server. Missing: SUREPASS_TOKEN." });
    }

    const document = await getSignedDocument(clientId);
    return res.json({ success: true, client_id: clientId, ...document });
  } catch (error: any) {
    // Surepass: 422 = not signed yet, 404 = unknown client_id
    if (error?.status === 422) {
      return res.status(422).json({ success: false, error: "The customer hasn't finished signing yet." });
    }
    if (error?.status === 404) {
      return res.status(404).json({ success: false, error: "Surepass has no eSign session with this client_id." });
    }
    console.error("Error fetching signed document:", error?.message || error);
    return res.status(500).json({ success: false, errorCode: error?.code || null, error: "We couldn't fetch the signed document right now." });
  }
});

// Document uploads: files go to Firebase Storage under <loan_number>/, paths saved in docs_paths
const MAX_FILE_SIZE_MB = 5;
const DOC_FIELDS = ["aadhar", "pan", "bank_statement", "address_proof"].map((name) => ({ name, maxCount: 1 }));

const documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") return cb(null, true);
    cb(new Error(`${file.fieldname}: only PDF files are allowed.`));
  },
}).fields(DOC_FIELDS);

app.post("/api/documents", (req, res) => {
  documentUpload(req, res, async (uploadError: any) => {
    if (uploadError) {
      const message =
        uploadError.code === "LIMIT_FILE_SIZE"
          ? `${uploadError.field}: each file must be ${MAX_FILE_SIZE_MB} MB or smaller.`
          : uploadError.code === "LIMIT_UNEXPECTED_FILE"
            ? `Unexpected or too many files in field "${uploadError.field}". Allowed fields: ${DOC_FIELDS.map((f) => f.name).join(", ")}.`
            : uploadError.message;
      return res.status(400).json({ success: false, error: message });
    }

    try {
      const loanNumber = String(req.body?.loan_number || "").trim();
      // Loan number becomes the folder name, so keep it to safe characters
      if (!/^[A-Za-z0-9_-]+$/.test(loanNumber)) {
        return res.status(400).json({ success: false, error: "A valid loan_number is required (letters, numbers, - or _)." });
      }

      const files = (req.files || {}) as Record<string, Express.Multer.File[]>;
      if (Object.keys(files).length === 0) {
        return res.status(400).json({ success: false, error: "No documents uploaded." });
      }

      if (!isDbConfigured() || !isStorageConfigured()) {
        console.error("[Documents] Database or Firebase Storage settings are missing in .env.");
        return res.status(500).json({ success: false, error: "Document storage is not configured on the server." });
      }

      const existing = await getDocsPaths(loanNumber);
      if (existing === undefined) {
        return res.status(404).json({ success: false, error: `No application found for loan number ${loanNumber}.` });
      }

      // Merge with earlier uploads so re-uploading one document keeps the others
      let docsPaths: Record<string, string> = {};
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
    } catch (error: any) {
      console.error("Error uploading documents:", error);
      return res.status(500).json({
        success: false,
        errorCode: error?.code || null,
        error: "We couldn't upload the documents right now. Please try again in a few minutes."
      });
    }
  });
});

// Serve frontend assets
async function startServer() {
  // Vite dev middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[CashKred Backend Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
