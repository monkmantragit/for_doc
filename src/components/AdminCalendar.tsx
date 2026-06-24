import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
} from 'date-fns';

// Appointment type (should match your backend model)
interface Appointment {
  id: string;
  patientName: string | null;
  date: Date;
  time: string | null;
  status: string;
  doctorId: string;
  customerId: string | null;
  doctor: {
    name: string;
    speciality: string;
  };
}

type CalendarView = 'day' | 'week' | 'month';

interface AdminCalendarProps {
  appointments: Appointment[];
  onDayClick?: (date: Date) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  maxVisibleAppointments?: number;
  /**
   * When true, shows a Day / Week / Month switcher (with prev/next/today) and
   * renders the matching view inline — keeping the original month-grid styling.
   * When false/omitted the component behaves exactly as before (desktop month
   * grid + mobile week list) so existing callers are unaffected.
   */
  enableViewSwitcher?: boolean;
  /** Add an appointment from the Day view (date + "HH:mm"). */
  onAddSlotClick?: (date: Date, time: string) => void;
}

const DEFAULT_MAX_VISIBLE = 4;
const BRAND_PURPLE = '#8B5C9E';

// Minutes-from-midnight for an "HH:mm" string, for chronological sorting.
const parseTime = (t: string | null): number => {
  if (!t || !/^\d{1,2}:\d{2}/.test(t)) return Number.MAX_SAFE_INTEGER;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (Number.isNaN(m) ? 0 : m);
};

