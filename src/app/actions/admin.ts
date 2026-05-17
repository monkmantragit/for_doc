'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { format, addMinutes, isBefore } from 'date-fns';
import { convertToIST, isSameDayInIST, formatISTDate, getDayOfWeekInIST } from '@/lib/dateUtils';

// Helper function for debugging date comparisons
function debugDateComparison(name: string, date1: Date | string, date2: Date | string) {
  console.log(`------ DEBUG: ${name} ------`);
  
  // Convert to Date objects if they're strings
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
  // Convert to IST for logging and comparison
  const d1_ist = convertToIST(d1);
  const d2_ist = convertToIST(d2);
  
  console.log(`Date 1 (original): ${date1}`);
  console.log(`Date 1 (as Date): ${d1}`);
  console.log(`Date 1 (in IST): ${d1_ist}`);
  console.log(`Date 1 IST components: Year=${d1_ist.getFullYear()}, Month=${d1_ist.getMonth()+1}, Day=${d1_ist.getDate()}`);
  
  console.log(`Date 2 (original): ${date2}`);
  console.log(`Date 2 (as Date): ${d2}`);
  console.log(`Date 2 (in IST): ${d2_ist}`);
  console.log(`Date 2 IST components: Year=${d2_ist.getFullYear()}, Month=${d2_ist.getMonth()+1}, Day=${d2_ist.getDate()}`);
  
  // Check equality using different methods
  const utcComponentsEqual = 
    d1.getUTCFullYear() === d2.getUTCFullYear() && 
    d1.getUTCMonth() === d2.getUTCMonth() && 
    d1.getUTCDate() === d2.getUTCDate();
    
  // Compare components in IST timezone
  const istComponentsEqual = 
    d1_ist.getFullYear() === d2_ist.getFullYear() && 
    d1_ist.getMonth() === d2_ist.getMonth() && 
    d1_ist.getDate() === d2_ist.getDate();
    
  const isoEqual = d1.toISOString().substring(0, 10) === d2.toISOString().substring(0, 10);
  
  console.log(`UTC Components equal: ${utcComponentsEqual}`);
  console.log(`IST Components equal: ${istComponentsEqual}`);
  console.log(`ISO dates equal: ${isoEqual}`);
  console.log('-------------------------');
  
  // Use IST comparison instead of UTC
  return istComponentsEqual;
}

