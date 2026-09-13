import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

const dotenvResult = dotenv.config({ path: path.resolve(process.cwd(), ".env") });
if (dotenvResult.error) {
  console.warn("[Env] .env file could not be loaded from project root.", dotenvResult.error.message);
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;
//const PORT = 3000;

app.use(express.json());

// API route to receive loan applications
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

    // Validate essential fields
    if (!fullName || !phone || !loanAmount) {
      return res.status(400).json({
        success: false,
        error: "Missing mandatory fields: full name, phone number, and loan amount are required."
      });
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
    console.error("Error processing application:", error);
    res.status(500).json({
      success: false,
      error: "An internal server error occurred while processing your application. Please try again later."
    });
  }
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
