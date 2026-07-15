/**
 * Migration: add `resume_url` and `resume_file_id` text fields to the existing
 * `fellowship_applications` Directus collection.
 *
 * Resumes are now stored privately on ImageKit (see src/lib/imagekit.ts), not in
 * Directus files. Each application row keeps a signed ImageKit URL (`resume_url`,
 * a convenience link that expires) and the ImageKit file id (`resume_file_id`,
 * used to regenerate signed URLs). The team's durable copy is the email attachment.
 *
 * Run once, against the same Directus instance that holds the collection:
 *
 *     node scripts/add-fellowship-resume-url-field.mjs
 *
 * Reads NEXT_PUBLIC_DIRECTUS_URL and DIRECTUS_ADMIN_TOKEN from .env. Idempotent:
 * fields that already exist are skipped.
 */

import dotenv from 'dotenv';

dotenv.config();

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL;
const ADMIN_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;

const COLLECTION = 'fellowship_applications';

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

// Fields to add (both plain text).
const FIELDS = [
  {
    field: 'resume_url',
    type: 'text',
    meta: {
      interface: 'input',
      note: 'Signed ImageKit URL of the resume (convenience link; expires).',
      width: 'full',
    },
    schema: {},
  },
  {
    field: 'resume_file_id',
    type: 'string',
    meta: {
      interface: 'input',
      note: 'ImageKit file id of the resume (used to regenerate signed URLs).',
      width: 'half',
    },
    schema: {},
  },
];

async function main() {
  console.log(`Directus: ${DIRECTUS_URL}`);
  console.log(`Collection: ${COLLECTION}\n`);

  // Make sure the collection exists.
  const collection = await api(`/collections/${COLLECTION}`);
  if (!collection.ok) {
    console.error(
      `Collection "${COLLECTION}" was not found (HTTP ${collection.status}). ` +
        'Run scripts/create-fellowship-collection.mjs first.',
    );
    process.exit(1);
  }

  for (const def of FIELDS) {
    const existing = await api(`/fields/${COLLECTION}/${def.field}`);
    if (existing.ok) {
      console.log(`✓ Field "${def.field}" already exists — skipping.`);
      continue;
    }
    if (existing.status !== 403 && existing.status !== 404) {
      console.error(`Unexpected response checking field "${def.field}" (HTTP ${existing.status}):`);
      console.error(existing.body);
      process.exit(1);
    }

    const created = await api(`/fields/${COLLECTION}`, {
      method: 'POST',
      body: JSON.stringify(def),
    });
    if (!created.ok) {
      console.error(`✗ Failed to add field "${def.field}" (HTTP ${created.status}):`);
      console.error(JSON.stringify(created.body, null, 2));
      process.exit(1);
    }
    console.log(`✓ Added field "${def.field}".`);
  }

  console.log('\nDone. Fellowship submissions now reference the ImageKit resume via resume_url + resume_file_id.');
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
