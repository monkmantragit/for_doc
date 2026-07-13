'use server';

import {
    createFellowshipApplicationItem,
    uploadFellowshipResume,
} from '@/lib/directus';
import { isFellowshipWindowOpen } from '@/lib/fellowship-window';
import { isEmailConfigured, sendMail } from '@/lib/email';

const MAX_RESUME_BYTES = 5 * 1024 * 1024; // 5MB

const ALLOWED_RESUME_EXTENSIONS = [
    '.pdf',
    '.doc',
    '.docx',
];

const ALLOWED_RESUME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

type ResumeUpload = {
    name: string;
    type: string;
    size: number;
    arrayBuffer: () => Promise<ArrayBuffer>;
};

function isResumeUpload(
    value: FormDataEntryValue | null
): value is ResumeUpload {
    return (
        typeof value === 'object' &&
        value !== null &&
        typeof (value as ResumeUpload).arrayBuffer ===
            'function' &&
        typeof (value as ResumeUpload).size === 'number' &&
        typeof (value as ResumeUpload).name === 'string'
    );
}

function resumeIsAllowed(file: ResumeUpload): boolean {
    const lowerName = file.name.toLowerCase();

    const extensionIsAllowed =
        ALLOWED_RESUME_EXTENSIONS.some((extension) =>
            lowerName.endsWith(extension)
        );

    const typeIsAllowed =
        !file.type ||
        ALLOWED_RESUME_TYPES.includes(file.type);

    return extensionIsAllowed && typeIsAllowed;
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
    const recipient =
        process.env.FELLOWSHIP_NOTIFY_EMAIL ||
        process.env.ADMIN_EMAIL;

    if (!recipient) {
        console.warn(
            'Fellowship application saved, but no FELLOWSHIP_NOTIFY_EMAIL or ADMIN_EMAIL is configured. Notification skipped.'
        );
        return;
    }

    const directusUrl =
        process.env.NEXT_PUBLIC_DIRECTUS_URL;

    const recordLink =
        data.id && directusUrl
            ? `${directusUrl}/admin/content/fellowship_applications/${data.id}`
            : null;

    const rows = [
        ['Name', data.name],
        ['Email', data.email],
        ['Phone', data.phone],
        ['Qualification', data.qualification],
        [
            'Resume',
            data.hasResume
                ? 'Attached — view in the Directus record'
                : 'Not provided',
        ],
        [
            'Message',
            data.message?.trim() || '—',
        ],
        [
            'Submitted',
            `${new Date().toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata',
            })} IST`,
        ],
    ];

    const html = `
        <h2 style="margin:0 0 12px">
            New Fellowship Application
        </h2>

        <table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">
            ${rows
                .map(
                    ([label, value]) => `
                        <tr>
                            <td style="padding:6px 12px;font-weight:bold;vertical-align:top;color:#334155">
                                ${label}
                            </td>
                            <td style="padding:6px 12px;color:#0f172a">
                                ${String(value).replace(
                                    /\n/g,
                                    '<br>'
                                )}
                            </td>
                        </tr>
                    `
                )
                .join('')}
        </table>

        ${
            recordLink
                ? `
                    <p style="margin-top:16px">
                        <a href="${recordLink}">
                            Open the application in Directus
                        </a>
                    </p>
                `
                : ''
        }
    `;

    const text =
        rows
            .map(
                ([label, value]) =>
                    `${label}: ${value}`
            )
            .join('\n') +
        (recordLink
            ? `\n\nOpen in Directus: ${recordLink}`
            : '');

    await sendMail({
        to: recipient,
        subject: `New Fellowship Application — ${data.name}`,
        html,
        text,
    });
}

export async function createFellowshipApplication(
    prevState: unknown,
    formData: FormData
) {
    try {
        if (!isFellowshipWindowOpen()) {
            return {
                success: false,
                message:
                    'Applications are currently closed. Please apply during the next application window.',
            };
        }

        const nameValue = formData.get('name');
        const emailValue = formData.get('email');
        const phoneValue = formData.get('phone');
        const qualificationValue =
            formData.get('qualification');
        const messageValue = formData.get('message');

        const name =
            typeof nameValue === 'string'
                ? nameValue.trim()
                : '';

        const email =
            typeof emailValue === 'string'
                ? emailValue.trim()
                : '';

        const phone =
            typeof phoneValue === 'string'
                ? phoneValue.trim()
                : '';

        const qualification =
            typeof qualificationValue === 'string'
                ? qualificationValue.trim()
                : '';

        const message =
            typeof messageValue === 'string'
                ? messageValue.trim()
                : '';

        if (
            !name ||
            !email ||
            !phone ||
            !qualification
        ) {
            return {
                success: false,
                message:
                    'Please complete all required fields.',
            };
        }

        const emailIsValid =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                email
            );

        if (!emailIsValid) {
            return {
                success: false,
                message:
                    'Please enter a valid email address.',
            };
        }

        const resume = formData.get('resume');

        if (
            !isResumeUpload(resume) ||
            resume.size === 0
        ) {
            return {
                success: false,
                message:
                    'Resume / CV is required.',
            };
        }

        if (resume.size > MAX_RESUME_BYTES) {
            return {
                success: false,
                message:
                    'Resume must be 5MB or smaller.',
            };
        }

        if (!resumeIsAllowed(resume)) {
            return {
                success: false,
                message:
                    'Resume must be a PDF, DOC, or DOCX file.',
            };
        }

        const arrayBuffer =
            await resume.arrayBuffer();

        const buffer = Buffer.from(arrayBuffer);

        const resumeId =
            await uploadFellowshipResume(
                buffer,
                resume.name,
                resume.type ||
                    'application/octet-stream'
            );

        if (!resumeId) {
            return {
                success: false,
                message:
                    'Resume upload failed. Please try again.',
            };
        }

        const created =
            await createFellowshipApplicationItem({
                name,
                email,
                phone,
                qualification,
                message,
                resume: resumeId,
            });

        try {
            if (isEmailConfigured()) {
                await notifyTeam({
                    name,
                    email,
                    phone,
                    qualification,
                    message,
                    id: created?.id,
                    hasResume: true,
                });
            } else {
                console.warn(
                    'Fellowship application saved, but SMTP is not configured. Notification email was not sent.'
                );
            }
        } catch (emailError) {
            console.error(
                'Fellowship notification email failed, but the application was saved:',
                emailError
            );
        }

        return {
            success: true,
            message:
                'Application submitted successfully.',
        };
    } catch (error) {
        console.error(
            'Error creating fellowship application:',
            error
        );

        return {
            success: false,
            message:
                'Failed to submit the application. Please try again later.',
        };
    }
}
