import fs from "fs";
import path from "path";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

export function isStorageConfigured() {
  return !!(process.env.FIREBASE_SERVICE_ACCOUNT_PATH && process.env.FIREBASE_STORAGE_BUCKET);
}

function getBucket() {
  if (getApps().length === 0) {
    const keyPath = path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH!.trim());
    initializeApp({
      credential: cert(JSON.parse(fs.readFileSync(keyPath, "utf8"))),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET!.trim(),
    });
  }
  return getStorage().bucket();
}

// Uploads one file and returns its path inside the bucket, e.g. "CK123/aadhar.pdf"
export async function uploadFile(filePath: string, data: Buffer, contentType: string) {
  await getBucket().file(filePath).save(data, { contentType, resumable: false });
  return filePath;
}
