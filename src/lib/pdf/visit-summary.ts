// Server-only: renders a one-page visit-summary PDF for an appointment.
//
// The layout is intentionally "letterhead friendly": the whole top and bottom
// of the page are left blank so the clinic can print it on their own
// pre-printed letterhead. There is NO app header/branding, no doctor or
// visit-timeline block and no booking concern — just the patient line, the
// clinical content (diagnosis + notes) and a signature area, per the agreed
// print spec.
//
// Uses pdf-lib (pure JS, no native deps, no top-level await) so it bundles
// cleanly in the Next.js server build.
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import { format } from 'date-fns';

export interface VisitSummaryData {
  patientName: string | null;
  phone: string | null;
  email: string | null;
  date: Date | string;
  diagnosis: string | null;
  visitNotes: string | null;
  doctorName: string;
}

// A4 in points.
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_X = 56;
const TOP_BLANK = 150; // room for the clinic letterhead header
const BOTTOM_BLANK = 120; // room for the letterhead footer

const INK = rgb(0.12, 0.16, 0.22);
const HEADING = rgb(0.42, 0.29, 0.49);
const MUTED = rgb(0.61, 0.64, 0.69);
const RULE = rgb(0.82, 0.84, 0.86);

// pdf-lib's standard fonts use WinAnsi encoding, which cannot encode characters
// outside Latin-1. Map the common "smart" punctuation that creeps into typed
// notes and replace anything else unsupported so saving never throws.
function toWinAnsi(s: string | null | undefined): string {
  if (!s) return '';
  return s
    .replace(/[‘’‚‛]/g, "'")
    .replace(/[“”„]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/•/g, '·')
    .replace(/[^\x00-\xFF]/g, '?');
}

export async function renderVisitSummaryPdf(data: VisitSummaryData): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const oblique = await pdf.embedFont(StandardFonts.HelveticaOblique);

  const maxWidth = PAGE_WIDTH - MARGIN_X * 2;

  let page: PDFPage = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - TOP_BLANK;

  const newPage = () => {
    page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - 80;
  };
  const ensure = (needed: number) => {
    if (y - needed < BOTTOM_BLANK) newPage();
  };

  // Draw word-wrapped text, honouring explicit newlines. Advances `y`.
  const drawWrapped = (text: string, f: PDFFont, size: number, color = INK, lineHeight = 15) => {
    for (const para of text.split(/\r?\n/)) {
      if (para.trim() === '') {
        y -= lineHeight;
        continue;
      }
      let line = '';
      for (const word of para.split(/\s+/)) {
        const test = line ? `${line} ${word}` : word;
        if (line && f.widthOfTextAtSize(test, size) > maxWidth) {
          ensure(lineHeight);
          page.drawText(line, { x: MARGIN_X, y, size, font: f, color });
          y -= lineHeight;
          line = word;
        } else {
          line = test;
        }
      }
      if (line) {
        ensure(lineHeight);
        page.drawText(line, { x: MARGIN_X, y, size, font: f, color });
        y -= lineHeight;
      }
    }
  };

  // ---- Patient (single line) ----
  const dateStr = format(new Date(data.date), 'MMM d, yyyy');
  const bits = [data.patientName || 'Unknown patient', data.phone, data.email, dateStr]
    .filter(Boolean)
    .map((b) => toWinAnsi(b as string));
  const label = 'Patient: ';
  page.drawText(label, { x: MARGIN_X, y, size: 12, font: bold, color: INK });
  page.drawText(bits.join('   ·   '), {
    x: MARGIN_X + bold.widthOfTextAtSize(label, 12),
    y,
    size: 12,
    font,
    color: INK,
  });
  y -= 14;
  page.drawLine({
    start: { x: MARGIN_X, y },
    end: { x: PAGE_WIDTH - MARGIN_X, y },
    thickness: 1,
    color: RULE,
  });
  y -= 28;

  // ---- Sections ----
  const section = (title: string, body: string | null) => {
    ensure(16);
    page.drawText(title.toUpperCase(), { x: MARGIN_X, y, size: 10, font: bold, color: HEADING });
    y -= 16;
    const clean = toWinAnsi(body);
    if (clean.trim()) {
      drawWrapped(clean, font, 11);
    } else {
      ensure(15);
      page.drawText(`No ${title.toLowerCase()} recorded.`, {
        x: MARGIN_X,
        y,
        size: 11,
        font: oblique,
        color: MUTED,
      });
      y -= 15;
    }
    y -= 16;
  };

  section('Diagnosis', data.diagnosis);
  section('Clinical notes', data.visitNotes);

  // ---- Doctor signature + summary (anchored near the bottom of the last page) ----
  const sigY = BOTTOM_BLANK + 24;
  const colW = (PAGE_WIDTH - MARGIN_X * 2) / 2 - 16;
  const rightX = PAGE_WIDTH / 2 + 16;
  page.drawLine({ start: { x: MARGIN_X, y: sigY }, end: { x: MARGIN_X + colW, y: sigY }, thickness: 1, color: INK });
  page.drawText(toWinAnsi(`Dr. ${data.doctorName} - signature & summary`), {
    x: MARGIN_X,
    y: sigY - 12,
    size: 10,
    font,
    color: MUTED,
  });
  page.drawLine({ start: { x: rightX, y: sigY }, end: { x: rightX + colW, y: sigY }, thickness: 1, color: INK });
  page.drawText('Date', { x: rightX, y: sigY - 12, size: 10, font, color: MUTED });

  const bytes = await pdf.save();
  return Buffer.from(bytes);
}
