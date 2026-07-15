/**
 * Make the fellowship `resume_url` a clickable link in the Directus admin
 * instead of an editable text box.
 *
 *   1. Sets `resume_url` to READ-ONLY (our server writes it; admins shouldn't edit).
 *   2. Adds a presentation-only "Open Resume" link button (`resume_link`, an alias
 *      field) that opens `{{resume_url}}` in a new tab.
 *
 * Run once against the Directus instance that holds `fellowship_applications`:
 *
 *     node scripts/make-fellowship-resume-clickable.mjs
 *
 * Reads NEXT_PUBLIC_DIRECTUS_URL and DIRECTUS_ADMIN_TOKEN from .env. Idempotent.
 * (The stored URL is an ImageKit signed URL that expires; the durable copy of a
 * resume is the email attachment.)
 */

import dotenv from 'dotenv';

dotenv.config();

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL;
const ADMIN_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;

const COLLECTION = 'fellowship_applications';

if (!DIRECTUS_URL || !ADMIN_TOKEN) {
  console.error('Missing config. NEXT_PUBLIC_DIRECTUS_URL and DIRECTUS_ADMIN_TOKEN must be set (.env).');
  process.exit(1);
}

async function api(path, options = {}) {
  const res = await fetch(`${DIRECTUS_URL}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}`, 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const text = await res.text();
  let body;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  return { ok: res.ok, status: res.status, body };
}

async function main() {
  console.log(`Directus: ${DIRECTUS_URL}`);

  // Ensure resume_url exists.
  const urlField = await api(`/fields/${COLLECTION}/resume_url`);
  if (!urlField.ok) {
    console.error(`"resume_url" not found (HTTP ${urlField.status}). Run scripts/add-fellowship-resume-url-field.mjs first.`);
    process.exit(1);
  }

  // 1) Make resume_url read-only.
  const patched = await api(`/fields/${COLLECTION}/resume_url`, {
    method: 'PATCH',
    body: JSON.stringify({ meta: { readonly: true, note: 'Applicant resume (ImageKit signed URL; opens via the "Open Resume" button — link expires).' } }),
  });
  console.log(patched.ok ? '✓ resume_url is now read-only.' : `⚠ Could not set resume_url read-only (HTTP ${patched.status}).`);

  // 2) Add the clickable "Open Resume" link button (alias / presentation field).
  const linkField = await api(`/fields/${COLLECTION}/resume_link`);
  if (linkField.ok) {
    console.log('✓ "resume_link" button already exists — skipping.');
  } else if (linkField.status === 403 || linkField.status === 404) {
    const created = await api(`/fields/${COLLECTION}`, {
      method: 'POST',
      body: JSON.stringify({
        field: 'resume_link',
        type: 'alias',
        meta: {
          interface: 'presentation-links',
          special: ['alias', 'no-data'],
          note: 'Opens the applicant resume in a new tab.',
          width: 'full',
          options: {
            links: [
              { label: 'Open Resume', icon: 'download', type: 'primary', url: '{{resume_url}}' },
            ],
          },
        },
      }),
    });
    if (!created.ok) {
      console.error(`✗ Failed to add "resume_link" button (HTTP ${created.status}):`);
      console.error(JSON.stringify(created.body, null, 2));
      process.exit(1);
    }
    console.log('✓ Added clickable "Open Resume" button (resume_link).');
  } else {
    console.error(`Unexpected response checking resume_link (HTTP ${linkField.status}).`);
    process.exit(1);
  }

  console.log('\nDone. In a fellowship record, "Open Resume" opens the file; the URL field is read-only.');
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
