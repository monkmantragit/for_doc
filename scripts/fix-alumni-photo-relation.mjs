/**
 * Migration/fix: wire up the `alumni.photo` field so it works like the
 * `staff_info` image — i.e. lets editors SELECT an image from Directus uploads.
 *
 * The `alumni` collection was created via the raw Directus API, and its `photo`
 * field was left WITHOUT the M2O relation to `directus_files` (confirmed: the
 * field exists but has no relation, whereas staff_info.featured_image_url does).
 * Without that relation the file field can't link to uploads, so alumni photos
 * don't work / don't render.
 *
 * This script (idempotent):
 *   1. Creates the relation  alumni.photo -> directus_files.
 *   2. Switches the field to the "select from Directus uploads" dropdown
 *      interface (select-dropdown-m2o), mirroring staff_info.
 *
 * Run once, against the same Directus instance that holds the collection:
 *
 *     node scripts/fix-alumni-photo-relation.mjs
 *
 * Reads NEXT_PUBLIC_DIRECTUS_URL and DIRECTUS_ADMIN_TOKEN from .env.
 */

import dotenv from 'dotenv';

dotenv.config();

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL;
const ADMIN_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;

const COLLECTION = 'alumni';
const FIELD = 'photo';

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
  console.log(`Fixing ${COLLECTION}.${FIELD} -> directus_files relation\n`);

  // Ensure the field exists.
  const field = await api(`/fields/${COLLECTION}/${FIELD}`);
  if (!field.ok) {
    console.error(`Field "${COLLECTION}.${FIELD}" not found (HTTP ${field.status}). Nothing to fix.`);
    process.exit(1);
  }

  // 1) Create the M2O relation to directus_files if it does not already exist.
  const relations = await api(`/relations/${COLLECTION}`);
  const already = Array.isArray(relations.body?.data)
    && relations.body.data.some((r) => r.field === FIELD && r.related_collection === 'directus_files');

  if (already) {
    console.log('✓ Relation alumni.photo -> directus_files already exists — skipping.');
  } else {
    const created = await api('/relations', {
      method: 'POST',
      body: JSON.stringify({
        collection: COLLECTION,
        field: FIELD,
        related_collection: 'directus_files',
        meta: { sort_field: null },
        schema: { on_delete: 'SET NULL' },
      }),
    });
    if (!created.ok) {
      console.error(`✗ Failed to create the relation (HTTP ${created.status}):`);
      console.error(JSON.stringify(created.body, null, 2));
      process.exit(1);
    }
    console.log('✓ Created relation alumni.photo -> directus_files.');
  }

  // 2) Mirror staff_info's "select from uploads" dropdown interface. Best-effort:
  // the relation above is what actually makes the field work; this is UX polish.
  const patched = await api(`/fields/${COLLECTION}/${FIELD}`, {
    method: 'PATCH',
    body: JSON.stringify({
      meta: {
        interface: 'select-dropdown-m2o',
        special: null,
        options: { template: '{{ title }}' },
      },
    }),
  });
  if (patched.ok) {
    console.log('✓ Field interface set to "select from Directus uploads" (select-dropdown-m2o).');
  } else {
    console.warn(`⚠ Could not update the field interface (HTTP ${patched.status}). The relation is in place, so the field still works.`);
  }

  console.log('\nDone. In Directus → Content → Alumni you can now pick a photo from uploads, and it will render on /our-alumni.');
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