// Helper function to convert HH:MM time string to minutes since midnight
function timeToMinutes(timeStr: string | null): number | null {
  if (!timeStr || !timeStr.includes(':')) return null;
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

// Helper function to check availability based on schedule
async function isDoctorAvailable(doctorId: string, date: Date, time: string): Promise<{ available: boolean; message: string }> {
  try {
    // Convert date to IST for proper day of week calculation
    const dateIST = convertToIST(date);
    console.log(`[isDoctorAvailable] Checking date in IST:`, {
      originalDateUTC: date.toISOString(),
      dateInIST: dateIST.toISOString(),
      formattedIST: formatISTDate(date),
      time: time
    });
    
    const scheduleResult = await fetchDoctorSchedule(doctorId);
    if (!scheduleResult.success || !scheduleResult.data) {
      return { available: false, message: 'Could not fetch doctor schedule.' };
    }

    const schedules = scheduleResult.data;
    if (schedules.length === 0) {
      return { available: false, message: 'Doctor has no defined schedule.' };
    }

    // Use IST date for day of week determination
    const appointmentDayOfWeek = dateIST.getDay(); // 0 (Sun) to 6 (Sat)
    const relevantSchedule = schedules.find(s => s.dayOfWeek === appointmentDayOfWeek);

    if (!relevantSchedule) {
      const dayName = format(dateIST, 'EEEE');
      return { available: false, message: `Doctor is not scheduled to work on ${dayName}s (IST).` };
    }

    if (!relevantSchedule.isActive) {
      return { available: false, message: 'Doctor is marked as inactive on this day (IST).' };
    }

    const appointmentMinutes = timeToMinutes(time);
    const startMinutes = timeToMinutes(relevantSchedule.startTime);
    const endMinutes = timeToMinutes(relevantSchedule.endTime);

    if (appointmentMinutes === null || startMinutes === null || endMinutes === null) {
      return { available: false, message: 'Invalid time format provided or in schedule.' };
    }

    // Check if appointment time is within the scheduled work hours (inclusive start, exclusive end)
    if (appointmentMinutes >= startMinutes && appointmentMinutes < endMinutes) {
      return { available: true, message: 'Slot available in IST timezone.' };
    } else {
      return { 
        available: false, 
        message: `Doctor's schedule on this day is ${relevantSchedule.startTime} to ${relevantSchedule.endTime} (IST).` 
      };
    }

  } catch (error) {
    console.error("Error checking doctor availability:", error);
    return { available: false, message: 'Error verifying doctor schedule.' };
  }
}

// Helper function to generate time slots between start and end times
function generateTimeSlots(startTimeStr: string, endTimeStr: string, slotDurationMinutes: number): string[] {
  const slots: string[] = [];
  const startMinutes = timeToMinutes(startTimeStr);
  const endMinutes = timeToMinutes(endTimeStr);

  if (startMinutes === null || endMinutes === null || startMinutes >= endMinutes) {
    return []; // Invalid times or duration
  }

  let currentMinutes = startMinutes;
  while (currentMinutes < endMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const minutes = currentMinutes % 60;
    slots.push(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
    currentMinutes += slotDurationMinutes;
  }

  return slots;
}

// New server action to fetch available slots for a doctor on a specific date
export async function fetchAvailableSlots(doctorId: string, date: Date): Promise<ApiResponse<string[]>> {
  try {
    console.log(`[fetchAvailableSlots] For doctor ${doctorId} on date ${date.toISOString()} (IST: ${convertToIST(date).toISOString()})`);
    
    // IMPROVEMENT 1: Check if this date is blocked (BLOCKED or UNAVAILABLE) before proceeding
    const specialDatesResult = await fetchSpecialDates(doctorId);
    const globalDatesResult = await fetchSpecialDates();
    
    // Format date for consistent comparison
    const dateStr = formatISTDate(date);
    console.log(`[fetchAvailableSlots] Formatted date in IST: ${dateStr}`);
    
    // Check if this date is globally blocked
    if (globalDatesResult.success && globalDatesResult.data) {
      const isGloballyBlocked = globalDatesResult.data.some(d => {
        if (d.type !== 'BLOCKED' && d.type !== 'UNAVAILABLE') return false;
        return isSameDayInIST(new Date(d.date), date);
      });
      
      if (isGloballyBlocked) {
        console.log(`[fetchAvailableSlots] Date ${dateStr} is globally blocked`);
        return { success: true, data: [] }; // No slots on blocked dates
      }
    }
    
    // Check if this date is specifically blocked for this doctor
    if (specialDatesResult.success && specialDatesResult.data) {
      const isDoctorBlocked = specialDatesResult.data.some(d => {
        if (d.type !== 'BLOCKED' && d.type !== 'UNAVAILABLE') return false;
        return isSameDayInIST(new Date(d.date), date);
      });
      
      if (isDoctorBlocked) {
        console.log(`[fetchAvailableSlots] Date ${dateStr} is blocked for doctor ${doctorId}`);
        return { success: true, data: [] }; // No slots on blocked dates
      }
    }
    
    // IMPROVEMENT 2: Use proper IST conversion for day of week
    const scheduleResult = await fetchDoctorSchedule(doctorId);
    if (!scheduleResult.success || !scheduleResult.data) {
      return { success: false, error: 'Could not fetch doctor schedule.' };
    }

    const schedules = scheduleResult.data;
    if (schedules.length === 0) {
      console.log(`[fetchAvailableSlots] No schedule defined for doctor ${doctorId}`);
      return { success: true, data: [] }; // No schedule defined, so no slots
    }

    // IMPROVEMENT: Use getDayOfWeekInIST instead of date.getDay()
    const appointmentDayOfWeek = getDayOfWeekInIST(date); // 0 (Sun) to 6 (Sat)
    console.log(`[fetchAvailableSlots] Day of week in IST: ${appointmentDayOfWeek}`);
    
    const relevantSchedule = schedules.find(s => s.dayOfWeek === appointmentDayOfWeek);

    if (!relevantSchedule) {
      console.log(`[fetchAvailableSlots] No schedule for day ${appointmentDayOfWeek} for doctor ${doctorId}`);
      return { success: true, data: [] }; // Not scheduled on this day
    }
    
    if (!relevantSchedule.isActive) {
      console.log(`[fetchAvailableSlots] Schedule inactive for day ${appointmentDayOfWeek} for doctor ${doctorId}`);
      return { success: true, data: [] }; // Not active on this day
    }

    // Generate slots based on schedule times, duration, and buffer
    const slotDuration = relevantSchedule.slotDuration;
    const bufferTime = relevantSchedule.bufferTime; // Get buffer time
    const totalSlotTime = slotDuration + bufferTime; // Calculate total interval

    // Re-use logic similar to the main API route, but simplified for this action
    const slots: string[] = [];
    const [startH, startM] = relevantSchedule.startTime.split(':').map(Number);
    const [endH, endM] = relevantSchedule.endTime.split(':').map(Number);

    let currentTime = new Date(date); // Use the passed date
    currentTime.setHours(startH, startM, 0, 0); // Set start time (local to server is okay here if consistent)

    const endTime = new Date(date);
    endTime.setHours(endH, endM, 0, 0); // Set end time

    // Handle breaks if defined
    const breakStartMinutes = relevantSchedule.breakStart ? timeToMinutes(relevantSchedule.breakStart) : null;
    const breakEndMinutes = relevantSchedule.breakEnd ? timeToMinutes(relevantSchedule.breakEnd) : null;

    while (isBefore(currentTime, endTime)) {
      const timeStr = format(currentTime, 'HH:mm');
      slots.push(timeStr);
      currentTime = addMinutes(currentTime, totalSlotTime); // Increment by TOTAL slot time
    }
    
    // 1. Get all existing appointments for this doctor
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctorId,
        status: {
          notIn: ['CANCELLED', 'NO_SHOW'] // Only consider active appointments
        }
      },
      select: {
        date: true,
        time: true,
      }
    });
    
    // Filter to only appointments on the requested date using IST comparison
    const sameDataAppointments = existingAppointments.filter(apt => {
      return isSameDayInIST(new Date(apt.date), date);
    });
    
    const bookedSlots = new Set(sameDataAppointments.map(apt => apt.time));
    
    // 2. Get all time-specific blocks for this doctor
    const timeBlocks = await prisma.specialDate.findMany({
      where: {
        doctorId: doctorId,
        type: 'TIME_BLOCK'
      }
    });
    
    // Filter to only blocks on the requested date using IST comparison
    const relevantTimeBlocks = timeBlocks.filter(block => {
      return isSameDayInIST(block.date, date);
    });
    
    // Filter out slots that:
    // 1. Are already booked
    // 2. Fall within a time block
    // 3. Would overlap with a break
    let availableSlots = slots.filter(slot => {
      // Check 1: Already booked?
      if (bookedSlots.has(slot)) {
        return false;
      }
      
      // Check 2: Within a time block?
      const slotMinutes = timeToMinutes(slot);
      if (slotMinutes === null) return false; // Invalid time format
      
      const slotEndMinutes = slotMinutes + slotDuration;
      
      for (const block of relevantTimeBlocks) {
        if (!block.reason?.startsWith('TIME:')) continue;
        
        const parts = block.reason.split(':');
        if (parts.length < 3) continue;
        
        const timeRange = parts[1];
        const [blockStartTimeStr, blockEndTimeStr] = timeRange.split('-');
        
        const blockStartMinutes = timeToMinutes(blockStartTimeStr);
        const blockEndMinutes = timeToMinutes(blockEndTimeStr);
        
        if (blockStartMinutes === null || blockEndMinutes === null) continue;
        
        // Check if slot starts during block
        const startsInBlock = slotMinutes >= blockStartMinutes && slotMinutes < blockEndMinutes;
        
        // Check if slot ends during block
        const endsInBlock = slotEndMinutes > blockStartMinutes && slotEndMinutes <= blockEndMinutes;
        
        // Check if slot spans the entire block
        const spansBlock = slotMinutes < blockStartMinutes && slotEndMinutes > blockEndMinutes;
        
        if (startsInBlock || endsInBlock || spansBlock) {
          return false;
        }
      }
      
      // Check 3: Overlaps with a defined break?
      if (breakStartMinutes !== null && breakEndMinutes !== null) {
        // Check if slot starts during break
        const startsInBreak = slotMinutes >= breakStartMinutes && slotMinutes < breakEndMinutes;
        
        // Check if slot ends during break
        const endsInBreak = slotEndMinutes > breakStartMinutes && slotEndMinutes <= breakEndMinutes;
        
        // Check if slot spans the entire break
        const spansBreak = slotMinutes < breakStartMinutes && slotEndMinutes > breakEndMinutes;
        
        if (startsInBreak || endsInBreak || spansBreak) {
          return false;
        }
      }
      
      return true;
    });

    // Custom override: remove specific slots only for the given doctor ID
    try {
      const targetDoctorId = '2e3de056-4948-4038-982f-74338d1f1e62';
      if (doctorId === targetDoctorId) {
        const blockedTimes = new Set(['11:35', '11:45', '11:55']);
        availableSlots = availableSlots.filter(slot => !blockedTimes.has(slot));
        console.log(`[fetchAvailableSlots] Removed blocked times for doctor ${doctorId}: ${blockedTimes}`);
      }
    } catch (e) {
      console.error('[fetchAvailableSlots] Failed to apply custom slot filter for target doctor:', e);
    }
    
    console.log(`[fetchAvailableSlots] Found ${availableSlots.length} available slots for doctor ${doctorId} on ${dateStr}`);
    return { success: true, data: availableSlots };
  } catch (error) {
    console.error("Error fetching available slots:", error);
    return { success: false, error: 'Failed to retrieve available time slots' };
  }
}

