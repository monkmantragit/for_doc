'use server';

import { createFellowshipApplicationItem, uploadFellowshipResume } from '@/lib/directus';
import { isFellowshipWindowOpen } from '@/lib/fellowship-window';
import { isEmailConfigured, sendMail } from '@/lib/email';

const MAX_RESUME_BYTES = 5 * 1024 * 1024; // 5MB
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

interface NotificationData {
    name: string;
    email: string;
    phone: string;
    qualification: string;
    message: string;
    id?: string | number;
    hasResume: boolean;
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

    const rows = [
        ['Name', data.name],
        ['Email', data.email],
        ['Phone', data.phone],
        ['Qualification', data.qualification],
        ['Resume', data.hasResume ? 'Attached (view in Directus record)' : 'Not provided'],
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

        // Resume upload is required (PDF/DOC/DOCX, max 5MB).
        const resume = formData.get('resume');
        if (!(resume instanceof File) || resume.size === 0) {
            return { success: false, message: 'A resume/CV is required. Please attach a PDF, DOC, or DOCX file.' };
        }
        if (resume.size > MAX_RESUME_BYTES) {
            return { success: false, message: 'Resume must be 5MB or smaller.' };
        }
        if (!resumeIsAllowed(resume)) {
            return { success: false, message: 'Resume must be a PDF, DOC, or DOCX file.' };
        }
        const resumeId = await uploadFellowshipResume(resume);

        // Stored in Directus (collection: fellowship_applications) so the admin
        // can review applications there, rather than in the team-wide admin.
        const created: any = await createFellowshipApplicationItem({
            name,
            email,
            phone,
            qualification,
            message,
            resume: resumeId,
        });

        // Notify the team. Email problems must never fail the submission — the
        // application is already safely stored at this point.
        try {
            if (isEmailConfigured()) {
                await notifyTeam({
                    name,
                    email,
                    phone,
                    qualification,
                    message,
                    id: created?.id,
                    hasResume: Boolean(resumeId),
                });
            } else {
                console.warn('Fellowship application saved, but SMTP is not configured — notification email not sent.');
            }
        } catch (emailError) {
            console.error('Fellowship notification email failed (application was saved):', emailError);
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
