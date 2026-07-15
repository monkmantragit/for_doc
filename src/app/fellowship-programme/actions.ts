'use server';

import { createFellowshipApplicationItem } from '@/lib/directus';
import {
    uploadFellowshipResume as uploadResumeToImageKit,
    signedResumeUrl,
} from '@/lib/imagekit';
import { isFellowshipWindowOpen } from '@/lib/fellowship-window';
import { isEmailConfigured, sendMail } from '@/lib/email';

const MAX_RESUME_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_RESUME_EXTENSIONS = ['.pdf', '.doc', '.docx'];
const ALLOWED_RESUME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

function resumeIsAllowed(file: File): boolean {
    const lowerName = file.name.toLowerCase();
    const extOk = ALLOWED_RESUME_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
    const typeOk = !file.type || ALLOWED_RESUME_TYPES.includes(file.type);
    return extOk && typeOk;
}

function contentTypeFor(filename: string): string {
    const lower = filename.toLowerCase();
    if (lower.endsWith('.pdf')) return 'application/pdf';
    if (lower.endsWith('.docx'))
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    if (lower.endsWith('.doc')) return 'application/msword';
    return 'application/octet-stream';
}

interface NotificationData {
    name: string;
    email: string;
    phone: string;
    qualification: string;
    message: string;
    id?: string | number;
    /** Signed ImageKit URL of the resume (may be omitted). */
    resumeUrl?: string;
    resumeFilename?: string;
    /** Raw resume bytes, attached to the email. */
    resumeBuffer?: Buffer;
}

async function notifyTeam(data: NotificationData) {
    const recipient = process.env.FELLOWSHIP_NOTIFY_EMAIL || process.env.ADMIN_EMAIL;
    if (!recipient) {
        console.warn('Fellowship application saved, but no FELLOWSHIP_NOTIFY_EMAIL/ADMIN_EMAIL is set — skipping notification.');
        return;
    }

    const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
    const recordLink = data.id && directusUrl
        ? `${directusUrl}/admin/content/fellowship_applications/${data.id}`
        : null;

    const resumeCell = data.resumeFilename
        ? `${data.resumeFilename}${data.resumeUrl ? ` — <a href="${data.resumeUrl}">download</a> (link expires)` : ''}`
        : 'Not provided';

    const rows = [
        ['Name', data.name],
        ['Email', data.email],
        ['Phone', data.phone],
        ['Qualification', data.qualification],
        ['Resume', data.resumeBuffer ? `${resumeCell} · attached to this email` : resumeCell],
        ['Message', data.message?.trim() || '—'],
        ['Submitted', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST'],
    ];

    const html = `
        <h2 style="margin:0 0 12px">New Fellowship Application</h2>
        <table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">
            ${rows
                .map(
                    ([label, value]) =>
                        `<tr><td style="padding:6px 12px;font-weight:bold;vertical-align:top;color:#334155">${label}</td><td style="padding:6px 12px;color:#0f172a">${String(value).replace(/\n/g, '<br>')}</td></tr>`,
                )
                .join('')}
        </table>
        ${recordLink ? `<p style="margin-top:16px"><a href="${recordLink}">Open the application in Directus</a></p>` : ''}
    `;

    const text = rows.map(([label, value]) => `${label}: ${value}`).join('\n')
        + (recordLink ? `\n\nOpen in Directus: ${recordLink}` : '');

    await sendMail({
        to: recipient,
        subject: `New Fellowship Application — ${data.name}`,
        html,
        text,
        attachments: data.resumeBuffer && data.resumeFilename
            ? [{ filename: data.resumeFilename, content: data.resumeBuffer, contentType: contentTypeFor(data.resumeFilename) }]
            : undefined,
    });
}

export async function createFellowshipApplication(prevState: any, formData: FormData) {
    try {
        // Enforce the application window server-side (UI also hides the form,
        // but this guards against direct/bypassed submissions).
        if (!isFellowshipWindowOpen()) {
            return {
                success: false,
                message: 'Applications are currently closed. Please apply during the next window.',
            };
        }

        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const phone = formData.get('phone') as string;
        const qualification = formData.get('qualification') as string;
        const message = formData.get('message') as string;

        // specific validation can be improved with zod
        if (!name || !email || !phone || !qualification) {
            return {
                success: false,
                message: 'Missing required fields',
            };
        }

        // Resume upload is required (PDF/DOC/DOCX, max 2MB).
        const resume = formData.get('resume');
        if (!(resume instanceof File) || resume.size === 0) {
            return { success: false, message: 'A resume/CV is required. Please attach a PDF, DOC, or DOCX file.' };
        }
        if (resume.size > MAX_RESUME_BYTES) {
            return { success: false, message: 'Resume must be 2 MB or smaller.' };
        }
        if (!resumeIsAllowed(resume)) {
            return { success: false, message: 'Resume must be a PDF, DOC, or DOCX file.' };
        }

        // Read the file once — reused for the ImageKit upload and the email attachment.
        const resumeBuffer = Buffer.from(await resume.arrayBuffer());
        const resumeFilename = resume.name;

        // 1) Upload the resume privately to ImageKit (required). Abort on failure.
        let resumeUrl: string | undefined;
        let resumeFileId: string | undefined;
        try {
            const uploaded = await uploadResumeToImageKit(resumeBuffer, resumeFilename);
            resumeFileId = uploaded.fileId;
            resumeUrl = signedResumeUrl(uploaded.filePath);
        } catch (uploadError) {
            console.error('ImageKit resume upload failed:', uploadError);
            return { success: false, message: 'We could not upload your resume. Please try again in a moment.' };
        }

        // 2) Persist to Directus (primary store). If this fails we still notify
        // the team below so the application is never lost.
        let directusId: string | number | undefined;
        let directusOk = false;
        try {
            const created: any = await createFellowshipApplicationItem({
                name,
                email,
                phone,
                qualification,
                message,
                resume_url: resumeUrl,
                resume_file_id: resumeFileId,
            });
            directusId = created?.id;
            directusOk = true;
        } catch (directusError) {
            console.error('Fellowship Directus save failed (will still email the team):', directusError);
        }

        // 3) Notify the team with all fields + the resume attached. Non-fatal on
        // its own, but doubles as the safety net when Directus fails.
        let emailOk = false;
        try {
            if (isEmailConfigured()) {
                await notifyTeam({
                    name,
                    email,
                    phone,
                    qualification,
                    message,
                    id: directusId,
                    resumeUrl,
                    resumeFilename,
                    resumeBuffer,
                });
                emailOk = true;
            } else {
                console.warn('Fellowship application processed, but SMTP is not configured — notification email not sent.');
            }
        } catch (emailError) {
            console.error('Fellowship notification email failed:', emailError);
        }

        // Only report failure if the application was neither stored nor emailed.
        if (!directusOk && !emailOk) {
            return {
                success: false,
                message: 'We could not record your application right now. Please try again shortly.',
            };
        }

        return {
            success: true,
            message: 'Application submitted successfully',
        };
    } catch (error) {
        console.error('Error creating fellowship application:', error);
        return {
            success: false,
            message: 'Failed to submit application. Please try again later.',
        };
    }
}
