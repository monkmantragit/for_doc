'use client';

import { useState } from 'react';
import {
    Send,
    CheckCircle,
    AlertCircle,
    Paperclip,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createFellowshipApplication } from '../actions';

const MAX_RESUME_BYTES = 5 * 1024 * 1024; // 5MB

const ALLOWED_RESUME_EXTENSIONS = [
    '.pdf',
    '.doc',
    '.docx',
];

export default function FellowshipApplicationForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        qualification: '',
        message: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [resumeError, setResumeError] = useState('');
    const [submitErrorMessage, setSubmitErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [submitStatus, setSubmitStatus] = useState<
        'idle' | 'success' | 'error'
    >('idle');

    const handleChange = (
        event: React.ChangeEvent<
            HTMLInputElement |
            HTMLTextAreaElement |
            HTMLSelectElement
        >
    ) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        if (errors[name]) {
            setErrors((previous) => {
                const updatedErrors = { ...previous };
                delete updatedErrors[name];
                return updatedErrors;
            });
        }

        if (submitStatus === 'error') {
            setSubmitStatus('idle');
            setSubmitErrorMessage('');
        }
    };

    const handleResumeChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];

        if (!file) {
            setResumeFile(null);
            setResumeError('Resume / CV is required.');
            return;
        }

        const lowerCaseFileName = file.name.toLowerCase();

    const MAX_RESUME_BYTES = 2 * 1024 * 1024; // 2MB
    const ALLOWED_RESUME_EXTENSIONS = ['.pdf', '.doc', '.docx'];

        if (!hasAllowedExtension) {
            setResumeFile(null);
            setResumeError(
                'Please upload a PDF, DOC, or DOCX file.'
            );

            event.target.value = '';
            return;
        }

        if (file.size === 0) {
            setResumeFile(null);
            setResumeError(
                'The selected file is empty. Please upload a valid resume.'
            );

            event.target.value = '';
            return;
        }

        if (file.size > MAX_RESUME_BYTES) {
            setResumeError('This file is too large. Please upload a resume under 2 MB.');
            setResumeFile(null);
            // Clear the input so re-selecting the same over-size file still fires onChange.
            e.target.value = '';
            return;
        }

        setResumeFile(file);
        setResumeError('');
        setSubmitErrorMessage('');

        if (submitStatus === 'error') {
            setSubmitStatus('idle');
        }
    };

    const removeResume = () => {
        setResumeFile(null);
        setResumeError('Resume / CV is required.');
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required.';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required.';
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                formData.email.trim()
            )
        ) {
            newErrors.email =
                'Please enter a valid email address.';
        }

        if (!formData.phone.trim()) {
            newErrors.phone =
                'Phone number is required.';
        }

        if (!formData.qualification.trim()) {
            newErrors.qualification =
                'Qualification is required.';
        }

        let resumeIsValid = true;

        if (!resumeFile) {
            setResumeError(
                'Resume / CV is required.'
            );

            resumeIsValid = false;
        } else if (resumeError) {
            resumeIsValid = false;
        }

        setErrors(newErrors);

        // Resume/CV is now mandatory.
        let resumeOk = true;
        if (!resumeFile) {
            setResumeError('Resume is required. Please attach your CV (PDF, DOC, or DOCX).');
            resumeOk = false;
        }

        return Object.keys(newErrors).length === 0 && resumeOk;
    };

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setSubmitStatus('idle');
        setSubmitErrorMessage('');

        const formIsValid = validateForm();

        if (!formIsValid) {
            if (!resumeFile) {
                setSubmitErrorMessage(
                    'Resume / CV is required.'
                );
            }

            return;
        }

        if (!resumeFile) {
            setResumeError(
                'Resume / CV is required.'
            );

            setSubmitErrorMessage(
                'Resume / CV is required.'
            );

            setSubmitStatus('error');
            return;
        }

        setIsSubmitting(true);

        try {
            const submissionData = new FormData();

            submissionData.append(
                'name',
                formData.name.trim()
            );

            submissionData.append(
                'email',
                formData.email.trim()
            );

            submissionData.append(
                'phone',
                formData.phone.trim()
            );

            submissionData.append(
                'qualification',
                formData.qualification.trim()
            );

            submissionData.append(
                'message',
                formData.message.trim()
            );

            submissionData.append(
                'resume',
                resumeFile
            );

            const result =
                await createFellowshipApplication(
                    null,
                    submissionData
                );

            if (!result.success) {
                const message =
                    result.message ||
                    'Submission failed. Please try again.';

                setSubmitErrorMessage(message);
                setSubmitStatus('error');

                if (
                    message
                        .toLowerCase()
                        .includes('resume')
                ) {
                    setResumeError(message);
                }

                return;
            }

            setSubmitStatus('success');
            setSubmitErrorMessage('');
            setErrors({});
            setResumeError('');
            setResumeFile(null);

            setFormData({
                name: '',
                email: '',
                phone: '',
                qualification: '',
                message: '',
            });

            window.setTimeout(() => {
                setSubmitStatus('idle');
            }, 5000);
        } catch (error) {
            console.error(
                'Error submitting fellowship application:',
                error
            );

            const message =
                error instanceof Error
                    ? error.message
                    : 'There was an error sending your application. Please try again later.';

            setSubmitErrorMessage(message);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-soi-mint-200 p-6 md:p-8">
            <h3 className="text-2xl font-bold text-soi-navy-800 mb-2">
                Apply for Fellowship
            </h3>

            <p className="text-soi-navy-600 mb-6">
                Start your journey towards excellence in
                orthopedics.
            </p>

            {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-50 text-green-800 rounded-lg border border-green-200 flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />

                    <div>
                        <p className="font-medium">
                            Application Received!
                        </p>

                        <p className="text-sm mt-1">
                            Thank you for applying. We
                            will review your application
                            and get back to you soon.
                        </p>
                    </div>
                </div>
            )}

            {submitStatus === 'error' && (
                <div
                    role="alert"
                    className="mb-6 p-4 bg-red-50 text-red-800 rounded-lg border border-red-200 flex items-start gap-3"
                >
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />

                    <div>
                        <p className="font-medium">
                            Submission Failed
                        </p>

                        <p className="text-sm mt-1">
                            {submitErrorMessage ||
                                'There was an error sending your application. Please try again later.'}
                        </p>
                    </div>
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="space-y-5"
                noValidate
            >
                <div>
                    <label
                        htmlFor="name"
                        className="block text-sm font-medium text-soi-navy-700 mb-1"
                    >
                        Full Name{' '}
                        <span className="text-red-500">
                            *
                        </span>
                    </label>

                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={
                            errors.name
                                ? 'name-error'
                                : undefined
                        }
                        className={`w-full px-4 py-2.5 rounded-lg border ${
                            errors.name
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-soi-purple-500'
                        } focus:border-transparent focus:ring-2 transition-all outline-none`}
                        placeholder="Dr. John Doe"
                    />

                    {errors.name && (
                        <p
                            id="name-error"
                            className="mt-1 text-sm text-red-500"
                        >
                            {errors.name}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-soi-navy-700 mb-1"
                        >
                            Email Address{' '}
                            <span className="text-red-500">
                                *
                            </span>
                        </label>

                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            aria-invalid={Boolean(
                                errors.email
                            )}
                            aria-describedby={
                                errors.email
                                    ? 'email-error'
                                    : undefined
                            }
                            className={`w-full px-4 py-2.5 rounded-lg border ${
                                errors.email
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-soi-purple-500'
                            } focus:border-transparent focus:ring-2 transition-all outline-none`}
                            placeholder="john@example.com"
                        />

                        {errors.email && (
                            <p
                                id="email-error"
                                className="mt-1 text-sm text-red-500"
                            >
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="phone"
                            className="block text-sm font-medium text-soi-navy-700 mb-1"
                        >
                            Phone Number{' '}
                            <span className="text-red-500">
                                *
                            </span>
                        </label>

                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            aria-invalid={Boolean(
                                errors.phone
                            )}
                            aria-describedby={
                                errors.phone
                                    ? 'phone-error'
                                    : undefined
                            }
                            className={`w-full px-4 py-2.5 rounded-lg border ${
                                errors.phone
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-soi-purple-500'
                            } focus:border-transparent focus:ring-2 transition-all outline-none`}
                            placeholder="+91 98765 43210"
                        />

                        {errors.phone && (
                            <p
                                id="phone-error"
                                className="mt-1 text-sm text-red-500"
                            >
                                {errors.phone}
                            </p>
                        )}
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="qualification"
                        className="block text-sm font-medium text-soi-navy-700 mb-1"
                    >
                        Current Qualification{' '}
                        <span className="text-red-500">
                            *
                        </span>
                    </label>

                    <select
                        id="qualification"
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleChange}
                        aria-invalid={Boolean(
                            errors.qualification
                        )}
                        aria-describedby={
                            errors.qualification
                                ? 'qualification-error'
                                : undefined
                        }
                        className={`w-full px-4 py-2.5 rounded-lg border ${
                            errors.qualification
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-soi-purple-500'
                        } focus:border-transparent focus:ring-2 transition-all outline-none bg-white`}
                    >
                        <option value="">
                            Select Qualification
                        </option>

                        <option value="MS Ortho">
                            MS Ortho
                        </option>

                        <option value="DNB Ortho">
                            DNB Ortho
                        </option>

                        <option value="MCh">
                            MCh
                        </option>

                        <option value="MRCS">
                            MRCS
                        </option>

                        <option value="Other">
                            Other
                        </option>
                    </select>

                    {errors.qualification && (
                        <p
                            id="qualification-error"
                            className="mt-1 text-sm text-red-500"
                        >
                            {errors.qualification}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="message"
                        className="block text-sm font-medium text-soi-navy-700 mb-1"
                    >
                        Message / Statement of Purpose
                    </label>

                    <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-soi-purple-500 focus:border-transparent focus:ring-2 transition-all outline-none resize-none"
                        placeholder="Why do you want to join this fellowship?"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-soi-navy-700 mb-1">
                        Resume / CV <span className="text-red-500">*</span> <span className="text-soi-navy-400 font-normal">(PDF, DOC, DOCX · max 2MB)</span>
                    </label>

                    {!resumeFile ? (
                        <label
                            htmlFor="resume"
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed text-soi-navy-600 cursor-pointer transition-colors ${
                                resumeError
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-300 hover:border-soi-purple-400 hover:bg-soi-purple-50/50'
                            }`}
                        >
                            <Paperclip className="w-4 h-4 flex-shrink-0" />

                            <span className="text-sm">
                                Attach your resume
                            </span>

                            <input
                                id="resume"
                                name="resume"
                                type="file"
                                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                onChange={
                                    handleResumeChange
                                }
                                aria-invalid={Boolean(
                                    resumeError
                                )}
                                aria-describedby={
                                    resumeError
                                        ? 'resume-error'
                                        : 'resume-help'
                                }
                                className="sr-only"
                            />
                        </label>
                    ) : (
                        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg border border-soi-mint-300 bg-soi-mint-50">
                            <span className="flex items-center gap-2 min-w-0 text-sm text-soi-navy-700">
                                <Paperclip className="w-4 h-4 flex-shrink-0 text-soi-mint-600" />

                                <span className="truncate">
                                    {resumeFile.name}
                                </span>
                            </span>

                            <button
                                type="button"
                                onClick={removeResume}
                                aria-label="Remove resume"
                                className="flex-shrink-0 text-soi-navy-400 hover:text-red-500 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {!resumeError && (
                        <p
                            id="resume-help"
                            className="mt-1 text-xs text-soi-navy-400"
                        >
                            A resume is required to submit
                            the application.
                        </p>
                    )}

                    {resumeError && (
                        <p
                            id="resume-error"
                            role="alert"
                            className="mt-1 text-sm text-red-500"
                        >
                            {resumeError}
                        </p>
                    )}
                </div>

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-soi-navy-500 hover:bg-soi-navy-600 text-white font-medium py-6 text-lg rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <span className="flex items-center gap-2">
                            <svg
                                className="animate-spin h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />

                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>

                            Processing...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            Submit Application
                            <Send className="w-5 h-5" />
                        </span>
                    )}
                </Button>
            </form>
        </div>
    );
}