/**
 * Finds the next available date for a doctor
 * @param doctorId The doctor's ID
 * @returns The next available date or null if none found within search range
 */
export async function getNextAvailableDate(doctorId: string): Promise<ApiResponse<Date | null>> {
  try {
    if (!doctorId) {
      return { success: false, error: 'Doctor ID is required' };
    }
    
    // Start from today
    const startDate = new Date();
    // Check up to 30 days in the future
    const MAX_DAYS_TO_CHECK = 30;
    
    // Loop through days to find the first available slot
    for (let i = 0; i < MAX_DAYS_TO_CHECK; i++) {
      const checkDate = new Date(startDate);
      checkDate.setDate(startDate.getDate() + i);
      
      // Use existing function to check for available slots
      const slotsResponse = await fetchAvailableSlots(doctorId, checkDate);
      
      if (slotsResponse.success && slotsResponse.data && slotsResponse.data.length > 0) {
        // Found available slots on this date
        console.log(`[getNextAvailableDate] Found next available date for doctor ${doctorId}: ${checkDate.toISOString()}`);
        return { success: true, data: checkDate };
      }
    }
    
    // No available dates found in the search range
    console.log(`[getNextAvailableDate] No available dates found for doctor ${doctorId} within ${MAX_DAYS_TO_CHECK} days`);
    return { success: true, data: null };
  } catch (error) {
    console.error("Error finding next available date:", error);
    return { success: false, error: 'Failed to find next available date' };
  }
}

export async function fetchDoctors() {
  try {
    const doctors = await prisma.doctor.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    return { success: true, data: doctors };
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return { success: false, error: 'Failed to fetch doctors' };
  }
}

export async function fetchAppointments(
  page: number = 1,
  pageSize: number = 10,
  filters?: {
    startDate?: Date;
    endDate?: Date;
    doctorId?: string;
    status?: string;
    /** Filter by the related doctor's speciality (e.g. "Physiotherapist"). */
    speciality?: string;
    /** Exclude appointments whose related doctor has this speciality. */
    excludeSpeciality?: string;
  }
) {
  try {
    const where: any = {};
    const skip = (page - 1) * pageSize;

    if (filters?.startDate && filters?.endDate) {
      where.date = {
        gte: filters.startDate,
        lte: filters.endDate
      };
    }

    if (filters?.doctorId) {
      where.doctorId = filters.doctorId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.speciality) {
      where.doctor = { ...(where.doctor || {}), speciality: filters.speciality };
    } else if (filters?.excludeSpeciality) {
      where.doctor = {
        ...(where.doctor || {}),
        NOT: { speciality: filters.excludeSpeciality }
      };
    }
    
    // Get total count for pagination
    const totalCount = await prisma.appointment.count({ where });

    const appointments = await prisma.appointment.findMany({
      where,
      select: {
        id: true,
        patientName: true,
        email: true,
        phone: true,
        date: true,
        time: true,
        status: true,
        doctorId: true,
        customerId: true,
        createdAt: true,
        updatedAt: true,
        notes: true,
        timeSlot: true,
        doctor: {
          select: {
            name: true,
            speciality: true,
            fee: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      },
      skip,
      take: pageSize
    });

    return { 
      success: true, 
      data: {
        appointments,
        pagination: {
          total: totalCount,
          page,
          pageSize,
          pageCount: Math.ceil(totalCount / pageSize)
        }
      } 
    };
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return { success: false, error: 'Failed to fetch appointments' };
  }
}

// NEW: Action to fetch all appointments specifically for the calendar view
export async function fetchAllAppointmentsForCalendar(
  filters?: {
    /** Filter by the related doctor's speciality (e.g. "Physiotherapist"). */
    speciality?: string;
    /** Exclude appointments whose related doctor has this speciality. */
    excludeSpeciality?: string;
  }
): Promise<ApiResponse<any[]>> {
  try {
    const where: any = {};
    if (filters?.speciality) {
      where.doctor = { speciality: filters.speciality };
    } else if (filters?.excludeSpeciality) {
      where.doctor = { NOT: { speciality: filters.excludeSpeciality } };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      select: { // Select fields needed by FullCalendarView AND AppointmentModal
        id: true,
        patientName: true,
        date: true,
        time: true,
        status: true,
        doctorId: true,
        customerId: true,
        email: true, // Add email
        phone: true, // Add phone
        doctor: {
          select: {
            name: true,
            speciality: true
          }
        }
      },
      orderBy: {
        date: 'asc' // Order chronologically for calendar
      }
      // No skip or take - fetch all
    });
    return { success: true, data: appointments };
  } catch (error) {
    console.error('Error fetching all appointments for calendar:', error);
    return { success: false, error: 'Failed to fetch all appointments for calendar' };
  }
}

export async function fetchAnalytics(startDate: Date, endDate: Date) {
  try {
    const [
      appointments,
      completedAppointments,
      cancelledAppointments,
      appointmentsByDay,
      completedAppointmentsWithFees,
      recentActivity
    ] = await Promise.all([
      // Total appointments
      prisma.appointment.count(),
      
      // Completed appointments
      prisma.appointment.count({
        where: { status: 'COMPLETED' }
      }),
      
      // Cancelled appointments
      prisma.appointment.count({
        where: { status: 'CANCELLED' }
      }),
      
      // Appointments by day
      prisma.$queryRaw`
        SELECT 
          DATE(date) as date,
          COUNT(*) as count
        FROM "Appointment"
        WHERE date >= ${startDate} AND date <= ${endDate}
        GROUP BY DATE(date)
        ORDER BY date ASC
      `,

      // Completed appointments with fees for revenue calculation
      prisma.appointment.findMany({
        where: {
          status: 'COMPLETED',
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          doctor: true
        }
      }),

      // Recent activity
      prisma.appointment.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          doctor: true
        }
      })
    ]);

    // Calculate revenue by doctor - improved with null checks
    const revenueMap = new Map<string, { id: string; name: string; revenue: number }>();
    
    completedAppointmentsWithFees.forEach(apt => {
      if (apt.doctor && apt.doctor.id) {
        const doctorId = apt.doctor.id;
        const fee = apt.doctor.fee || 0;
        const existing = revenueMap.get(doctorId);
        
        if (existing) {
          existing.revenue += fee;
        } else {
          revenueMap.set(doctorId, {
            id: doctorId,
            name: apt.doctor.name || 'Unknown Doctor',
            revenue: fee
          });
        }
      }
    });

    const revenueByDoctor = Array.from(revenueMap.values());
    const totalRevenue = revenueByDoctor.reduce((sum, doc) => sum + doc.revenue, 0);

    return {
      success: true,
      data: {
        totalAppointments: appointments,
        completedAppointments,
        cancelledAppointments,
        totalRevenue,
        appointmentsByDay: (appointmentsByDay as any[]).map(day => ({
          date: day.date.toISOString(),
          count: Number(day.count)
        })),
        revenueByDoctor,
        recentActivity: recentActivity.map(apt => ({
          id: apt.id,
          patientName: apt.patientName || 'Unknown Patient',
          doctorName: apt.doctor?.name || 'Unknown Doctor',
          date: apt.date.toISOString(),
          status: apt.status || 'UNKNOWN'
        }))
      }
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return { success: false, error: 'Failed to fetch analytics' };
  }
}

