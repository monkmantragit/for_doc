/**
 * Diagnostic: reproduce exactly what the Fellowship form does when a user
 * submits, and report the precise point of failure.
 *
 * Run this from an environment that can reach Directus (your laptop, or the
 * Railway shell — NOT a sandbox with blocked DNS):
 *
 *     node scripts/diagnose-fellowship-submit.mjs
 *
 * It reads NEXT_PUBLIC_DIRECTUS_URL and DIRECTUS_ADMIN_TOKEN from .env and:
 *   1. confirms the admin token is set and can reach Directus,
 *   2. checks the `fellowship_applications` collection exists,
 *   3. checks the `resume` file field exists on it,   <-- common cause
 *   4. uploads a throwaway file (as uploadFellowshipResume does),
 *   5. creates a throwaway application row (as createFellowshipApplicationItem does),
 *   6. deletes both so nothing is left in production.
 *
 * Whichever step prints ✗ is the reason users see "Failed to submit
 * application." No email is sent (this talks to Directus directly, not the
 * Next server action).
 */

import dotenv from 'dotenv';
dotenv.config();

const URL = process.env.NEXT_PUBLIC_DIRECTUS_URL;
const TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;
const COLLECTION = 'fellowship_applications';

if (!URL) {
  console.error('✗ NEXT_PUBLIC_DIRECTUS_URL is not set in .env — the app cannot reach Directus at all.');
  process.exit(1);
}
if (!TOKEN) {
  console.error('✗ DIRECTUS_ADMIN_TOKEN is not set in .env.');
  console.error('  Every submission fails with "DIRECTUS_ADMIN_TOKEN is required..." if this is missing in the deployed env.');
  process.exit(1);
}

async function req(path, options = {}) {
  let res;
  try {
    res = await fetch(`${URL}${path}`, {
      ...options,
      headers: { Authorization: `Bearer ${TOKEN}`, ...(options.headers || {}) },
    });
  } catch (e) {
    // Network/DNS failure — report cleanly instead of crashing.
    return { ok: false, status: 0, body: { errors: [{ message: `Network error: ${e.message} (${e.cause?.code ?? 'no code'})` }] } };
  }
  const t = await res.text();
  let b; try { b = t ? JSON.parse(t) : null; } catch { b = t; }
  return { ok: res.ok, status: res.status, body: b };
}
const errText = (r) => JSON.stringify(r.body?.errors ?? r.body ?? '').slice(0, 600);

console.log(`Directus: ${URL}`);
console.log(`Window override (FELLOWSHIP_WINDOW_OVERRIDE): ${process.env.FELLOWSHIP_WINDOW_OVERRIDE ?? '(unset — date-based)'}\n`);

// 1. Reachability + token
const info = await req('/server/info');
if (!info.ok) {
  console.error(`✗ Cannot reach Directus / token rejected (HTTP ${info.status}): ${errText(info)}`);
  process.exit(1);
}
console.log(`✓ Reached Directus (version ${info.body?.data?.version ?? '?'}) with the admin token.`);

// 2. Collection exists
const coll = await req(`/collections/${COLLECTION}`);
if (!coll.ok) {
  console.error(`✗ Collection "${COLLECTION}" not accessible (HTTP ${coll.status}). Run scripts/create-fellowship-collection.mjs.`);
  process.exit(1);
}
console.log(`✓ Collection "${COLLECTION}" exists.`);

// 3. resume field exists  (THE prime suspect for resume-related errors)
const field = await req(`/fields/${COLLECTION}/resume`);
if (field.ok) {
  console.log('✓ "resume" file field exists on the collection.');
} else {
  console.error(`✗ "resume" field is MISSING (HTTP ${field.status}).`);
  console.error('  → Any submission that attaches a resume fails when saving the record.');
  console.error('  → Fix: run  node scripts/add-fellowship-resume-field.mjs');
}

// 4. File upload (uploadFellowshipResume)
let fileId = null;
try {
  const fd = new FormData();
  fd.append('title', 'DIAG - delete me');
  fd.append('file', new Blob([new TextEncoder().encode('%PDF-1.4 diag')], { type: 'application/pdf' }), 'diag.pdf');
  const res = await fetch(`${URL}/files`, { method: 'POST', headers: { Authorization: `Bearer ${TOKEN}` }, body: fd });
  const t = await res.text(); let b; try { b = JSON.parse(t); } catch { b = t; }
  if (res.ok) { fileId = b?.data?.id; console.log(`✓ File upload works (test file ${fileId}).`); }
  else { console.error(`✗ File upload FAILED (HTTP ${res.status}): ${JSON.stringify(b?.errors ?? b).slice(0, 600)}`); }
} catch (e) {
  console.error(`✗ File upload THREW: ${e.message} (${e.cause?.code ?? ''})`);
}

// 5. Create application row (createFellowshipApplicationItem)
let itemId = null;
{
  const payload = {
    name: 'DIAG TEST', email: 'diag@example.com', phone: '0000000000',
    qualification: 'MS Ortho', message: 'diag - delete me', status: 'PENDING',
    ...(fileId ? { resume: fileId } : {}),
  };
  const r = await req(`/items/${COLLECTION}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  });
  if (r.ok) { itemId = r.body?.data?.id; console.log(`✓ Application record create works (test row ${itemId}).`); }
  else { console.error(`✗ Record create FAILED (HTTP ${r.status}): ${errText(r)}`); }
}

// 6. Cleanup
if (itemId != null) {
  const d = await req(`/items/${COLLECTION}/${itemId}`, { method: 'DELETE' });
  console.log(`  cleanup: deleted test row ${itemId} — ${d.ok ? 'ok' : 'HTTP ' + d.status}`);
}
if (fileId) {
  const d = await req(`/files/${fileId}`, { method: 'DELETE' });
  console.log(`  cleanup: deleted test file ${fileId} — ${d.ok ? 'ok' : 'HTTP ' + d.status}`);
}

console.log('\nDiagnosis: the first ✗ above is why users get errors. If everything is ✓ here but users');
console.log('still fail, the difference is the deployed environment — check that Railway has the same');
console.log('DIRECTUS_ADMIN_TOKEN and FELLOWSHIP_WINDOW_OVERRIDE, and read the Railway logs for the line');
console.log('logged by console.error(\'Error creating fellowship application:\', ...).');
