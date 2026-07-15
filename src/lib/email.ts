/**
 * Minimal SMTP email helper (server-only) built on nodemailer.
 *
 * Configuration comes from environment variables:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM
 *   SMTP_SECURE (optional: 'true' to force TLS; otherwise inferred from port 465)
 *
 * Intentionally generic so it can be reused beyond fellowship notifications.
 * If SMTP is not configured, `isEmailConfigured()` returns false and callers
 * should skip sending rather than fail their main operation.
 */

import nodemailer, { type Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

/** True when the minimum SMTP settings are present. */
export function isEmailConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD,
  );
}

function getTransporter(): Transporter | null {
  if (!isEmailConfigured()) return null;
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT) || 587;
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: process.env.SMTP_SECURE === 'true' || port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
  return transporter;
}

/** A file attached to an outgoing email (nodemailer attachment shape). */
export interface MailAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: MailAttachment[];
}

/** Sends an email. Throws if SMTP is not configured or the send fails. */
export async function sendMail({ to, subject, html, text, attachments }: MailMessage): Promise<void> {
  const tx = getTransporter();
  if (!tx) throw new Error('SMTP is not configured.');
  const from = process.env.SMTP_FROM || process.env.SMTP_USER!;
  await tx.sendMail({ from, to, subject, html, text, attachments });
}
