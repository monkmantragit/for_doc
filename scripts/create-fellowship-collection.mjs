/**
 * One-off setup script: create the `fellowship_applications` collection in Directus.
 *
 * The website's fellowship application form (/fellowship-programme) writes
 * submissions into this collection so the admin can review them inside Directus
 * (the team-wide Next.js admin intentionally does NOT show them).
 *
 * This is a SCHEMA CHANGE on the production Directus instance. Review it, then
 * run it once from the project root:
 *
 *     node scripts/create-fellowship-collection.mjs
 *
 * It reads NEXT_PUBLIC_DIRECTUS_URL and DIRECTUS_ADMIN_TOKEN from .env. The
 * script is idempotent: if the collection already exists it exits without
 * changing anything.
 *
 * Privacy note: this collection is left with NO public-role permissions, so the
 * applicant data (email/phone) is only visible to authenticated Directus admins.
 * The website writes to it using the server-only admin token.
 */

import dotenv from 'dotenv';

dotenv.config();

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL;
const ADMIN_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;

const COLLECTION = 'fellowship_applications';

if (!DIRECTUS_URL || !ADMIN_TOKEN) {
  console.error(
    'Missing config. Both NEXT_PUBLIC_DIRECTUS_URL and DIRECTUS_ADMIN_TOKEN must be set (they live in .env).'
  );
  process.exit(1);
}

async function api(path, options = {}) {
  const res = await fetch(`${DIRECTUS_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${ADMIN_TOKEN}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { ok: res.ok, status: res.status, body };
}

// Field definitions. The first entry is the auto-increment integer primary key.
const fields = [
  {
    field: 'id',
    type: 'integer',
    meta: { hidden: true, interface: 'input', readonly: true },
    schema: { is_primary_key: true, has_auto_increment: true },
  },
  {
    field: 'name',
    type: 'string',
    meta: { interface: 'input', required: true, width: 'half', sort: 2 },
    schema: { is_nullable: false },
  },
  {
    field: 'email',
    type: 'string',
    meta: { interface: 'input', options: { iconLeft: 'email' }, required: true, width: 'half', sort: 3 },
    schema: { is_nullable: false },
  },
  {
    field: 'phone',
    type: 'string',
    meta: { interface: 'input', options: { iconLeft: 'phone' }, required: true, width: 'half', sort: 4 },
    schema: { is_nullable: false },
  },
  {
    field: 'qualification',
    type: 'string',
    meta: { interface: 'input', required: true, width: 'half', sort: 5 },
    schema: { is_nullable: false },
  },
  {
    field: 'resume',
    type: 'uuid',
    meta: { interface: 'file', special: ['file'], note: 'Applicant CV/resume (PDF/DOC/DOCX).', width: 'half', sort: 6 },
    schema: {},
  },
  {
    field: 'message',
    type: 'text',
    meta: { interface: 'input-multiline', sort: 7 },
    schema: { is_nullable: true },
  },
  {
    field: 'status',
    type: 'string',
    meta: {
      interface: 'select-dropdown',
      width: 'half',
      sort: 8,
      options: {
        choices: [
          { text: 'Pending', value: 'PENDING' },
          { text: 'Reviewing', value: 'REVIEWING' },
          { text: 'Shortlisted', value: 'SHORTLISTED' },
          { text: 'Accepted', value: 'ACCEPTED' },
          { text: 'Rejected', value: 'REJECTED' },
        ],
      },
      display: 'labels',
    },
    schema: { default_value: 'PENDING', is_nullable: false },
  },
  {
    field: 'date_created',
    type: 'timestamp',
    meta: { special: ['date-created'], interface: 'datetime', readonly: true, width: 'half', sort: 9 },
    schema: {},
  },
  {
    field: 'date_updated',
    type: 'timestamp',
    meta: { special: ['date-updated'], interface: 'datetime', readonly: true, width: 'half', sort: 10, hidden: true },
    schema: {},
  },
];

async function main() {
  console.log(`Directus: ${DIRECTUS_URL}`);
  console.log(`Collection: ${COLLECTION}\n`);

  // Idempotency check.
  const existing = await api(`/collections/${COLLECTION}`);
  if (existing.ok) {
    console.log(`✓ Collection "${COLLECTION}" already exists — nothing to do.`);
    return;
  }
  if (existing.status !== 403 && existing.status !== 404) {
    console.error(`Unexpected response checking collection (HTTP ${existing.status}):`);
    console.error(existing.body);
    process.exit(1);
  }

  const payload = {
    collection: COLLECTION,
    fields,
    schema: {},
    meta: {
      icon: 'school',
      note: 'Fellowship programme applications submitted from the website form (/fellowship-programme).',
      display_template: '{{name}} — {{qualification}} ({{status}})',
      sort_field: 'date_created',
    },
  };

  const created = await api('/collections', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!created.ok) {
    console.error(`✗ Failed to create collection (HTTP ${created.status}):`);
    console.error(JSON.stringify(created.body, null, 2));
    process.exit(1);
  }

  console.log(`✓ Created collection "${COLLECTION}" with fields:`);
  console.log(`  ${fields.map((f) => f.field).join(', ')}`);
  console.log('\nApplications are admin-only (no public-role permissions were granted).');
  console.log('The website writes to this collection using the server-only admin token.');
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