export async function fetchDoctorSchedule(doctorId: string) {
  try {
    const schedules = await prisma.doctorSchedule.findMany({
      where: { doctorId },
      orderBy: { dayOfWeek: 'asc' }
    });
    return { success: true, data: schedules };
  } catch (error) {
    console.error('Error fetching doctor schedule:', error);
    return { success: false, error: 'Failed to fetch doctor schedule' };
  }
}

export async function updateAppointmentStatus(appointmentId: string, newStatus: string) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return { success: false, error: 'Appointment not found' };
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      SCHEDULED: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['IN_CONSULTATION', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
      IN_CONSULTATION: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: [],
      NO_SHOW: [],
    };

    if (!validTransitions[appointment.status]?.includes(newStatus)) {
      return {
        success: false,
        error: `Cannot change status from ${appointment.status} to ${newStatus}`
      };
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: newStatus },
      include: {
        doctor: {
          select: {
            name: true,
            speciality: true,
            fee: true
          }
        }
      }
    });

    // Add revalidation here
    revalidatePath('/admin/appointments'); // Existing revalidation
    revalidatePath('/api/available-slots'); // Revalidate available slots

    return {
      success: true,
      data: updated,
      message: `Appointment status updated to ${newStatus}`
    };

  } catch (error) {
    console.error('Error updating appointment status:', error);
    return { success: false, error: 'Failed to update appointment status' };
  }
}

