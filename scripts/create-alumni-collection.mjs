/**
 * Migration: create the `alumni` collection in Directus (Hall of Fame — Our Alumni).
 *
 * The public page /our-alumni renders published records from this collection.
 * Editors add each alumnus (photo + details) in the Directus portal — there is
 * NO public submission form. See src/lib/directus.ts (getAlumni) and
 * src/app/our-alumni/page.tsx.
 *
 * This is a SCHEMA CHANGE on the production Directus instance. Review it, then
 * run it once from the project root:
 *
 *     node scripts/create-alumni-collection.mjs
 *
 * It reads NEXT_PUBLIC_DIRECTUS_URL and DIRECTUS_ADMIN_TOKEN from .env. The
 * script is idempotent: if the collection already exists it exits without
 * changing anything. After creating the collection it verifies that the token
 * can read it back (the /our-alumni page reads server-side with this token) and
 * prints guidance if it cannot.
 */

import dotenv from 'dotenv';

dotenv.config();

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL;
const ADMIN_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;

const COLLECTION = 'alumni';

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

// Field definitions. The first entry is the auto-increment integer primary key,
// matching the other content collections (gallery, staff_info).
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
    meta: { interface: 'input', required: true, width: 'full', sort: 2, note: 'Full name of the alumnus.' },
    schema: { is_nullable: false },
  },
  {
    field: 'photo',
    type: 'uuid',
    meta: { interface: 'file-image', special: ['file'], note: 'Alumnus photo (portrait works best).', width: 'full', sort: 3 },
    schema: {},
  },
  {
    field: 'batch_year',
    type: 'string',
    meta: { interface: 'input', note: 'Fellowship year or batch, e.g. 2021 or 2020-2021.', width: 'half', sort: 4 },
    schema: { is_nullable: true },
  },
  {
    field: 'qualification',
    type: 'string',
    meta: { interface: 'input', note: 'e.g. MS Ortho, DNB Ortho.', width: 'half', sort: 5 },
    schema: { is_nullable: true },
  },
  {
    field: 'current_position',
    type: 'string',
    meta: { interface: 'input', note: 'Present designation / role.', width: 'half', sort: 6 },
    schema: { is_nullable: true },
  },
  {
    field: 'hospital',
    type: 'string',
    meta: { interface: 'input', note: 'Current hospital or organization.', width: 'half', sort: 7 },
    schema: { is_nullable: true },
  },
  {
    field: 'city',
    type: 'string',
    meta: { interface: 'input', note: 'City / location.', width: 'half', sort: 8 },
    schema: { is_nullable: true },
  },
  {
    field: 'testimonial',
    type: 'text',
    meta: { interface: 'input-multiline', note: 'Optional short note or testimonial.', width: 'full', sort: 9 },
    schema: { is_nullable: true },
  },
  {
    field: 'status',
    type: 'string',
    meta: {
      interface: 'select-dropdown',
      width: 'half',
      sort: 10,
      note: 'Only "published" alumni appear on the public /our-alumni page.',
      options: {
        choices: [
          { text: 'Published', value: 'published' },
          { text: 'Draft', value: 'draft' },
        ],
      },
      display: 'labels',
    },
    // Default to published so a newly added alumnus appears on the page immediately.
    schema: { default_value: 'published', is_nullable: false },
  },
  {
    field: 'sort',
    type: 'integer',
    meta: { interface: 'input', hidden: true, note: 'Manual display order (lower first).', sort: 11 },
    schema: { is_nullable: true },
  },
  {
    field: 'date_created',
    type: 'timestamp',
    meta: { special: ['date-created'], interface: 'datetime', readonly: true, width: 'half', sort: 12, hidden: true },
    schema: {},
  },
  {
    field: 'date_updated',
    type: 'timestamp',
    meta: { special: ['date-updated'], interface: 'datetime', readonly: true, width: 'half', sort: 13, hidden: true },
    schema: {},
  },
];

async function main() {
  console.log(`Directus: ${DIRECTUS_URL}`);
  console.log(`Collection: ${COLLECTION}\n`);

  // Idempotency check. A missing collection returns 403 or 404 in Directus.
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
      icon: 'emoji_events',
      note: 'Hall of Fame — alumni shown on the public /our-alumni page. Set status = Published to make an alumnus visible.',
      display_template: '{{name}} — {{qualification}}',
      sort_field: 'sort',
    },
  };

  const created = await api('/collections', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!created.ok) {
    console.error(`✗ Failed to create collection (HTTP ${created.status}):`);
    console.error(JSON.stringify(created.body, null, 2));
    if (created.status === 403) {
      console.error(
        '\nThe DIRECTUS_ADMIN_TOKEN does not have permission to create collections.' +
          '\nEither use a full-admin token, or create the `alumni` collection manually in' +
          '\nthe Directus portal using the field list documented in this script.'
      );
    }
    process.exit(1);
  }

  console.log(`✓ Created collection "${COLLECTION}" with fields:`);
  console.log(`  ${fields.map((f) => f.field).join(', ')}`);

  // The /our-alumni page reads this collection server-side with the same token,
  // so confirm the token can actually read it back.
  const readback = await api(`/items/${COLLECTION}?limit=1`);
  if (readback.ok) {
    console.log('\n✓ Token can read the collection — the /our-alumni page will work once alumni are added.');
  } else {
    console.warn(
      `\n⚠ Collection created, but reading it with this token returned HTTP ${readback.status}.` +
        `\n  Grant this token's policy Read access to the "${COLLECTION}" collection in` +
        `\n  Directus → Settings → Access Policies, otherwise the /our-alumni page will show empty.`
    );
  }

  console.log('\nAdd alumni in Directus → Content → Alumni. Set status = Published to show them.');
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
