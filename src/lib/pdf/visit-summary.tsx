// Server-only: renders a one-page visit-summary PDF for an appointment.
//
// The layout is intentionally "letterhead friendly": the whole top and bottom
// of the page are left blank so the clinic can print it on their own
// pre-printed letterhead. There is NO app header/branding, no doctor or
// visit-timeline block and no booking concern — just the patient line, the
// clinical content (diagnosis + notes) and a signature area, per the agreed
// print spec.
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from '@react-pdf/renderer';
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

const styles = StyleSheet.create({
  page: {
    // Generous top/bottom padding so the clinic letterhead header and footer
    // have room. Side padding is normal.
    paddingTop: 150,
    paddingBottom: 120,
    paddingHorizontal: 56,
    fontSize: 11,
    color: '#1f2937',
    lineHeight: 1.5,
    fontFamily: 'Helvetica',
  },
  patientLine: {
    fontSize: 12,
    color: '#111827',
    marginBottom: 18,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
  },
  patientLabel: { fontFamily: 'Helvetica-Bold' },
  section: { marginBottom: 16 },
  heading: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: '#6B4A7E',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  body: { fontSize: 11, color: '#1f2937' },
  empty: { fontSize: 11, color: '#9ca3af', fontStyle: 'italic' },
  signatureRow: {
    marginTop: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sigBlock: { width: '45%' },
  sigLine: {
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
    paddingTop: 4,
    marginTop: 36,
    fontSize: 10,
    color: '#6b7280',
  },
});

function VisitSummaryDocument({ data }: { data: VisitSummaryData }) {
  const dateStr = format(new Date(data.date), 'MMM d, yyyy');
  const patientBits = [
    data.patientName || 'Unknown patient',
    data.phone || null,
    data.email || null,
    dateStr,
  ].filter(Boolean);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Patient — single line */}
        <Text style={styles.patientLine}>
          <Text style={styles.patientLabel}>Patient: </Text>
          {patientBits.join('   ·   ')}
        </Text>

        {/* Diagnosis */}
        <View style={styles.section}>
          <Text style={styles.heading}>Diagnosis</Text>
          {data.diagnosis ? (
            <Text style={styles.body}>{data.diagnosis}</Text>
          ) : (
            <Text style={styles.empty}>No diagnosis recorded.</Text>
          )}
        </View>

        {/* Clinical notes */}
        <View style={styles.section}>
          <Text style={styles.heading}>Clinical notes</Text>
          {data.visitNotes ? (
            <Text style={styles.body}>{data.visitNotes}</Text>
          ) : (
            <Text style={styles.empty}>No clinical notes recorded.</Text>
          )}
        </View>

        {/* Doctor signature + summary */}
        <View style={styles.signatureRow}>
          <View style={styles.sigBlock}>
            <Text style={styles.sigLine}>Dr. {data.doctorName} — signature &amp; summary</Text>
          </View>
          <View style={styles.sigBlock}>
            <Text style={styles.sigLine}>Date</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

/** Render the visit-summary PDF to a Node Buffer. */
export async function renderVisitSummaryPdf(data: VisitSummaryData): Promise<Buffer> {
  return renderToBuffer(<VisitSummaryDocument data={data} />);
}