// Define the response type
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Create a new appointment with schedule validation
export const createAppointment = async (appointmentData: any): Promise<ApiResponse> => {
  try {
    console.log('Attempting to create appointment with data:', appointmentData);

    const { patientName, email, phone, date, time, status, doctorId, customerId, notes } = appointmentData;
    const appointmentDate = new Date(date);
    
    // Log both UTC and IST representations for debugging
    const appointmentDateIST = convertToIST(appointmentDate);
    console.log(`[createAppointment] Processing date:`, {
      originalUTC: appointmentDate.toISOString(),
      convertedToIST: appointmentDateIST.toISOString(),
      formattedIST: formatISTDate(appointmentDate),
      appointmentDay: appointmentDateIST.getDate(),
      appointmentMonth: appointmentDateIST.getMonth() + 1,
      timeSlot: time
    });

    if (!patientName || !email || !phone || !appointmentDate || !time || !status || !doctorId) {
      return { success: false, error: 'Missing required appointment fields (incl. email/phone)' };
    }

    // 1. Check if doctor works on this day and time (basic availability)
    const availability = await isDoctorAvailable(doctorId, appointmentDate, time);
    if (!availability.available) {
      return { success: false, error: availability.message };
    }

    // 2. Check for whole-day blocks on the requested date
    // Use IST date string format for better logging clarity
    const dateStr = formatISTDate(appointmentDate);
    console.log(`Checking availability for date in IST: ${dateStr}`);
    
    // Find any blocks for this doctor - but get all to use IST comparison
    const fullDayBlocks = await prisma.specialDate.findMany({
      where: {
        OR: [
          { doctorId: doctorId, type: 'UNAVAILABLE' },
          { doctorId: null, type: 'UNAVAILABLE' }  // Also check global blocks
        ]
      }
    });
    
    // Use the new IST comparison to check for blocks
    const fullDayBlock = fullDayBlocks.find(block => {
      const blockDate = new Date(block.date);
      const isBlocking = isSameDayInIST(blockDate, appointmentDate);
      
      if (isBlocking) {
        console.log(`[createAppointment] Block detected:`, {
          blockDateUTC: blockDate.toISOString(),
          blockDateIST: convertToIST(blockDate).toISOString(),
          appointmentDateUTC: appointmentDate.toISOString(),
          appointmentDateIST: appointmentDateIST.toISOString(),
          isSameDay: isBlocking
        });
      }
      
      return isBlocking;
    });

    if (fullDayBlock) {
      console.log(`Found blocking date: ${fullDayBlock.date} matching appointment date in IST: ${dateStr}`);
      return { 
        success: false, 
        error: `Doctor is unavailable on ${dateStr} (IST)${fullDayBlock.reason ? ': ' + fullDayBlock.reason : ''}` 
      };
    }

    // 3. Check for time-specific blocks
    const appointmentTimeMinutes = timeToMinutes(time);
    if (appointmentTimeMinutes === null) {
      return { success: false, error: 'Invalid appointment time format' };
    }

    // Get doctor's schedule to determine slot duration
    const scheduleResult = await fetchDoctorSchedule(doctorId);
    if (!scheduleResult.success || !scheduleResult.data) {
      return { success: false, error: 'Could not fetch doctor schedule to verify appointment duration' };
    }

    const dayOfWeek = appointmentDateIST.getDay(); // Use IST date for day of week
    console.log(`[createAppointment] Checking schedule for day of week ${dayOfWeek} (in IST)`);
    
    const relevantSchedule = scheduleResult.data.find(s => s.dayOfWeek === dayOfWeek);
    if (!relevantSchedule) {
      const dayName = format(appointmentDateIST, 'EEEE');
      return { success: false, error: `Doctor does not work on ${dayName}s (IST)` };
    }

    const slotDuration = relevantSchedule.slotDuration;
    const appointmentEndMinutes = appointmentTimeMinutes + slotDuration;

    // Check for time blocks
    const timeBlocks = await prisma.specialDate.findMany({
      where: {
        OR: [
          { doctorId: doctorId, type: 'TIME_BLOCK' },
          { doctorId: null, type: 'TIME_BLOCK' }  // Also check global time blocks
        ]
      }
    });
    
    // Filter time blocks to only include those on the same date in IST
    const relevantTimeBlocks = timeBlocks.filter(block => {
      return isSameDayInIST(block.date, appointmentDate);
    });

    for (const block of relevantTimeBlocks) {
      if (!block.reason?.startsWith('TIME:')) continue;
      
      const parts = block.reason.split(':');
      if (parts.length < 3) continue;
      
      const timeRange = parts[1];
      const [blockStartTimeStr, blockEndTimeStr] = timeRange.split('-');
      const blockReason = parts.slice(2).join(':') || 'Time Block';
      
      const blockStartMinutes = timeToMinutes(blockStartTimeStr);
      const blockEndMinutes = timeToMinutes(blockEndTimeStr);
      
      if (blockStartMinutes === null || blockEndMinutes === null) continue;
      
      // Check if appointment starts during block
      const startsInBlock = appointmentTimeMinutes >= blockStartMinutes && appointmentTimeMinutes < blockEndMinutes;
      
      // Check if appointment ends during block
      const endsInBlock = appointmentEndMinutes > blockStartMinutes && appointmentEndMinutes <= blockEndMinutes;
      
      // Check if appointment spans the entire block
      const spansBlock = appointmentTimeMinutes < blockStartMinutes && appointmentEndMinutes > blockEndMinutes;
      
      if (startsInBlock || endsInBlock || spansBlock) {
        return { 
          success: false, 
          error: `Doctor is unavailable during this time: ${blockStartTimeStr}-${blockEndTimeStr}${blockReason ? ' (' + blockReason + ')' : ''}` 
        };
      }
    }

    // 4. Check for existing appointments at this time
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        time,
        status: {
          notIn: ['CANCELLED', 'NO_SHOW']
        }
      }
    });
    
    // Check if any existing appointment is on the same day in IST
    const conflictingAppointment = existingAppointments.find(appointment => {
      const existingDate = new Date(appointment.date);
      const isConflicting = isSameDayInIST(existingDate, appointmentDate);
      
      if (isConflicting) {
        console.log(`[createAppointment] Conflicting appointment found:`, {
          existingDateUTC: existingDate.toISOString(),
          existingDateIST: convertToIST(existingDate).toISOString(),
          newDateUTC: appointmentDate.toISOString(),
          newDateIST: appointmentDateIST.toISOString(),
          isSameDay: isConflicting
        });
      }
      
      return isConflicting;
    });
    
    if (conflictingAppointment) {
      return { 
        success: false, 
        error: `Time slot ${time} on ${dateStr} (IST) is already booked. Please select another time.` 
      };
    }
    
    // Before creating the appointment, log the final date we're using for clarity
    console.log(`[createAppointment] Creating appointment with finalized date:`, {
      dateForDatabase: appointmentDate.toISOString(),
      dateInIST: appointmentDateIST.toISOString(),
      formattedIST: formatISTDate(appointmentDate),
      time: time
    });

    const { normalizePhone, normalizeNameKey } = await import('@/lib/patient');
    const normalizedPhone = normalizePhone(phone);
    const nameKey = normalizeNameKey(patientName);

    const newAppointment = await prisma.$transaction(async (tx) => {
      let patientId: string | undefined;
      if (normalizedPhone && nameKey) {
        const patient = await tx.patient.upsert({
          where: { phone_nameKey: { phone: normalizedPhone, nameKey } },
          create: {
            phone: normalizedPhone,
            name: patientName.trim(),
            nameKey,
            email: email || null,
          },
          update: {
            name: patientName.trim(),
            email: email || undefined,
          },
        });
        patientId = patient.id;
      }

      return tx.appointment.create({
        data: {
          patientName,
          email,
          phone: normalizedPhone ?? phone,
          notes: notes ?? null,
          date: appointmentDate,
          time,
          status,
          doctorId,
          customerId,
          patientId,
        },
        include: {
          doctor: { select: { name: true, speciality: true, fee: true } }
        }
      });
    });

    console.log('Successfully created appointment:', newAppointment);

    // --- Webhook Logic Start ---
    const webhookUrl = process.env.BOOKING_WEBHOOK_URL;
    if (webhookUrl) {
      console.log(`Webhook URL found, attempting to send POST request to: ${webhookUrl}`)
      try {
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newAppointment), // Send the newly created appointment object
        });

        if (!webhookResponse.ok) {
          // Log error if webhook request failed
          console.error(`Webhook failed with status: ${webhookResponse.status}`, await webhookResponse.text());
        } else {
          console.log('Successfully sent booking webhook for appointment:', newAppointment.id);
        }
      } catch (webhookError) {
        console.error('Error sending booking webhook:', webhookError);
        // Non-fatal error: Log it but don't prevent the success response for appointment creation
      }
    } else {
      console.log('BOOKING_WEBHOOK_URL not found in environment variables. Skipping webhook.')
    }
    // --- Webhook Logic End ---

    revalidatePath('/admin/appointments');
    return { 
      success: true, 
      data: {
        ...newAppointment, 
        // Include IST date for frontend display
        dateInIST: formatISTDate(appointmentDate),
        dayOfWeekIST: appointmentDateIST.getDay()
      } 
    };

  } catch (error) {
    console.error('Error creating appointment:', error);
    return { success: false, error: 'Failed to create appointment in database' };
  }
};

