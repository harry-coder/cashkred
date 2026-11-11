import nodemailer from "nodemailer";

function getSmtpSettings() {
  return {
    host: (process.env.SMTP_HOST || process.env.SMTP_SERVER || "").trim(),
    port: (process.env.SMTP_PORT || "587").trim(),
    user: (process.env.SMTP_USER || process.env.SMTP_USERNAME || "").trim(),
    pass: (process.env.SMTP_PASS || process.env.SMTP_PASSWORD || "").trim(),
    allowSelfSigned: (process.env.SMTP_ALLOW_SELF_SIGNED || "false").trim().toLowerCase() === "true",
    debug: (process.env.SMTP_DEBUG || "false").trim().toLowerCase() === "true",
  };
}

export function isSmtpConfigured() {
  const { host, user, pass } = getSmtpSettings();
  return !!(host && user && pass);
}

// Mail goes out from the SMTP account itself, so that's the address in From
export function getSenderAddress() {
  return getSmtpSettings().user;
}

export function logSmtpConfig() {
  const smtp = getSmtpSettings();
  const configured = isSmtpConfigured();
  console.log(`SMTP Configured: ${configured ? "Yes" : "No"}`);
  if (!configured) {
    console.log(
      `[SMTP Debug] Missing values -> host:${smtp.host ? "set" : "missing"}, user:${smtp.user ? "set" : "missing"}, pass:${smtp.pass ? "set" : "missing"}`
    );
  }
  if (smtp.allowSelfSigned) {
    console.log("[SMTP Warning] SMTP_ALLOW_SELF_SIGNED=true. TLS certificate verification is relaxed.");
  }
  if (smtp.debug) {
    console.log("[SMTP Debug] Verbose SMTP protocol logs enabled (SMTP_DEBUG=true).");
  }
}

// Team inbox(es) for new applications and copies of eSign emails
export function getNotificationEmails() {
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
  return notificationEmails;
}

// Tries the configured port first, then STARTTLS on 587 and SSL on 465. Throws the last error if all fail.
export async function sendMail(message: nodemailer.SendMailOptions) {
  const smtp = getSmtpSettings();
  const primaryPort = Number(smtp.port);
  const smtpAttempts = [
    { port: primaryPort, secure: primaryPort === 465, label: "primary" },
    { port: 587, secure: false, label: "fallback-starttls" },
    { port: 465, secure: true, label: "fallback-ssl" },
  ].filter(
    (attempt, index, arr) =>
      Number.isFinite(attempt.port) && arr.findIndex((a) => a.port === attempt.port && a.secure === attempt.secure) === index
  );

  let lastSmtpError: unknown;

  for (const attempt of smtpAttempts) {
    try {
      console.log(
        `[SMTP] Attempt ${attempt.label}: host=${smtp.host}, port=${attempt.port}, secure=${attempt.secure ? "true" : "false"}`
      );

      const transporter = nodemailer.createTransport({
        host: smtp.host,
        port: attempt.port,
        secure: attempt.secure,
        requireTLS: !attempt.secure,
        auth: {
          user: smtp.user,
          pass: smtp.pass,
        },
        logger: smtp.debug,
        debug: smtp.debug,
        connectionTimeout: 15000,
        greetingTimeout: 10000,
        socketTimeout: 20000,
        tls: {
          minVersion: "TLSv1.2",
          servername: smtp.host,
          rejectUnauthorized: !smtp.allowSelfSigned,
        },
      });

      // Verify SMTP handshake before sending to fail fast with better diagnostics.
      await transporter.verify();
      await transporter.sendMail(message);
      return;
    } catch (smtpError: any) {
      lastSmtpError = smtpError;
      console.error(
        `[SMTP] Attempt ${attempt.label} failed (${smtpError?.code || "UNKNOWN"}): ${smtpError?.message || smtpError}`
      );
      if ((smtpError?.message || "").toLowerCase().includes("self-signed certificate") && !smtp.allowSelfSigned) {
        console.error("[SMTP Hint] If your provider/network uses a self-signed chain, set SMTP_ALLOW_SELF_SIGNED=true in .env.");
      }
    }
  }

  throw lastSmtpError;
}