const AdminCalendar = ({
  appointments,
  onDayClick,
  onAppointmentClick,
  maxVisibleAppointments = DEFAULT_MAX_VISIBLE,
  enableViewSwitcher = false,
  onAddSlotClick,
}: AdminCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [mobileWeekStart, setMobileWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));

  // Switcher state (only used when enableViewSwitcher).
  const [view, setView] = useState<CalendarView>('month');
  const [refDate, setRefDate] = useState<Date>(new Date());

  const getAppointmentsForDay = (date: Date): Appointment[] =>
    appointments
      .filter((a) => isSameDay(new Date(a.date), date))
      .sort((a, b) => parseTime(a.time) - parseTime(b.time));

  // Shared appointment "chip" used across all views.
  const renderChip = (appointment: Appointment, size: 'sm' | 'md' = 'sm') => (
    <button
      key={appointment.id}
      className={`w-full text-left truncate rounded shadow-sm border ${size === 'md' ? 'text-sm px-2 py-1.5' : 'text-xs px-1 py-0.5'} mb-0.5 ${
        appointment.status === 'CANCELLED'
          ? 'bg-gray-100 border-gray-200 text-gray-500 opacity-75 hover:bg-gray-200'
          : 'bg-[#F3E8FF] border-[#E9D5FF] hover:bg-[#E9D5FF]'
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onAppointmentClick(appointment);
      }}
      title={appointment.patientName || 'Appointment'}
      style={{ color: appointment.status === 'CANCELLED' ? '#6B7280' : '#4B006E' }}
    >
      {appointment.time && <span className="font-medium mr-1 text-[#8B5C9E]">{appointment.time}</span>}
      <span className="font-medium">{appointment.patientName || 'Appointment'}</span>
    </button>
  );

  // A single day's card (used by Week and Day views).
  const renderDayCard = (day: Date, variant: 'week' | 'day') => {
    const dayAppointments = getAppointmentsForDay(day);
    const visible = variant === 'day' ? dayAppointments : dayAppointments.slice(0, maxVisibleAppointments);
    const hidden = dayAppointments.length - visible.length;
    const isToday = isSameDay(day, new Date());

    return (
      <div
        key={day.toString()}
        className={`rounded-lg shadow-sm bg-white p-3 flex flex-col border ${isToday ? 'border-[#8B5C9E] ring-1 ring-[#8B5C9E]' : 'border-gray-100'} ${variant === 'week' ? 'min-h-[140px]' : ''}`}
      >
        <div className="flex items-center justify-between mb-2">
          <button
            className="flex items-center gap-2 text-left"
            onClick={() => {
              setView('day');
              setRefDate(day);
            }}
            title="Open day"
          >
            <span className={`text-sm font-semibold ${isToday ? 'text-[#8B5C9E]' : 'text-gray-900'}`}>
              {format(day, variant === 'day' ? 'EEEE, MMM d' : 'EEE, MMM d')}
            </span>
            {isToday && <span className="text-[10px] bg-[#8B5C9E] text-white rounded px-1.5 py-0.5">Today</span>}
          </button>
          {variant === 'day' && onAddSlotClick && (
            <button
              className="inline-flex items-center gap-1 text-xs text-[#8B5C9E] hover:bg-[#F3E8FF] rounded px-2 py-1"
              onClick={() => onAddSlotClick(day, '09:00')}
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          )}
        </div>
        <div className="flex flex-col gap-1">
          {visible.length === 0 && <span className="text-xs text-gray-400">No appointments</span>}
          {visible.map((a) => renderChip(a, variant === 'day' ? 'md' : 'sm'))}
          {hidden > 0 && (
            <button
              className="text-xs text-[#8B5C9E] mt-1 underline hover:text-[#6D28D9] font-semibold text-left"
              onClick={() => {
                setView('day');
                setRefDate(day);
              }}
            >
              +{hidden} more
            </button>
          )}
        </div>
      </div>
    );
  };

  // The month grid (shared by the legacy desktop view and the switcher's Month).
  const renderMonthGrid = (monthDate: Date, onCellClick: (date: Date) => void) => {
    const gridStart = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 0 });
    const cells = eachDayOfInterval({ start: gridStart, end: addDays(gridStart, 41) });
    return (
      <>
        <div className="grid grid-cols-7 gap-1 mt-6">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="text-center text-sm font-medium text-gray-500">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 mt-2">
          {cells.map((dateCell) => {
            const inMonth = isSameMonth(dateCell, monthDate);
            const dayAppointments = inMonth ? getAppointmentsForDay(dateCell) : [];
            const visible = dayAppointments.slice(0, maxVisibleAppointments);
            const hidden = dayAppointments.length - visible.length;
            const isToday = isSameDay(dateCell, new Date());
            return (
              <div
                key={dateCell.toString()}
                className={`relative p-2 w-full aspect-square flex flex-col items-start justify-start rounded-lg transition-colors ${inMonth ? 'hover:bg-gray-100 cursor-pointer' : 'text-gray-400 bg-gray-50/50'} ${isToday && inMonth ? 'ring-2 ring-[#8B5C9E]' : ''}`}
                onClick={() => inMonth && onCellClick(dateCell)}
              >
                <time
                  dateTime={format(dateCell, 'yyyy-MM-dd')}
                  className={`text-xs font-semibold mb-1 ${isToday && inMonth ? 'text-[#8B5C9E]' : ''} ${!inMonth ? 'text-gray-400' : ''}`}
                >
                  {format(dateCell, 'd')}
                </time>
                {inMonth && (
                  <div className="flex flex-col gap-0.5 w-full">
                    {visible.map((a) => renderChip(a, 'sm'))}
                    {hidden > 0 && (
                      <button
                        className="text-xs text-[#8B5C9E] mt-1 underline hover:text-[#6D28D9] font-semibold"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCellClick(dateCell);
                        }}
                      >
                        +{hidden} more
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </>
    );
  };

  // ===== Switcher (Day / Week / Month) =====
  if (enableViewSwitcher) {
    const goPrev = () =>
      setRefDate((d) => (view === 'month' ? subMonths(d, 1) : view === 'week' ? subWeeks(d, 1) : subDays(d, 1)));
    const goNext = () =>
      setRefDate((d) => (view === 'month' ? addMonths(d, 1) : view === 'week' ? addWeeks(d, 1) : addDays(d, 1)));
    const goToday = () => setRefDate(new Date());

    const weekStart = startOfWeek(refDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(refDate, { weekStartsOn: 0 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const rangeLabel =
      view === 'month'
        ? format(refDate, 'MMMM yyyy')
        : view === 'week'
        ? `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d, yyyy')}`
        : format(refDate, 'EEEE, MMM d, yyyy');

    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm p-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <button onClick={goPrev} className="p-2 hover:bg-gray-100 rounded-lg" aria-label="Previous">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={goToday}
              className="px-3 py-1.5 text-sm font-medium rounded-full border border-gray-200 text-[#8B5C9E] hover:bg-[#F3E8FF]"
            >
              Today
            </button>
            <button onClick={goNext} className="p-2 hover:bg-gray-100 rounded-lg" aria-label="Next">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 ml-1">{rangeLabel}</h2>
          </div>

          <div className="bg-gray-100 rounded-full p-1 flex w-full sm:w-auto">
            {(['day', 'week', 'month'] as CalendarView[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                aria-pressed={view === v}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${view === v ? 'bg-[#8B5C9E] text-white shadow' : 'text-[#8B5C9E] hover:bg-[#F3E8FF]'}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {view === 'month' && renderMonthGrid(refDate, (date) => {
          setView('day');
          setRefDate(date);
        })}

        {view === 'week' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2 mt-4">
            {weekDays.map((day) => renderDayCard(day, 'week'))}
          </div>
        )}

        {view === 'day' && <div className="mt-4 max-w-2xl">{renderDayCard(refDate, 'day')}</div>}
      </div>
    );
  }

  // ===== Legacy behaviour (desktop month grid + mobile week list) =====
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextWeek = () => setMobileWeekStart(addWeeks(mobileWeekStart, 1));
  const previousWeek = () => setMobileWeekStart(subWeeks(mobileWeekStart, 1));

  const mobileWeekEnd = addDays(mobileWeekStart, 6);
  const mobileWeekDays = eachDayOfInterval({ start: mobileWeekStart, end: mobileWeekEnd });
  const handleDay = (date: Date) => onDayClick?.(date);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Desktop: Month Grid */}
      <div className="hidden sm:block p-4">
        <div className="flex items-center justify-between mb-2">
          <button onClick={previousMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">{format(currentMonth, 'MMMM yyyy')}</h2>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        {renderMonthGrid(currentMonth, handleDay)}
      </div>

      {/* Mobile: Week List */}
      <div className="block sm:hidden p-2">
        <div className="flex items-center justify-between mb-2">
          <button onClick={previousWeek} className="p-2 rounded-full bg-[#F3E8FF] text-[#8B5C9E] hover:bg-[#E9D5FF]">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-base font-semibold text-[#8B5C9E]">
            {format(mobileWeekStart, 'MMM d')} - {format(mobileWeekEnd, 'MMM d, yyyy')}
          </h2>
          <button onClick={nextWeek} className="p-2 rounded-full bg-[#F3E8FF] text-[#8B5C9E] hover:bg-[#E9D5FF]">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {mobileWeekDays.map((day) => {
            const dayAppointments = getAppointmentsForDay(day);
            const visible = dayAppointments.slice(0, maxVisibleAppointments);
            const hidden = dayAppointments.length - visible.length;
            return (
              <div
                key={day.toString()}
                className={`rounded-lg shadow-sm bg-white p-3 flex flex-col border border-gray-100 ${isSameDay(day, new Date()) ? 'ring-2 ring-[#8B5C9E]' : ''}`}
                onClick={() => handleDay(day)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-sm font-semibold ${isSameDay(day, new Date()) ? 'text-[#8B5C9E]' : 'text-gray-900'}`}>
                    {format(day, 'EEE, MMM d')}
                  </span>
                  {isSameDay(day, new Date()) && (
                    <span className="text-xs bg-[#8B5C9E] text-white rounded px-2 py-0.5 ml-2">Today</span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  {visible.length === 0 && <span className="text-xs text-gray-400">No appointments</span>}
                  {visible.map((a) => renderChip(a, 'sm'))}
                  {hidden > 0 && (
                    <button
                      className="text-xs text-[#8B5C9E] mt-1 underline hover:text-[#6D28D9] font-semibold"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDay(day);
                      }}
                    >
                      +{hidden} more
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminCalendar;
