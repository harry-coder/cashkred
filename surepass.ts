// Surepass Aadhaar eSign: upload the PDF, then start a signing session for it.
export function isSurepassConfigured() {
  return !!process.env.SUREPASS_TOKEN;
}

// Surepass has no eSign sandbox, so production is the default
function getBaseUrl() {
  return (process.env.SUREPASS_BASE_URL || "https://kyc-api.surepass.app").trim().replace(/\/+$/, "");
}

// Surepass wraps every response as { success, data, message, message_code }
async function callSurepass<T>(endpoint: string, body: FormData | object): Promise<T> {
  const isForm = body instanceof FormData;
  const response = await fetch(`${getBaseUrl()}${endpoint}`, {
    method: "POST",
    // For FormData, fetch sets the multipart Content-Type (with boundary) itself
    headers: {
      Authorization: `Bearer ${process.env.SUREPASS_TOKEN!.trim()}`,
      ...(isForm ? {} : { "Content-Type": "application/json" }),
    },
    body: isForm ? body : JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  });

  const json: any = await response.json().catch(() => null);
  if (!response.ok || !json?.success) {
    const error: any = new Error(`[Surepass] ${endpoint} failed (HTTP ${response.status}): ${json?.message || response.statusText}`);
    error.code = json?.message_code || `HTTP_${response.status}`;
    throw error;
  }
  return json.data as T;
}

// Returns the file_id that initializeEsign signs
export async function uploadEsignFile(pdf: Uint8Array, fileName: string) {
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(pdf)], { type: "application/pdf" }), fileName);
  form.append("file_name", fileName);

  const data = await callSurepass<{ client_id: string; file_id: string; uploaded: boolean }>("/api/v1/files/esign/upload", form);
  if (!data?.uploaded || !data.file_id) {
    throw new Error(`[Surepass] ${fileName} was not uploaded.`);
  }
  return data.file_id;
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

export async function initializeEsign(fileId: string, signer: EsignSigner, positions: SignaturePositions, reason: string) {
  return callSurepass<EsignSession>("/api/v1/esign/initialize", {
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
      name_match: { match: true, score: 80 },
    },
    prefill_options: {
      full_name: signer.fullName,
      mobile_number: signer.mobile,
      user_email: signer.email,
    },
    sign_type: "aadhaar",
  });
}
