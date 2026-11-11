// Surepass Aadhaar eSign, following Surepass's integration guide (Flow B, client pre-uploads PDF):
// initialize with pdf_pre_uploaded=true -> get-upload-link -> post the PDF to it -> signer opens url
export function isSurepassConfigured() {
  return !!process.env.SUREPASS_TOKEN;
}

function getBaseUrl() {
  return (process.env.SUREPASS_BASE_URL || "https://kyc-api.surepass.io").trim().replace(/\/+$/, "");
}

// Surepass wraps every response as { success, data, message, message_code }. A GET is sent when body is omitted.
async function callSurepass<T>(endpoint: string, body?: object): Promise<T> {
  const response = await fetch(`${getBaseUrl()}${endpoint}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${process.env.SUREPASS_TOKEN!.trim()}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(30000),
  });

  const json: any = await response.json().catch(() => null);
  if (!response.ok || !json?.success) {
    const error: any = new Error(`[Surepass] ${endpoint} failed (HTTP ${response.status}): ${json?.message || response.statusText}`);
    error.code = json?.message_code || `HTTP_${response.status}`;
    error.status = response.status;
    throw error;
  }
  return json.data as T;
}

export interface EsignSigner {
  fullName: string;
  mobile: string;
  email: string;
}

// Page number (as a string) -> where the signature stamp goes on that page
export type SignaturePositions = Record<string, { x: number; y: number }[]>;

export interface EsignSession {
  client_id: string;
  group_id: string | null;
  token: string;
  url: string;
}

export async function initializeEsign(signer: EsignSigner, positions: SignaturePositions, reason: string) {
  return callSurepass<EsignSession>("/api/v1/esign/initialize", {
    // Our server uploads the PDF right after this call; the signer never uploads anything
    pdf_pre_uploaded: true,
    // Surepass doesn't email or SMS the signer; our server emails the signing link itself
    send_email: false,
    sign_type: "aadhaar",
    config: {
      positions,
      reason,
      allow_download: true,
      skip_otp: false,
      skip_email: false,
      name_match: { match: true, score: 80 },
      // Not in Surepass's guide but in their API reference: no virtual signatures, no changing the mobile
      accept_virtual_sign: false,
      allow_virtual_sign_upload: false,
      allow_number_change: false,
    },
    // Required by Surepass's guide
    prefill_options: {
      full_name: signer.fullName,
      mobile_number: signer.mobile,
      user_email: signer.email,
    },
  });
}

// Gets a pre-signed storage form for the session and posts the PDF to it, using the fields exactly as returned
export async function uploadEsignPdf(clientId: string, pdf: Uint8Array, fileName: string) {
  const link = await callSurepass<{ link_generated: boolean; url: string; fields: Record<string, string> }>(
    "/api/v1/esign/get-upload-link",
    { client_id: clientId }
  );
  if (!link?.link_generated || !link.url || !link.fields) {
    throw new Error(`[Surepass] Upload link was not generated for ${clientId}.`);
  }

  const form = new FormData();
  for (const [name, value] of Object.entries(link.fields)) form.append(name, value);
  // Storage ignores any form field sent after the file, so the file goes last
  form.append("file", new Blob([new Uint8Array(pdf)], { type: "application/pdf" }), fileName);

  const response = await fetch(link.url, { method: "POST", body: form, signal: AbortSignal.timeout(30000) });
  if (!response.ok) {
    const detail = (await response.text().catch(() => "")).slice(0, 300);
    throw new Error(`[Surepass] PDF upload to storage failed for ${clientId} (HTTP ${response.status}): ${detail}`);
  }
}

// Step 4 of the guide: returns Surepass's data (including the download URL) once signing is complete.
// Surepass answers 422 while the signed PDF isn't generated yet, and 404 for an unknown client_id.
export async function getSignedDocument(clientId: string) {
  return callSurepass<Record<string, unknown>>(`/api/v1/esign/get-signed-document/${encodeURIComponent(clientId)}`);
}
