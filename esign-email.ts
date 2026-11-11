import type { AgreementValues } from "./agreement";
import { getNotificationEmails, getSenderAddress, sendMail } from "./mailer";

const SUPPORT_EMAIL = "support@cashkred.com";
const SUPPORT_PHONE = "9220109924";
const COMPANY_ADDRESS = "Daksh Lefins Limited, 207 Second Floor, Allied House, Inderlok, New Delhi 110035";

// Surepass's signer page lives on esign-client.surepass.io (or .app); resends only accept links there
export function isSurepassSigningUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && /(^|\.)surepass\.(io|app)$/.test(url.hostname);
  } catch {
    return false;
  }
}

// The signer link carries a JWT; its exp claim is when the link stops working (7 days after creation).
// Read without verifying, only to show the date in the email.
export function getSigningLinkExpiry(tokenOrUrl: string) {
  for (const candidate of tokenOrUrl.match(/[\w-]+\.[\w-]+\.[\w-]+/g) || []) {
    try {
      const claims = JSON.parse(Buffer.from(candidate.split(".")[1], "base64url").toString("utf8"));
      if (typeof claims?.exp === "number") return new Date(claims.exp * 1000);
    } catch {
      // Not a JWT, try the next match
    }
  }
  return null;
}

function formatExpiry(date: Date) {
  const formatted = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
  return `${formatted} IST`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Only the last 4 characters of the PAN go in the email
function maskPan(pan: string) {
  return pan.length > 4 ? `${"X".repeat(pan.length - 4)}${pan.slice(-4)}` : pan;
}

// Sanction date is left out: on a resend it would show the resend date, not the date printed in the agreement
function loanRows(values: AgreementValues): [string, string][] {
  return [
    ["Loan number", values.applicationId],
    ["Loan amount", values.principal],
    ["Rate of interest", values.interestRate],
    ["Processing fee", values.processingFee],
    ["GST on processing fee", values.gst],
    ["Amount to be disbursed", values.disbursedAmount],
    ["Tenure", values.tenure],
    ["Repayment date", values.repaymentDate],
    ["Total repayment amount", values.repaymentAmount],
  ];
}

function borrowerRows(values: AgreementValues): [string, string][] {
  return [
    ["Name", values.borrowerName],
    ["Mobile", values.phone],
    ["Email", values.email],
    ["PAN", maskPan(values.pan)],
  ];
}

const SIGNING_STEPS = [
  "Open the signing link and read the full loan agreement.",
  "Enter your Aadhaar number when asked.",
  "Enter the OTP sent by UIDAI to the mobile number linked with your Aadhaar.",
  "Confirm to sign. You can download the signed copy at the end.",
];

function htmlTable(title: string, rows: [string, string][], highlightLast = false) {
  const body = rows
    .map(([label, value], index) => {
      const strong = highlightLast && index === rows.length - 1;
      return `
              <tr>
                <td style="padding: 10px 16px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px; width: 50%;">${escapeHtml(label)}</td>
                <td style="padding: 10px 16px; border-top: 1px solid #e2e8f0; color: #0f172a; font-size: 14px; font-weight: ${strong ? 700 : 600}; text-align: right;">${escapeHtml(value)}</td>
              </tr>`;
    })
    .join("");

  return `
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e2e8f0; border-radius: 8px; border-collapse: separate; margin: 0 0 24px;">
              <tr>
                <td colspan="2" style="padding: 12px 16px; background-color: #f8fafc; color: #1e3a8a; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-radius: 8px 8px 0 0;">${escapeHtml(title)}</td>
              </tr>${body}
            </table>`;
}

export function buildSigningEmail(values: AgreementValues, signingUrl: string, expiresAt: Date | null) {
  const firstName = values.borrowerName.split(" ")[0];
  const expiryText = expiresAt ? `This link is valid until ${formatExpiry(expiresAt)}.` : "";
  const url = escapeHtml(signingUrl);

  const subject = `Action required: Sign your CashKred loan agreement (${values.applicationId})`;

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: Arial, Helvetica, sans-serif;">
    <div style="display: none; max-height: 0; overflow: hidden;">Your loan of ${escapeHtml(values.principal)} is ready. Sign the agreement online with Aadhaar eSign.</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
            <tr>
              <td style="background-color: #1e40af; padding: 24px 32px;">
                <div style="color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">CashKred</div>
                <div style="color: #bfdbfe; font-size: 13px; margin-top: 4px;">Loan agreement for signature</div>
              </td>
            </tr>
            <tr>
              <td style="padding: 32px;">
                <p style="margin: 0 0 16px; color: #0f172a; font-size: 16px;">Dear ${escapeHtml(firstName)},</p>
                <p style="margin: 0 0 16px; color: #334155; font-size: 15px; line-height: 1.6;">
                  Your loan of <strong>${escapeHtml(values.principal)}</strong> (loan number <strong>${escapeHtml(values.applicationId)}</strong>) is ready.
                  The last step is to sign your loan agreement online using Aadhaar eSign. It takes about 2 minutes.
                </p>
                <p style="margin: 0 0 24px; color: #334155; font-size: 15px; line-height: 1.6;">
                  Please check the details below. If anything is wrong, don't sign; contact us instead.
                </p>

                <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto 12px;">
                  <tr>
                    <td align="center" style="border-radius: 8px; background-color: #2563eb;">
                      <a href="${url}" target="_blank" rel="noopener" style="display: inline-block; padding: 14px 36px; color: #ffffff; font-size: 16px; font-weight: 700; text-decoration: none; border-radius: 8px;">Review &amp; Sign Agreement</a>
                    </td>
                  </tr>
                </table>
                ${expiryText ? `<p style="margin: 0 0 28px; color: #64748b; font-size: 13px; text-align: center;">${escapeHtml(expiryText)}</p>` : `<div style="height: 16px;"></div>`}
${htmlTable("Loan details", loanRows(values), true)}
${htmlTable("Your details", borrowerRows(values))}
                <div style="margin: 0 0 24px; padding: 16px 20px; background-color: #eff6ff; border-radius: 8px;">
                  <div style="color: #1e3a8a; font-size: 14px; font-weight: 700; margin-bottom: 8px;">How to sign</div>
                  <ol style="margin: 0; padding-left: 20px; color: #334155; font-size: 14px; line-height: 1.7;">
                    ${SIGNING_STEPS.map((step) => `<li>${escapeHtml(step)}</li>`).join("\n                    ")}
                  </ol>
                  <div style="color: #475569; font-size: 13px; margin-top: 10px; line-height: 1.5;">
                    The name on your Aadhaar must match <strong>${escapeHtml(values.borrowerName)}</strong>. Keep the phone linked with your Aadhaar handy for the OTP.
                  </div>
                </div>

                <p style="margin: 0 0 8px; color: #64748b; font-size: 13px;">If the button doesn't work, copy this link into your browser:</p>
                <p style="margin: 0 0 24px; font-size: 13px; word-break: break-all;"><a href="${url}" target="_blank" rel="noopener" style="color: #2563eb;">${url}</a></p>

                <div style="padding: 14px 16px; border-left: 4px solid #f59e0b; background-color: #fffbeb; color: #78350f; font-size: 13px; line-height: 1.5;">
                  <strong>Stay safe:</strong> this link is only for you, so don't forward it. CashKred will never ask for your OTP, Aadhaar number or passwords by phone, SMS or email.
                  If you didn't apply for this loan, contact us right away.
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px; line-height: 1.6;">
                Need help? Email <a href="mailto:${SUPPORT_EMAIL}" style="color: #2563eb;">${SUPPORT_EMAIL}</a> or call ${SUPPORT_PHONE}.<br>
                ${escapeHtml(COMPANY_ADDRESS)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const textRows = (rows: [string, string][]) => rows.map(([label, value]) => `  ${label}: ${value}`).join("\n");
  const text = [
    `Dear ${firstName},`,
    "",
    `Your loan of ${values.principal} (loan number ${values.applicationId}) is ready. The last step is to sign your loan agreement online using Aadhaar eSign.`,
    "Please check the details below. If anything is wrong, don't sign; contact us instead.",
    "",
    "Review and sign your agreement here:",
    signingUrl,
    expiryText,
    "",
    "LOAN DETAILS",
    textRows(loanRows(values)),
    "",
    "YOUR DETAILS",
    textRows(borrowerRows(values)),
    "",
    "HOW TO SIGN",
    ...SIGNING_STEPS.map((step, index) => `  ${index + 1}. ${step}`),
    `The name on your Aadhaar must match ${values.borrowerName}.`,
    "",
    "Stay safe: this link is only for you, so don't forward it. CashKred will never ask for your OTP, Aadhaar number or passwords by phone, SMS or email. If you didn't apply for this loan, contact us right away.",
    "",
    `Need help? Email ${SUPPORT_EMAIL} or call ${SUPPORT_PHONE}.`,
    COMPANY_ADDRESS,
  ]
    .filter((line, index, lines) => !(line === "" && lines[index - 1] === ""))
    .join("\n");

  return { subject, html, text };
}

// Emails the borrower their signing link, with a hidden copy to the team inbox. Replies go to support.
export async function sendSigningEmail(values: AgreementValues, signingUrl: string, expiresAt: Date | null) {
  const { subject, html, text } = buildSigningEmail(values, signingUrl, expiresAt);
  await sendMail({
    from: `"CashKred" <${getSenderAddress()}>`,
    to: values.email,
    bcc: getNotificationEmails().join(", "),
    replyTo: SUPPORT_EMAIL,
    subject,
    html,
    text,
  });
}
