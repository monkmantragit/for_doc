/**
 * One-off setup script: add a `resume` file field to the existing
 * `fellowship_applications` Directus collection.
 *
 * Run this ONCE after deploying the resume-upload feature, against the same
 * production Directus instance that holds the collection:
 *
 *     node scripts/add-fellowship-resume-field.mjs
 *
 * It reads NEXT_PUBLIC_DIRECTUS_URL and DIRECTUS_ADMIN_TOKEN from .env and is
 * idempotent: if the `resume` field already exists it exits without changes.
 *
 * (Fresh installs created by scripts/create-fellowship-collection.mjs already
 * include this field — this script is only for the already-created collection.)
 */

import dotenv from 'dotenv';

dotenv.config();

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL;
const ADMIN_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;

const COLLECTION = 'fellowship_applications';
const FIELD = 'resume';

if (!DIRECTUS_URL || !ADMIN_TOKEN) {
  console.error(
    'Missing config. Both NEXT_PUBLIC_DIRECTUS_URL and DIRECTUS_ADMIN_TOKEN must be set (they live in .env).',
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

async function main() {
  console.log(`Directus: ${DIRECTUS_URL}`);
  console.log(`Adding field "${FIELD}" to collection "${COLLECTION}"\n`);

  // Make sure the collection exists.
  const collection = await api(`/collections/${COLLECTION}`);
  if (!collection.ok) {
    console.error(
      `Collection "${COLLECTION}" was not found (HTTP ${collection.status}). ` +
        'Run scripts/create-fellowship-collection.mjs first.',
    );
    process.exit(1);
  }

  // Idempotency check.
  const existing = await api(`/fields/${COLLECTION}/${FIELD}`);
  if (existing.ok) {
    console.log(`✓ Field "${FIELD}" already exists — nothing to do.`);
    return;
  }
  if (existing.status !== 403 && existing.status !== 404) {
    console.error(`Unexpected response checking field (HTTP ${existing.status}):`);
    console.error(existing.body);
    process.exit(1);
  }

  const payload = {
    field: FIELD,
    type: 'uuid',
    meta: {
      interface: 'file',
      special: ['file'],
      note: 'Applicant CV/resume (PDF/DOC/DOCX).',
      width: 'half',
    },
    schema: {},
  };

  const created = await api(`/fields/${COLLECTION}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!created.ok) {
    console.error(`✗ Failed to add field (HTTP ${created.status}):`);
    console.error(JSON.stringify(created.body, null, 2));
    process.exit(1);
  }

  console.log(`✓ Added file field "${FIELD}" to "${COLLECTION}".`);
  console.log('Resumes upload into Directus files and are linked on each application record.');
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
