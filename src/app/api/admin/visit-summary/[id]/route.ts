import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { fetchVisitSummaryAsset } from '@/lib/directus';

// Medical PDFs — Node runtime (jsonwebtoken + admin token streaming).
export const runtime = 'nodejs';

/**
 * Stream a stored visit-summary PDF for an appointment.
 *
 * The route lives under /api/admin so the middleware already requires the
 * `admin_token` cookie; we additionally verify the JWT here because the payload
 * is a medical record. The raw Directus file id is never exposed — callers
 * reference the appointment id and we resolve the current file server-side.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const JWT_SECRET = process.env.JWT_SECRET;
  const token = request.cookies.get('admin_token')?.value;

  if (!JWT_SECRET || !token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    verify(token, JWT_SECRET);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      select: { visitSummaryFileId: true, patientName: true, date: true },
    });

    if (!appointment?.visitSummaryFileId) {
      return NextResponse.json({ error: 'No PDF found' }, { status: 404 });
    }

    const asset = await fetchVisitSummaryAsset(appointment.visitSummaryFileId);
    if (!asset) {
      // Most commonly a 403 from Directus: the token's role can upload files
      // but lacks READ permission on directus_files. Grant that role read
      // access to Files in Directus for this to work.
      return NextResponse.json(
        { error: 'PDF unavailable — Directus denied access to the stored file.' },
        { status: 502 }
      );
    }

    const buffer = Buffer.from(await asset.arrayBuffer());

    const safeName = (appointment.patientName || 'patient')
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();
    const filename = `visit-summary-${safeName}.pdf`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': asset.headers.get('content-type') || 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    console.error('Error serving visit summary PDF:', error);
    return NextResponse.json({ error: 'Failed to load PDF' }, { status: 500 });
  }
}
