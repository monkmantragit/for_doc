'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { Loader2, LogIn, LogOut, Save, User, Phone, Mail, Calendar, Clock, Undo2, Stethoscope, Printer, FileText, ExternalLink, CalendarClock, Trash2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  fetchAppointmentDetail,
  recordCheckIn,
  recordCheckOut,
  recordEngage,
  undoCheckIn,
  undoCheckOut,
  undoEngage,
  updateVisitNotes,
  fetchPatientHistoryByPhone,
  generateVisitSummaryPdf,
  fetchAvailableSlots,
  updateAppointment,
  deleteAppointmentAction,
} from '@/app/actions/admin';

interface Props {
  appointmentId: string | null;
  open: boolean;
  onClose: () => void;
  onChanged?: () => void;
}

interface AppointmentDetail {
  id: string;
  patientName: string | null;
  email: string | null;
  phone: string | null;
  date: Date;
  time: string | null;
  status: string;
  notes: string | null;
  visitNotes: string | null;
  diagnosis: string | null;
  checkInAt: Date | null;
  engagedAt: Date | null;
  checkOutAt: Date | null;
  visitSummaryFileId: string | null;
  visitSummaryGeneratedAt: Date | string | null;
  createdAt: Date;
  updatedAt: Date;
  doctorId: string;
  customerId: string | null;
  doctor: { name: string; speciality: string; fee: number };
  patient: { id: string; phone: string; name: string } | null;
}

interface HouseholdPatient {
  id: string;
  name: string;
  appointments: Array<{
    id: string;
    date: Date;
    diagnosis: string | null;
    visitNotes: string | null;
    status: string;
    doctor: { name: string; speciality: string };
  }>;
}

