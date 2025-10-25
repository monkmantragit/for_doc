'use client';

import React, { useMemo } from 'react';
import { X, Plus } from 'lucide-react';
import { format, setHours, setMinutes, addMinutes, isSameDay, parse } from 'date-fns';
// Use the Appointment type defined in FullCalendarView or a shared location
// For now, let's assume it might be passed or we redefine minimally
interface Appointment {
  id: string;
  patientName: string | null;
  date: Date; // Keep date for potential use, though drawer shows one day
  time: string | null;
  status: string;
  doctorId?: string; // Make optional if not strictly needed for display
  doctor?: {
    name: string;
    speciality?: string;
  };
}

// Define the type for the utility function if passed as prop
type GetStatusColorClassFunc = (status: string) => string;

interface DayAppointmentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  allAppointments: Appointment[]; // Receive all, filter inside
  onAppointmentClick: (appointment: Appointment) => void;
  onAddSlotClick: (date: Date, time: string) => void; // Handler for adding
  getStatusColorClass: GetStatusColorClassFunc; // Pass the utility function
  workingHoursStart: number;
  workingHoursEnd: number;
  timeSlotIntervalMinutes: number;
}

// --- Helper Functions --- 

// Generates time slots (e.g., ["09:00", "09:30", ...])
const generateTimeSlots = (startHour: number, endHour: number, intervalMinutes: number): string[] => {
  const slots: string[] = [];
  let currentTime = setMinutes(setHours(new Date(), startHour), 0);
  const endTime = setMinutes(setHours(new Date(), endHour), 0);

  while (currentTime < endTime) {
    slots.push(format(currentTime, 'HH:mm'));
    currentTime = addMinutes(currentTime, intervalMinutes);
  }
  return slots;
};

// Parses time string (HH:mm) into a comparable number (minutes from midnight)
const parseTime = (timeStr: string | null): number => {
  if (!timeStr) return -1;
  try {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  } catch (e) {
    console.error("Error parsing time:", timeStr, e);
    return -1;
  }
};

