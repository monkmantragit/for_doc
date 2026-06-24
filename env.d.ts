declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_DIRECTUS_URL: string;
    DIRECTUS_ADMIN_TOKEN: string;
    DIRECTUS_EMAIL?: string;
    DIRECTUS_PASSWORD?: string;

    // SMTP (fellowship application notifications)
    SMTP_HOST?: string;
    SMTP_PORT?: string;
    SMTP_USER?: string;
    SMTP_PASSWORD?: string;
    SMTP_FROM?: string;
    SMTP_SECURE?: string;
    ADMIN_EMAIL?: string;
    FELLOWSHIP_NOTIFY_EMAIL?: string;

    // 'open' | 'closed' to force the fellowship application window (else date-based)
    FELLOWSHIP_WINDOW_OVERRIDE?: string;
  }
} 