export function AppointmentDetailDrawer({ appointmentId, open, onClose, onChanged }: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null);
  const [household, setHousehold] = useState<HouseholdPatient[]>([]);
  const [visitNotes, setVisitNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfGeneratedAt, setPdfGeneratedAt] = useState<string | null>(null);

  // Reschedule + delete
  const [rescheduleDate, setRescheduleDate] = useState(''); // 'yyyy-MM-dd'
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!open || !appointmentId) {
      setAppointment(null);
      setHousehold([]);
      setConfirmDelete(false);
      setSlots([]);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await fetchAppointmentDetail(appointmentId);
      if (cancelled) return;
      if (res.success && res.data) {
        const apt = res.data as any as AppointmentDetail;
        setAppointment(apt);
        setVisitNotes(apt.visitNotes ?? '');
        setDiagnosis(apt.diagnosis ?? '');
        setRescheduleDate(format(new Date(apt.date), 'yyyy-MM-dd'));
        setRescheduleTime(apt.time ?? '');
        setConfirmDelete(false);
        if (apt.visitSummaryFileId) {
          setPdfUrl(`/api/admin/visit-summary/${apt.id}`);
          setPdfGeneratedAt(
            apt.visitSummaryGeneratedAt ? new Date(apt.visitSummaryGeneratedAt).toISOString() : null
          );
        } else {
          setPdfUrl(null);
          setPdfGeneratedAt(null);
        }

        if (apt.phone) {
          const h = await fetchPatientHistoryByPhone(apt.phone);
          if (!cancelled && h.success && h.data) {
            setHousehold(h.data.patients as any);
          }
        }
      } else {
        toast.error(res.error || 'Failed to load appointment');
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [open, appointmentId]);

  // Load the doctor's vacant slots for the chosen reschedule date.
  // fetchAvailableSlots already excludes booked slots, breaks and time-blocks,
  // and returns [] for closed / unavailable days — so we offer exactly those
  // options and never re-add the appointment's own (booked) time.
  useEffect(() => {
    if (!open || !appointment?.doctorId || !rescheduleDate) {
      setSlots([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingSlots(true);
      const res = await fetchAvailableSlots(appointment.doctorId, new Date(rescheduleDate));
      if (cancelled) return;
      const list = res.success && Array.isArray(res.data) ? res.data : [];
      setSlots(list);
      // Keep the chosen time only if it is genuinely a vacant slot on this date;
      // otherwise clear it so a booked/closed-day time can't be submitted.
      setRescheduleTime((prev) => (prev && list.includes(prev) ? prev : ''));
      setLoadingSlots(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, appointment?.doctorId, rescheduleDate]);

  const refresh = async () => {
    if (!appointmentId) return;
    const res = await fetchAppointmentDetail(appointmentId);
    if (res.success && res.data) {
      setAppointment(res.data as any);
    }
    onChanged?.();
  };

  const handleCheckIn = async () => {
    if (!appointmentId) return;
    const res = await recordCheckIn(appointmentId);
    if (res.success) {
      toast.success('Checked in');
      refresh();
    } else {
      toast.error(res.error || 'Failed');
    }
  };

  const handleCheckOut = async () => {
    if (!appointmentId) return;
    const res = await recordCheckOut(appointmentId);
    if (res.success) {
      toast.success('Checked out');
      refresh();
    } else {
      toast.error(res.error || 'Failed');
    }
  };

  const handleUndoCheckIn = async () => {
    if (!appointmentId) return;
    const res = await undoCheckIn(appointmentId);
    if (res.success) {
      toast.success('Check-in reverted');
      refresh();
    } else {
      toast.error(res.error || 'Failed');
    }
  };

  const handleUndoCheckOut = async () => {
    if (!appointmentId) return;
    const res = await undoCheckOut(appointmentId);
    if (res.success) {
      toast.success('Check-out reverted');
      refresh();
    } else {
      toast.error(res.error || 'Failed');
    }
  };

  const handleEngage = async () => {
    if (!appointmentId) return;
    const res = await recordEngage(appointmentId);
    if (res.success) {
      toast.success('Patient engaged');
      refresh();
    } else {
      toast.error(res.error || 'Failed');
    }
  };

  const handleUndoEngage = async () => {
    if (!appointmentId) return;
    const res = await undoEngage(appointmentId);
    if (res.success) {
      toast.success('Engage reverted');
      refresh();
    } else {
      toast.error(res.error || 'Failed');
    }
  };

  // Opens a print-friendly window using the same stripped, letterhead-friendly
  // layout as the stored PDF: no app header (clinic prints on their own
  // letterhead), patient on a single line, diagnosis + clinical notes only,
  // and a signature/summary area, with blank space top and bottom.
  const openPrintWindow = () => {
    if (!appointment) return;

    const escapeHtml = (s: string | null | undefined) =>
      (s ?? '').replace(/[&<>"']/g, (c) =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!)
      );

    const dateStr = format(new Date(appointment.date), 'MMM d, yyyy');
    const patientBits = [
      appointment.patientName || 'Unknown patient',
      appointment.phone || null,
      appointment.email || null,
      dateStr,
    ]
      .filter(Boolean)
      .map((b) => escapeHtml(b as string));

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Visit Summary - ${escapeHtml(appointment.patientName || '')}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1f2937; line-height: 1.5; margin: 0; }
  .sheet { padding: 150px 56px 120px; max-width: 800px; margin: 0 auto; }
  .patient { font-size: 15px; color: #111827; padding-bottom: 8px; margin-bottom: 18px; border-bottom: 1px solid #d1d5db; }
  .patient .label { font-weight: 700; }
  h2 { color: #6B4A7E; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 4px; }
  .section { margin-bottom: 16px; }
  .body { font-size: 14px; white-space: pre-wrap; }
  .empty { color: #9ca3af; font-style: italic; }
  .sig { margin-top: 56px; display: flex; justify-content: space-between; }
  .sig > div { width: 45%; }
  .sig-line { border-top: 1px solid #1f2937; padding-top: 4px; margin-top: 36px; font-size: 12px; color: #6b7280; }
</style>
</head>
<body>
  <div class="sheet">
    <div class="patient"><span class="label">Patient:&nbsp;</span>${patientBits.join('&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;')}</div>

    <div class="section">
      <h2>Diagnosis</h2>
      <div class="body ${diagnosis ? '' : 'empty'}">${escapeHtml(diagnosis) || 'No diagnosis recorded.'}</div>
    </div>

    <div class="section">
      <h2>Clinical notes</h2>
      <div class="body ${visitNotes ? '' : 'empty'}">${escapeHtml(visitNotes) || 'No clinical notes recorded.'}</div>
    </div>

    <div class="sig">
      <div><div class="sig-line">Dr. ${escapeHtml(appointment.doctor.name)} — signature &amp; summary</div></div>
      <div><div class="sig-line">Date</div></div>
    </div>
  </div>

  <script>
    window.addEventListener('load', () => { setTimeout(() => window.print(), 250); });
  </script>
</body>
</html>`;

    const w = window.open('', '_blank', 'width=900,height=900');
    if (!w) {
      toast.error('Pop-up blocked. Please allow pop-ups for this site.');
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  // Persist the current notes and store a PDF copy in Directus. Kept separate
  // from printing: opening the print window must happen synchronously inside a
  // click handler (see the Print button), otherwise the browser pop-up blocker
  // kills a window.open() that runs after an await.
  const handleSavePdf = async () => {
    if (!appointmentId) return;
    setGeneratingPdf(true);
    try {
      // Persist edits first so the stored PDF matches what's on screen.
      await updateVisitNotes(appointmentId, {
        visitNotes: visitNotes.trim() || null,
        diagnosis: diagnosis.trim() || null,
      });

      const res = await generateVisitSummaryPdf(appointmentId);
      if (res.success && res.data) {
        setPdfUrl(res.data.url);
        setPdfGeneratedAt(res.data.generatedAt);
        toast.success('PDF saved to records');
        onChanged?.();
      } else {
        toast.error(res.error || 'Could not save PDF');
      }
    } catch (e) {
      console.error(e);
      toast.error('Could not save PDF');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!appointmentId) return;
    setSaving(true);
    const res = await updateVisitNotes(appointmentId, {
      visitNotes: visitNotes.trim() || null,
      diagnosis: diagnosis.trim() || null,
    });
    setSaving(false);
    if (res.success) {
      toast.success('Notes saved');
      refresh();
    } else {
      toast.error(res.error || 'Failed to save');
    }
  };

  const handleReschedule = async () => {
    if (!appointment) return;
    if (!rescheduleDate || !rescheduleTime) {
      toast.error('Pick a new date and time.');
      return;
    }
    setRescheduling(true);
    // Keep everything the same except date/time. Re-activate a cancelled/no-show
    // appointment on reschedule (otherwise updateAppointment would clear the time).
    const status =
      appointment.status === 'CANCELLED' || appointment.status === 'NO_SHOW'
        ? 'CONFIRMED'
        : appointment.status;
    const res = await updateAppointment({
      id: appointment.id,
      patientName: appointment.patientName,
      email: appointment.email,
      phone: appointment.phone,
      date: new Date(rescheduleDate),
      time: rescheduleTime,
      status,
      doctorId: appointment.doctorId,
      customerId: appointment.customerId,
    });
    setRescheduling(false);
    if (res.success) {
      toast.success('Appointment rescheduled');
      refresh();
    } else {
      toast.error(res.error || 'Could not reschedule');
    }
  };

  const handleDelete = async () => {
    if (!appointmentId) return;
    setDeleting(true);
    const res = await deleteAppointmentAction(appointmentId);
    setDeleting(false);
    if (res.success) {
      toast.success('Appointment deleted');
      onChanged?.();
      onClose();
    } else {
      toast.error(res.error || 'Could not delete appointment');
    }
  };

  const fmtDateTime = (d: Date | string | null) =>
    d ? format(new Date(d), 'MMM d, yyyy · h:mm a') : '—';

  const fmtDuration = () => {
    if (!appointment?.checkInAt || !appointment?.checkOutAt) return null;
    const ms =
      new Date(appointment.checkOutAt).getTime() -
      new Date(appointment.checkInAt).getTime();
    const mins = Math.round(ms / 60000);
    return mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl overflow-y-auto bg-white"
      >
        <SheetHeader>
          <SheetTitle>Appointment details</SheetTitle>
        </SheetHeader>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-[#8B5C9E]" />
          </div>
        )}

        {!loading && appointment && (
          <div className="mt-6 space-y-6">
            <Card className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-gray-900 font-semibold">
                <User className="w-4 h-4 text-[#8B5C9E]" />
                {appointment.patientName || 'Unknown patient'}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Stethoscope className="w-3.5 h-3.5 text-[#8B5C9E]" />
                Dr. {appointment.doctor?.name || '—'}
                {appointment.doctor?.speciality && (
                  <span className="text-gray-500">· {appointment.doctor.speciality}</span>
                )}
              </div>
              {appointment.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-3.5 h-3.5" />
                  {appointment.phone}
                </div>
              )}
              {appointment.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-3.5 h-3.5" />
                  {appointment.email}
                </div>
              )}
              <div className="text-xs text-gray-500 pt-2">
                Booking notes: {appointment.notes || '—'}
              </div>
            </Card>

            <Card className="p-4 space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">Visit timeline</h3>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                  Scheduled: {format(new Date(appointment.date), 'MMM d, yyyy')} at {appointment.time || '—'}
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <LogIn className="w-3.5 h-3.5 text-green-600" />
                  Check-in: {fmtDateTime(appointment.checkInAt)}
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Stethoscope className="w-3.5 h-3.5 text-amber-600" />
                  Engaged: {fmtDateTime(appointment.engagedAt)}
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <LogOut className="w-3.5 h-3.5 text-blue-600" />
                  Check-out: {fmtDateTime(appointment.checkOutAt)}
                </div>
                {fmtDuration() && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                    Duration: {fmtDuration()}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!!appointment.checkInAt}
                  onClick={handleCheckIn}
                >
                  <LogIn className="w-3.5 h-3.5 mr-1" />
                  Check in
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!appointment.checkInAt || !!appointment.engagedAt || !!appointment.checkOutAt}
                  onClick={handleEngage}
                >
                  <Stethoscope className="w-3.5 h-3.5 mr-1" />
                  Engage
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!appointment.checkInAt || !!appointment.checkOutAt}
                  onClick={handleCheckOut}
                >
                  <LogOut className="w-3.5 h-3.5 mr-1" />
                  Check out
                </Button>
                {appointment.checkInAt && !appointment.engagedAt && !appointment.checkOutAt && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-500 hover:text-gray-700"
                    onClick={handleUndoCheckIn}
                  >
                    <Undo2 className="w-3.5 h-3.5 mr-1" />
                    Undo check-in
                  </Button>
                )}
                {appointment.engagedAt && !appointment.checkOutAt && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-500 hover:text-gray-700"
                    onClick={handleUndoEngage}
                  >
                    <Undo2 className="w-3.5 h-3.5 mr-1" />
                    Undo engage
                  </Button>
                )}
                {appointment.checkOutAt && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-500 hover:text-gray-700"
                    onClick={handleUndoCheckOut}
                  >
                    <Undo2 className="w-3.5 h-3.5 mr-1" />
                    Undo check-out
                  </Button>
                )}
              </div>
            </Card>

            <Card className="p-4 space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <CalendarClock className="w-4 h-4 text-[#8B5C9E]" />
                Reschedule
              </h3>
              <p className="text-xs text-gray-500">
                Currently: {format(new Date(appointment.date), 'MMM d, yyyy')} at {appointment.time || '—'}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">New date</label>
                  <Input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">New time</label>
                  <select
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#8B5C9E] focus:outline-none focus:ring-[#8B5C9E]"
                  >
                    <option value="">{loadingSlots ? 'Loading…' : 'Select time'}</option>
                    {slots.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {!loadingSlots && rescheduleDate && slots.length === 0 && (
                <p className="text-xs text-amber-600">
                  No vacant slots on this date — the doctor isn&apos;t available or the clinic is closed. Please pick another day.
                </p>
              )}
              <Button size="sm" onClick={handleReschedule} disabled={rescheduling || !rescheduleTime}>
                {rescheduling ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                ) : (
                  <CalendarClock className="w-3.5 h-3.5 mr-1" />
                )}
                Reschedule
              </Button>
            </Card>

            <Card className="p-4 space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">Clinical notes</h3>
              <div>
                <label className="text-xs font-medium text-gray-600">Diagnosis</label>
                <Input
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Right knee meniscus tear"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Visit notes</label>
                <textarea
                  value={visitNotes}
                  onChange={(e) => setVisitNotes(e.target.value)}
                  rows={5}
                  placeholder="Treatment given, follow-up plan, prescriptions..."
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#8B5C9E] focus:ring-[#8B5C9E] focus:outline-none"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button onClick={handleSaveNotes} disabled={saving} size="sm">
                  {saving ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}
                  Save notes
                </Button>
                <Button
                  onClick={openPrintWindow}
                  variant="outline"
                  size="sm"
                  title="Open a print-friendly copy (prints on the clinic letterhead)"
                >
                  <Printer className="w-3.5 h-3.5 mr-1" />
                  Print
                </Button>
                <Button
                  onClick={handleSavePdf}
                  variant="outline"
                  size="sm"
                  disabled={generatingPdf}
                  title="Save a PDF copy to the patient's records in Directus"
                >
                  {generatingPdf ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 mr-1" />
                  )}
                  Save PDF
                </Button>
              </div>

              {pdfUrl && (
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#8B5C9E] hover:underline"
                >
                  <FileText className="w-3.5 h-3.5" />
                  View saved PDF
                  <ExternalLink className="w-3 h-3" />
                  {pdfGeneratedAt && (
                    <span className="text-gray-400">
                      · {format(new Date(pdfGeneratedAt), 'MMM d, yyyy · h:mm a')}
                    </span>
                  )}
                </a>
              )}
            </Card>

            {household.length > 0 && (
              <Card className="p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">
                  Records on this phone ({appointment.phone})
                </h3>
                {household.map((p) => (
                  <div key={p.id} className="border-l-2 border-[#8B5C9E]/30 pl-3 space-y-1">
                    <div className="font-medium text-gray-900 text-sm">
                      {p.name}{' '}
                      <span className="text-xs text-gray-500">
                        ({p.appointments.length} visit{p.appointments.length === 1 ? '' : 's'})
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {p.appointments.slice(0, 5).map((a) => (
                        <li
                          key={a.id}
                          className={`text-xs text-gray-600 ${a.id === appointment.id ? 'font-semibold' : ''}`}
                        >
                          <span className="text-gray-500">
                            {format(new Date(a.date), 'MMM d, yyyy')}
                          </span>
                          {' · '}
                          Dr. {a.doctor.name}
                          {' · '}
                          <span className="text-gray-700">{a.status}</span>
                          {a.diagnosis && (
                            <div className="ml-1 text-gray-700">
                              ↳ {a.diagnosis}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </Card>
            )}

            <div className="text-xs text-gray-400 space-y-0.5">
              <div>Created: {fmtDateTime(appointment.createdAt)}</div>
              <div>Last updated: {fmtDateTime(appointment.updatedAt)}</div>
            </div>

            {/* Danger zone: delete */}
            <div className="border-t border-gray-100 pt-4">
              {!confirmDelete ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmDelete(true)}
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Delete appointment
                </Button>
              ) : (
                <div className="flex flex-wrap items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3">
                  <span className="text-sm text-red-700">Delete this appointment permanently?</span>
                  <div className="ml-auto flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)} disabled={deleting}>
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleDelete}
                      disabled={deleting}
                      className="bg-red-600 text-white hover:bg-red-700"
                    >
                      {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Delete'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