// --- Component --- 
const DayAppointmentsDrawer = ({ 
  isOpen, 
  onClose, 
  selectedDate, 
  allAppointments = [], 
  onAppointmentClick,
  onAddSlotClick,
  getStatusColorClass,
  workingHoursStart,
  workingHoursEnd,
  timeSlotIntervalMinutes
}: DayAppointmentsDrawerProps) => {
  
  // Filter and sort appointments for the selected date
  const todaysAppointments = useMemo(() => {
    if (!selectedDate) return [];
    return allAppointments
      .filter(app => isSameDay(new Date(app.date), selectedDate))
      .sort((a, b) => parseTime(a.time) - parseTime(b.time)); // Sort by time ascending
  }, [allAppointments, selectedDate]);

  // Generate time slots for the day, extending to earliest and latest appointments if needed
  const timeSlots = useMemo(() => {
    let effectiveStart = workingHoursStart;
    let effectiveEnd = workingHoursEnd;
    
    if (todaysAppointments.length > 0) {
      // Find the earliest appointment time in minutes from midnight
      const earliestAppMinutes = Math.min(
        ...todaysAppointments
          .map(app => parseTime(app.time))
          .filter(mins => mins >= 0)
      );
      
      // Find the latest appointment time in minutes from midnight
      const latestAppMinutes = Math.max(
        ...todaysAppointments
          .map(app => parseTime(app.time))
          .filter(mins => mins >= 0)
      );
      
      // Adjust start time if there are appointments before working hours
      const startBoundaryMinutes = workingHoursStart * 60;
      if (earliestAppMinutes < startBoundaryMinutes) {
        // Round down to the nearest slot interval
        const slotInterval = timeSlotIntervalMinutes;
        const roundedStart = Math.floor(earliestAppMinutes / slotInterval) * slotInterval;
        effectiveStart = Math.min(workingHoursStart, Math.floor(roundedStart / 60));
      }
      
      // Adjust end time if there are appointments after working hours
      const endBoundaryMinutes = workingHoursEnd * 60;
      if (latestAppMinutes + 1 > endBoundaryMinutes) {
        // Round up to the next slot interval
        const slotInterval = timeSlotIntervalMinutes;
        const roundedEnd = Math.ceil((latestAppMinutes + 1) / slotInterval) * slotInterval;
        effectiveEnd = Math.max(workingHoursEnd, Math.ceil(roundedEnd / 60));
      }
    }
    
    return generateTimeSlots(effectiveStart, effectiveEnd, timeSlotIntervalMinutes);
  }, [workingHoursStart, workingHoursEnd, timeSlotIntervalMinutes, todaysAppointments]);

  // Map appointments to the time slot they fall *within*
  const appointmentsBySlot = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    if (!selectedDate) return map;

    const slotInterval = timeSlotIntervalMinutes;

    timeSlots.forEach((slot, index) => {
      const slotStartMinutes = parseTime(slot);
      // Determine the end time for the current slot (start of next slot or end of day)
      const nextSlotTime = index + 1 < timeSlots.length 
        ? timeSlots[index + 1]
        : format(setMinutes(setHours(new Date(), workingHoursEnd), 0), 'HH:mm');
      const slotEndMinutes = parseTime(nextSlotTime);

      // Find appointments within this slot's time range
      const appsInThisRange = todaysAppointments.filter(app => {
        const appMinutes = parseTime(app.time);
        // Check if appointment time is within [slotStartMinutes, slotEndMinutes)
        return appMinutes >= slotStartMinutes && appMinutes < slotEndMinutes;
      });

      if (appsInThisRange.length > 0) {
        map.set(slot, appsInThisRange);
      }
    });

    return map;
  // Update dependencies to include things used in the calculation
  }, [todaysAppointments, timeSlots, selectedDate, timeSlotIntervalMinutes, workingHoursEnd]);

  if (!isOpen || !selectedDate) return null;

  // Basic transition and positioning styles
  const drawerClasses = `
    fixed top-0 right-0 h-full w-80 md:w-96 bg-white 
    shadow-xl z-50 transform transition-transform ease-in-out duration-300 
    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
  `;

  const overlayClasses = `
    fixed inset-0 bg-black/30 z-40 transition-opacity ease-in-out duration-300
    ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
  `;

  return (
    <>
      {/* Overlay */}
      <div className={overlayClasses} onClick={onClose} aria-hidden="true"></div>
      
      {/* Drawer */}
      <div 
        className={drawerClasses} 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="drawer-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 id="drawer-title" className="text-lg font-semibold text-gray-800">
            Schedule for {format(selectedDate, 'MMM d, yyyy')}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-md p-1"
            aria-label="Close panel"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content - Time Slot List */}
        <div className="overflow-y-auto h-[calc(100vh-65px)]"> 
          <ul className="divide-y divide-gray-100">
            {timeSlots.map((slot) => {
              const appointmentsInSlot = appointmentsBySlot.get(slot) || [];
              const isFree = appointmentsInSlot.length === 0;
              
              return (
                <li key={slot} className="flex items-stretch p-3 min-h-[60px]">
                  <div className="w-16 text-right pr-3 text-sm text-gray-500 font-medium pt-1">
                    {slot}
                  </div>
                  <div className="flex-1 pl-3 border-l border-gray-200">
                    {isFree ? (
                      <button 
                        onClick={() => onAddSlotClick(selectedDate, slot)}
                        className="w-full h-full flex items-center justify-center text-gray-400 hover:text-[#8B5C9E] hover:bg-slate-50 rounded transition-colors duration-150 group"
                        title={`Add appointment at ${slot}`}
                      >
                        <Plus size={18} className="opacity-60 group-hover:opacity-100"/>
                      </button>
                    ) : (
                      <div className="space-y-1.5">
                        {appointmentsInSlot.map((app: Appointment) => (
                          <button 
                            key={app.id} 
                            onClick={() => onAppointmentClick(app)}
                            className={`relative w-full text-left p-2 rounded border text-xs ${getStatusColorClass(app.status)} hover:opacity-80 focus:outline-none focus:ring-1 focus:ring-offset-0 focus:ring-[#8B5C9E]`}
                          >
                            <p className="font-semibold truncate text-[13px] pr-10">
                              {app.patientName || 'Appointment'}
                            </p>
                            {app.doctor?.name && <p className="opacity-80 text-[11px]">{app.doctor.name}</p>}
                            {app.time && (
                              <p className="absolute top-1 right-2 text-[11px] font-medium opacity-70">
                                {app.time}
                              </p>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
};

export default DayAppointmentsDrawer; 