'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { Loader2, LogIn, LogOut, Save, User, Phone, Mail, Calendar, Clock } from 'lucide-react';
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
  updateVisitNotes,
  fetchPatientHistoryByPhone,
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
  checkOutAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
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

  useEffect(() => {
    if (!open || !appointmentId) {
      setAppointment(null);
      setHousehold([]);
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
        className="w-full sm:max-w-xl overflow-y-auto"
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
              <div className="flex gap-2 pt-2">
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
                  disabled={!appointment.checkInAt || !!appointment.checkOutAt}
                  onClick={handleCheckOut}
                >
                  <LogOut className="w-3.5 h-3.5 mr-1" />
                  Check out
                </Button>
              </div>
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
              <Button onClick={handleSaveNotes} disabled={saving} size="sm">
                {saving ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}
                Save notes
              </Button>
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
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
