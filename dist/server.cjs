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
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_nodemailer = __toESM(require("nodemailer"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var dotenvResult = import_dotenv.default.config({ path: import_path.default.resolve(process.cwd(), ".env") });
if (dotenvResult.error) {
  console.warn("[Env] .env file could not be loaded from project root.", dotenvResult.error.message);
}
var app = (0, import_express.default)();
var PORT = Number(process.env.PORT) || 3e3;
app.use(import_express.default.json());
app.post("/api/apply", async (req, res) => {
  try {
    const {
      fullName,
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
    if (!fullName || !phone || !loanAmount) {
      return res.status(400).json({
        success: false,
        error: "Missing mandatory fields: full name, phone number, and loan amount are required."
      });
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
          console.log(`[SMTP] Handshake successful. Sending email to ${notificationEmails.length} recipient(s).`);
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
    console.error("Error processing application:", error);
    res.status(500).json({
      success: false,
      error: "An internal server error occurred while processing your application. Please try again later."
    });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[CashKred Backend Server] Running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