// Update an existing appointment with schedule validation
export const updateAppointment = async (appointmentData: any): Promise<ApiResponse> => {
  try {
    const { id, patientName, email, phone, date, time, status, doctorId, customerId } = appointmentData;
    const appointmentDate = new Date(date);
    const appointmentDateIST = convertToIST(appointmentDate);

    console.log('[updateAppointment] Attempting to update appointment with ID:', id);
    console.log('[updateAppointment] Update data:', {
      ...appointmentData,
      dateUTC: appointmentDate.toISOString(),
      dateIST: appointmentDateIST.toISOString(),
      formattedIST: formatISTDate(appointmentDate)
    });

    if (!id) {
      return { success: false, error: 'Appointment ID is required for update' };
    }

    // ---- START OF SIMPLIFICATION FOR CANCELLATION/NO-SHOW ----
    if (status === 'CANCELLED' || status === 'NO_SHOW') {
      console.log(`[updateAppointment] Path for ${status}: Directly updating status and clearing time for ID: ${id}`);
      try {
        const appointmentToUpdate = await prisma.appointment.findUnique({ where: { id } });
        if (!appointmentToUpdate) {
          return { success: false, error: `Appointment with ID ${id} not found for status update.` };
        }

        const updatedAppointment = await prisma.appointment.update({
          where: { id: id },
          data: {
            status: status,
            time: null, // Explicitly set time to null
            // Preserve other fields from input, falling back to existing if not provided in modal
            patientName: patientName || appointmentToUpdate.patientName,
            email: email || appointmentToUpdate.email,
            phone: phone || appointmentToUpdate.phone,
            date: appointmentDate, // Keep the date from the form (appointmentDate is already defined)
            doctorId: doctorId || appointmentToUpdate.doctorId,
            customerId: customerId === undefined ? appointmentToUpdate.customerId : customerId, // Handle explicit null for customerId
            // notes: appointmentData.notes === undefined ? appointmentToUpdate.notes : appointmentData.notes, // Example if you have notes
          },
          include: {
            doctor: { select: { name: true, speciality: true, fee: true } }
          }
        });

        revalidatePath('/admin/appointments');
        revalidatePath('/api/available-slots'); 

        return {
          success: true,
          data: {
            ...updatedAppointment,
            dateInIST: formatISTDate(new Date(updatedAppointment.date)),
            dayOfWeekIST: convertToIST(new Date(updatedAppointment.date)).getDay()
          },
          message: `Appointment status set to ${status}. Time cleared.`
        };
      } catch (error) {
        console.error(`Error during targeted ${status} update for ID ${id}:`, error);
        return { success: false, error: `Failed to set status to ${status}.` };
      }
    }
    // ---- END OF SIMPLIFICATION ----

    // Original comprehensive update logic follows
    // Ensure required fields are present for active appointment updates
    if (!patientName || !appointmentDate || !time || !status || !doctorId) {
      return { success: false, error: 'Missing required appointment fields for update (patient, date, time, status, doctor)' };
    }

    // Get existing appointment to check if anything changed (this is somewhat redundant now if CANCELLED path taken, but harmless)
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id }
    });

    if (!existingAppointment) {
      return { success: false, error: `Appointment with ID ${id} not found.` };
    }

    // Check if the time or date is being changed by comparing in IST
    const existingDate = new Date(existingAppointment.date);
    const isDateChanged = !isSameDayInIST(existingDate, appointmentDate);
    const isTimeChanged = existingAppointment.time !== time;
    
    console.log(`[updateAppointment] Change detection:`, {
      existingDateUTC: existingDate.toISOString(),
      existingDateIST: convertToIST(existingDate).toISOString(),
      newDateUTC: appointmentDate.toISOString(), 
      newDateIST: appointmentDateIST.toISOString(),
      isDateChanged,
      isTimeChanged
    });
    
    // Only do availability checks if the time, date, or doctor is changing
    // AND the status is NOT being set to 'CANCELLED' (or some other inactive status)
    if (
      (isDateChanged || isTimeChanged || existingAppointment.doctorId !== doctorId) &&
      status !== 'CANCELLED' && 
      status !== 'NO_SHOW' // Potentially add other "inactive" statuses here if needed
    ) {
      // 1. Check if doctor works on this day and time (basic availability)
      const availability = await isDoctorAvailable(doctorId, appointmentDate, time);
      if (!availability.available) {
        return { success: false, error: availability.message };
      }

      // 2. Check for whole-day blocks on the requested date
      const dateStr = formatISTDate(appointmentDate);
      console.log(`Checking availability for date in IST: ${dateStr}`);
      
      // Find any blocks for this doctor
      const fullDayBlocks = await prisma.specialDate.findMany({
        where: {
          doctorId: doctorId,
          type: 'UNAVAILABLE'
        }
      });
      
      // Use the new IST comparison to check for blocks
      const fullDayBlock = fullDayBlocks.find(block => {
        return isSameDayInIST(block.date, appointmentDate);
      });

      if (fullDayBlock) {
        console.log(`Found blocking date: ${fullDayBlock.date} matching appointment date in IST: ${dateStr}`);
        return { 
          success: false, 
          error: `Doctor is unavailable on ${dateStr} (IST)${fullDayBlock.reason ? ': ' + fullDayBlock.reason : ''}` 
        };
      }

      // 3. Check for time-specific blocks
      const appointmentTimeMinutes = timeToMinutes(time);
      if (appointmentTimeMinutes === null) {
        return { success: false, error: 'Invalid appointment time format' };
      }

      // Get doctor's schedule to determine slot duration
      const scheduleResult = await fetchDoctorSchedule(doctorId);
      if (!scheduleResult.success || !scheduleResult.data) {
        return { success: false, error: 'Could not fetch doctor schedule to verify appointment duration' };
      }

      const dayOfWeek = appointmentDateIST.getDay();
      const relevantSchedule = scheduleResult.data.find(s => s.dayOfWeek === dayOfWeek);
      if (!relevantSchedule) {
        const dayName = format(convertToIST(appointmentDate), 'EEEE');
        return { success: false, error: `Doctor does not work on ${dayName}s (IST)` };
      }

      const slotDuration = relevantSchedule.slotDuration;
      const appointmentEndMinutes = appointmentTimeMinutes + slotDuration;

      // Check for time blocks
      const timeBlocks = await prisma.specialDate.findMany({
        where: {
          doctorId: doctorId,
          type: 'TIME_BLOCK'
        }
      });
      
      // Filter time blocks to only include those on the same date in IST
      const relevantTimeBlocks = timeBlocks.filter(block => {
        return isSameDayInIST(block.date, appointmentDate);
      });

      for (const block of relevantTimeBlocks) {
        if (!block.reason?.startsWith('TIME:')) continue;
        
        const parts = block.reason.split(':');
        if (parts.length < 3) continue;
        
        const timeRange = parts[1];
        const [blockStartTimeStr, blockEndTimeStr] = timeRange.split('-');
        const blockReason = parts.slice(2).join(':') || 'Time Block';
        
        const blockStartMinutes = timeToMinutes(blockStartTimeStr);
        const blockEndMinutes = timeToMinutes(blockEndTimeStr);
        
        if (blockStartMinutes === null || blockEndMinutes === null) continue;
        
        // Check if appointment starts during block
        const startsInBlock = appointmentTimeMinutes >= blockStartMinutes && appointmentTimeMinutes < blockEndMinutes;
        
        // Check if appointment ends during block
        const endsInBlock = appointmentEndMinutes > blockStartMinutes && appointmentEndMinutes <= blockEndMinutes;
        
        // Check if appointment spans the entire block
        const spansBlock = appointmentTimeMinutes < blockStartMinutes && appointmentEndMinutes > blockEndMinutes;
        
        if (startsInBlock || endsInBlock || spansBlock) {
          return { 
            success: false, 
            error: `Doctor is unavailable during this time: ${blockStartTimeStr}-${blockEndTimeStr}${blockReason ? ' (' + blockReason + ')' : ''}` 
          };
        }
      }

      // 4. Check for existing appointments at this time (excluding the current appointment being updated)
      const conflictingAppointment = await prisma.appointment.findFirst({
        where: {
          doctorId,
          time,
          id: { not: id }, // Exclude the current appointment
          status: {
            notIn: ['CANCELLED', 'NO_SHOW']
          }
        }
      });

      // If there's a potentially conflicting appointment, check the date manually
      if (conflictingAppointment) {
        const conflictingDate = new Date(conflictingAppointment.date);
        
        // Extract individual date components
        const conflictingYear = conflictingDate.getUTCFullYear();
        const conflictingMonth = conflictingDate.getUTCMonth();
        const conflictingDay = conflictingDate.getUTCDate();
        
        const apptYear = appointmentDate.getUTCFullYear();
        const apptMonth = appointmentDate.getUTCMonth();
        const apptDay = appointmentDate.getUTCDate();
        
        // Compare the date components directly
        const datesMatch = (
          conflictingYear === apptYear && 
          conflictingMonth === apptMonth && 
          conflictingDay === apptDay
        );
        
        // Only consider it a conflict if it's on the same date
        if (datesMatch) {
          return { 
            success: false, 
            error: 'This time slot is already booked. Please select another time.' 
          };
        }
      }
    }

    console.log(`[updateAppointment] Updating appointment with finalized date:`, {
      dateForDatabase: appointmentDate.toISOString(),
      dateInIST: appointmentDateIST.toISOString(),
      formattedIST: formatISTDate(appointmentDate),
      time: time
    });

    const updatedAppointment = await prisma.appointment.update({
      where: { id: id },
      data: {
        patientName,
        email: email || existingAppointment.email,
        phone: phone || existingAppointment.phone,
        date: appointmentDate,
        time,
        status,
        doctorId,
        customerId,
      },
      include: {
        doctor: { select: { name: true, speciality: true, fee: true } }
      }
    });

    console.log('Successfully updated appointment:', updatedAppointment);
    revalidatePath('/admin/appointments');
    return { 
      success: true, 
      data: {
        ...updatedAppointment,
        dateInIST: formatISTDate(appointmentDate),
        dayOfWeekIST: appointmentDateIST.getDay()
      }
    };

  } catch (error) {
    console.error('Error updating appointment:', error);
    if (error instanceof Error && (error as any).code === 'P2025') {
       return { success: false, error: `Appointment with ID ${appointmentData?.id} not found.` };
    }
    return { success: false, error: 'Failed to update appointment in database' };
  }
};

