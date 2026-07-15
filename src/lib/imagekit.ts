/**
 * ImageKit helper (SERVER-ONLY) for fellowship resume attachments.
 *
 * Resumes are uploaded as PRIVATE files (`isPrivateFile: true`) into
 * `/fellowship-resumes` and read back via short-lived signed URLs. The team's
 * durable copy of a resume is the email attachment; the signed URL stored on
 * the Directus record is a convenience link that expires.
 *
 * Configuration (server-only env — NEVER prefix with NEXT_PUBLIC_):
 *   IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT
 *   IMAGEKIT_SIGNED_URL_EXPIRY_SECONDS (optional, default 604800 = 7 days)
 *
 * Do not import this from a client component — it would leak the private key.
 */

import ImageKit from 'imagekit';

let client: ImageKit | null = null;

/** True when the minimum ImageKit settings are present. */
export function isImageKitConfigured(): boolean {
  return Boolean(
    process.env.IMAGEKIT_PUBLIC_KEY &&
      process.env.IMAGEKIT_PRIVATE_KEY &&
      process.env.IMAGEKIT_URL_ENDPOINT,
  );
}

function getClient(): ImageKit {
  if (!isImageKitConfigured()) {
    throw new Error(
      'ImageKit is not configured. Set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY and IMAGEKIT_URL_ENDPOINT on the server.',
    );
  }
  if (!client) {
    client = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY as string,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT as string,
    });
  }
  return client;
}

function expirySeconds(): number {
  const raw = Number(process.env.IMAGEKIT_SIGNED_URL_EXPIRY_SECONDS);
  return Number.isFinite(raw) && raw > 0 ? raw : 604800; // default 7 days
}

export interface UploadedResume {
  fileId: string;
  name: string;
  filePath: string;
}

/**
 * Upload a resume buffer to ImageKit as a private file and return its ids.
 * SERVER-ONLY.
 */
export async function uploadFellowshipResume(
  buffer: Buffer,
  filename: string,
): Promise<UploadedResume> {
  const ik = getClient();
  const result = await ik.upload({
    file: buffer,
    fileName: filename,
    folder: '/fellowship-resumes',
    isPrivateFile: true,
    useUniqueFileName: true,
  });
  return { fileId: result.fileId, name: result.name, filePath: result.filePath };
}

/**
 * Generate a short-lived signed URL for a private resume `filePath`.
 * SERVER-ONLY.
 */
export function signedResumeUrl(filePath: string): string {
  const ik = getClient();
  return ik.url({
    path: filePath,
    signed: true,
    expireSeconds: expirySeconds(),
  });
}
