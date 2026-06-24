'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { type DateClickArg } from '@fullcalendar/interaction';
import type { EventClickArg, EventInput } from '@fullcalendar/core';
import { format } from 'date-fns';

interface Appointment {
  id: string;
  patientName: string | null;
  date: Date | string;
  time: string | null;
  status: string;
  doctorId: string;
  customerId: string | null;
  doctor: {
    name: string;
    speciality: string;
  };
}

interface AppointmentsCalendarProps {
  appointments: Appointment[];
  /** Open an existing appointment (e.g. the edit modal). */
  onAppointmentClick: (appointment: Appointment) => void;
  /** Click an empty time slot to add an appointment (date + "HH:mm"). */
  onSlotClick: (date: Date, time: string) => void;
}

const BRAND_PURPLE = '#8B5C9E';

// Status → event colours, mirroring the list/badge styling.
function statusColors(status: string): { bg: string; border: string; text: string } {
  switch ((status || '').toUpperCase()) {
    case 'CANCELLED':
      return { bg: '#f3f4f6', border: '#e5e7eb', text: '#9ca3af' };
    case 'NO_SHOW':
      return { bg: '#f3f4f6', border: '#e5e7eb', text: '#374151' };
    case 'IN_CONSULTATION':
      return { bg: '#fef3c7', border: '#fde68a', text: '#92400e' };
    case 'COMPLETED':
      return { bg: BRAND_PURPLE, border: BRAND_PURPLE, text: '#ffffff' };
    case 'CONFIRMED':
      return { bg: BRAND_PURPLE, border: '#7c4d8f', text: '#ffffff' };
    default: // SCHEDULED + anything else
      return { bg: '#F3E8FF', border: '#E9D5FF', text: '#4B006E' };
  }
}

// Combine the appointment's calendar date with its "HH:mm" time string into a
// real start Date so it lands at the right hour in the week/day time grid.
function toStartDate(appt: Appointment): Date {
  const d = new Date(appt.date);
  if (appt.time && /^\d{1,2}:\d{2}/.test(appt.time)) {
    const [h, m] = appt.time.split(':').map(Number);
    if (!Number.isNaN(h)) d.setHours(h, Number.isNaN(m) ? 0 : m, 0, 0);
  }
  return d;
}

const AppointmentsCalendar = ({
  appointments,
  onAppointmentClick,
  onSlotClick,
}: AppointmentsCalendarProps) => {
  const calendarRef = useRef<FullCalendar | null>(null);
  // Render FullCalendar only after mount to avoid SSR/hydration issues.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const events: EventInput[] = useMemo(
    () =>
      appointments.map((appt) => {
        const start = toStartDate(appt);
        const end = new Date(start.getTime() + 30 * 60 * 1000); // default 30 min block
        const c = statusColors(appt.status);
        return {
          id: appt.id,
          title: appt.patientName || 'Appointment',
          start,
          end,
          backgroundColor: c.bg,
          borderColor: c.border,
          textColor: c.text,
          extendedProps: { appointment: appt },
        };
      }),
    [appointments]
  );

  const handleEventClick = (arg: EventClickArg) => {
    const appt = arg.event.extendedProps.appointment as Appointment | undefined;
    if (appt) onAppointmentClick(appt);
  };

  const handleDateClick = (arg: DateClickArg) => {
    const api = calendarRef.current?.getApi();
    // In the month grid, clicking a day drills into that day's time view —
    // just like Google Calendar.
    if (api && arg.view.type === 'dayGridMonth') {
      api.changeView('timeGridDay', arg.date);
      return;
    }
    // In week/day views, clicking an empty slot starts a new appointment.
    onSlotClick(arg.date, format(arg.date, 'HH:mm'));
  };

  if (!mounted) {
    return <div style={{ height: 760 }} aria-hidden="true" />;
  }

  return (
    <div className="admin-fullcalendar bg-white rounded-xl border border-gray-200 p-3 sm:p-4 shadow-sm">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        buttonText={{ today: 'Today', month: 'Month', week: 'Week', day: 'Day' }}
        height={760}
        expandRows
        nowIndicator
        allDaySlot={false}
        slotMinTime="07:00:00"
        slotMaxTime="21:00:00"
        slotDuration="00:30:00"
        scrollTime="08:00:00"
        dayMaxEvents={3}
        weekends
        events={events}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        eventTimeFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short' }}
      />
    </div>
  );
};

export default AppointmentsCalendar;