// --- Special Date / Availability Management Actions ---

// Fetches special dates. If doctorId provided, fetch specific, otherwise fetch global.
export async function fetchSpecialDates(doctorId?: string): Promise<ApiResponse<any[]>> {
  try {
    const whereClause: any = {};
    if (doctorId) {
      // Fetch dates specific to this doctor
      whereClause.doctorId = doctorId;
    } else {
      // Fetch only global dates (doctorId is null)
      whereClause.doctorId = null;
    }

    const specialDates = await prisma.specialDate.findMany({
      where: whereClause,
      orderBy: {
        date: 'asc',
      },
    });
    
    return { success: true, data: specialDates };
  } catch (error) {
    console.error('Error fetching special dates:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Updated Payload for creating global or doctor-specific dates
interface CreateSpecialDatePayload {
  date: Date | string;
  name?: string; // Optional: Required for global
  type?: string; // Optional: Required for global
  reason?: string; // Optional: Used for doctor-specific blocks
  doctorId?: string; // Optional: ID of the doctor if not global
}

// Creates a special date (global or doctor-specific)
export async function createSpecialDate(payload: CreateSpecialDatePayload): Promise<ApiResponse<any>> {
  try {
    const { date, name, type, reason, doctorId } = payload;
    
    // Ensure date is properly formatted
    let dateObject: Date;
    if (typeof date === 'string') {
      // Parse the string date to a Date object
      const [year, month, day] = date.split('-').map(Number);
      dateObject = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    } else {
      dateObject = date;
    }
    
    const newSpecialDate = await prisma.specialDate.create({
      data: {
        date: dateObject,
        name: name || (doctorId ? (reason || 'Blocked') : 'Unnamed Date'),
        type: type || (doctorId ? 'UNAVAILABLE' : 'OTHER'),
        reason,
        doctorId: doctorId || null,
      }
    });
    
    // Revalidate relevant paths
    revalidatePath('/admin/special-dates');
    if (doctorId) {
      revalidatePath(`/admin/doctors/${doctorId}/schedule`);
    }
    revalidatePath('/admin/schedule'); // Revalidate main schedule page too
    
    // Also revalidate frontend API routes
    revalidatePath('/api/available-slots');
    
    return { success: true, data: newSpecialDate };
  } catch (error) {
    console.error('Error creating special date:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// deleteSpecialDate action remains the same, uses ID
export async function deleteSpecialDate(specialDateId: string): Promise<ApiResponse> {
  try {
    await prisma.specialDate.delete({
      where: { id: specialDateId }
    });
    
    // Revalidate paths after delete
    revalidatePath('/admin/special-dates');
    revalidatePath('/admin/schedule');
    
    // Also revalidate frontend API routes
    revalidatePath('/api/available-slots');
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting special date:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// New action to fetch a single doctor by ID
export async function fetchDoctorById(doctorId: string) {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
    });
    if (!doctor) {
      return { success: false, error: 'Doctor not found' };
    }
    return { success: true, data: doctor };
  } catch (error) {
    console.error(`Error fetching doctor with ID ${doctorId}:`, error);
    return { success: false, error: 'Failed to fetch doctor details' };
  }
}

// --- Doctor Management Actions ---

// Action to delete a doctor
export async function deleteDoctor(doctorId: string): Promise<ApiResponse> {
  try {
    const appointmentCount = await prisma.appointment.count({
      where: { doctorId },
    });

    if (appointmentCount > 0) {
      return {
        success: false,
        error: `Cannot delete doctor: ${appointmentCount} appointment(s) reference this doctor. Deactivate the doctor instead, or reassign/delete the appointments first.`,
      };
    }

    await prisma.$transaction([
      prisma.doctorSchedule.deleteMany({ where: { doctorId } }),
      prisma.specialDate.deleteMany({ where: { doctorId } }),
      prisma.doctor.delete({ where: { id: doctorId } }),
    ]);

    revalidatePath('/admin/doctors');
    return { success: true, message: 'Doctor deleted successfully' };
  } catch (error) {
    console.error("Error deleting doctor:", error);
    if ((error as any).code === 'P2025') {
      return { success: false, error: 'Doctor not found or already deleted.' };
    }
    if ((error as any).code === 'P2003') {
      return { success: false, error: 'Cannot delete doctor: related records exist. Deactivate instead.' };
    }
    return { success: false, error: 'Failed to delete doctor. Please try again.' };
  }
}

// New action to delete an appointment
export async function deleteAppointmentAction(appointmentId: string): Promise<ApiResponse> {
  try {
    await prisma.appointment.delete({
      where: { id: appointmentId },
    });
    // Revalidate paths where appointments are shown, e.g., admin appointments page and possibly user-facing views
    revalidatePath('/admin/appointments');
    // Consider revalidating other relevant paths if appointments appear elsewhere
    // revalidatePath('/my-appointments'); 
    return { success: true, message: 'Appointment deleted successfully.' };
  } catch (error) {
    console.error("Error deleting appointment:", error);
    if ((error as any).code === 'P2025') { // Prisma error code for record not found
      return { success: false, error: 'Appointment not found or already deleted.' };
    }
    return { success: false, error: 'Failed to delete appointment. Please try again.' };
  }
}

// =====================================================================
// Patient identity + visit lifecycle (check-in/check-out + visit notes)
// =====================================================================

import { normalizePhone as _normalizePhone } from '@/lib/patient';

export async function fetchAppointmentDetail(appointmentId: string) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: { select: { name: true, speciality: true, fee: true } },
        patient: true,
      },
    });

    if (!appointment) {
      return { success: false as const, error: 'Appointment not found' };
    }

    return { success: true as const, data: appointment };
  } catch (error) {
    console.error('Error fetching appointment detail:', error);
    return { success: false as const, error: 'Failed to fetch appointment' };
  }
}

export async function recordCheckIn(appointmentId: string) {
  try {
    const existing = await prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!existing) return { success: false as const, error: 'Appointment not found' };
    if (existing.checkInAt) return { success: false as const, error: 'Already checked in' };

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        checkInAt: new Date(),
        status: existing.status === 'SCHEDULED' ? 'CONFIRMED' : existing.status,
      },
    });

    revalidatePath('/admin/appointments');
    return { success: true as const, data: updated };
  } catch (error) {
    console.error('Error recording check-in:', error);
    return { success: false as const, error: 'Failed to record check-in' };
  }
}

export async function recordCheckOut(appointmentId: string) {
  try {
    const existing = await prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!existing) return { success: false as const, error: 'Appointment not found' };
    if (!existing.checkInAt) return { success: false as const, error: 'Patient must check in first' };
    if (existing.checkOutAt) return { success: false as const, error: 'Already checked out' };

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        checkOutAt: new Date(),
        status: 'COMPLETED',
      },
    });

    revalidatePath('/admin/appointments');
    return { success: true as const, data: updated };
  } catch (error) {
    console.error('Error recording check-out:', error);
    return { success: false as const, error: 'Failed to record check-out' };
  }
}

export async function recordEngage(appointmentId: string) {
  try {
    const existing = await prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!existing) return { success: false as const, error: 'Appointment not found' };
    if (!existing.checkInAt) return { success: false as const, error: 'Patient must check in first' };
    if (existing.engagedAt) return { success: false as const, error: 'Already engaged' };
    if (existing.checkOutAt) return { success: false as const, error: 'Already checked out' };

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        engagedAt: new Date(),
        status: 'IN_CONSULTATION',
      },
    });

    revalidatePath('/admin/appointments');
    return { success: true as const, data: updated };
  } catch (error) {
    console.error('Error recording engage:', error);
    return { success: false as const, error: 'Failed to record engage' };
  }
}

export async function undoEngage(appointmentId: string) {
  try {
    const existing = await prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!existing) return { success: false as const, error: 'Appointment not found' };
    if (!existing.engagedAt) return { success: false as const, error: 'Not engaged yet' };
    if (existing.checkOutAt) {
      return { success: false as const, error: 'Undo check-out first before undoing engage' };
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        engagedAt: null,
        status: 'CONFIRMED',
      },
    });

    revalidatePath('/admin/appointments');
    return { success: true as const, data: updated };
  } catch (error) {
    console.error('Error undoing engage:', error);
    return { success: false as const, error: 'Failed to undo engage' };
  }
}

export async function undoCheckIn(appointmentId: string) {
  try {
    const existing = await prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!existing) return { success: false as const, error: 'Appointment not found' };
    if (!existing.checkInAt) return { success: false as const, error: 'Not checked in yet' };
    if (existing.engagedAt) {
      return { success: false as const, error: 'Undo engage first before undoing check-in' };
    }
    if (existing.checkOutAt) {
      return { success: false as const, error: 'Undo check-out first before undoing check-in' };
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        checkInAt: null,
        status: 'SCHEDULED',
      },
    });

    revalidatePath('/admin/appointments');
    return { success: true as const, data: updated };
  } catch (error) {
    console.error('Error undoing check-in:', error);
    return { success: false as const, error: 'Failed to undo check-in' };
  }
}

export async function undoCheckOut(appointmentId: string) {
  try {
    const existing = await prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!existing) return { success: false as const, error: 'Appointment not found' };
    if (!existing.checkOutAt) return { success: false as const, error: 'Not checked out yet' };

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        checkOutAt: null,
        status: existing.engagedAt ? 'IN_CONSULTATION' : 'CONFIRMED',
      },
    });

    revalidatePath('/admin/appointments');
    return { success: true as const, data: updated };
  } catch (error) {
    console.error('Error undoing check-out:', error);
    return { success: false as const, error: 'Failed to undo check-out' };
  }
}

export async function updateVisitNotes(
  appointmentId: string,
  data: { visitNotes?: string | null; diagnosis?: string | null }
) {
  try {
    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        visitNotes: data.visitNotes ?? null,
        diagnosis: data.diagnosis ?? null,
      },
    });

    revalidatePath('/admin/appointments');
    return { success: true as const, data: updated };
  } catch (error) {
    console.error('Error updating visit notes:', error);
    return { success: false as const, error: 'Failed to update visit notes' };
  }
}

export async function fetchPatientHistoryByPhone(phoneInput: string) {
  try {
    const phone = _normalizePhone(phoneInput);
    if (!phone) return { success: false as const, error: 'Invalid phone number' };

    const patients = await prisma.patient.findMany({
      where: { phone },
      include: {
        appointments: {
          orderBy: { date: 'desc' },
          include: {
            doctor: { select: { name: true, speciality: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return { success: true as const, data: { phone, patients } };
  } catch (error) {
    console.error('Error fetching patient history:', error);
    return { success: false as const, error: 'Failed to fetch patient history' };
  }
}

export async function fetchPatientHistoryById(patientId: string) {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        appointments: {
          orderBy: { date: 'desc' },
          include: {
            doctor: { select: { name: true, speciality: true } },
          },
        },
      },
    });

    if (!patient) return { success: false as const, error: 'Patient not found' };
    return { success: true as const, data: patient };
  } catch (error) {
    console.error('Error fetching patient by id:', error);
    return { success: false as const, error: 'Failed to fetch patient' };
  }
}