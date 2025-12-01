import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  parse, 
  format, 
  addMinutes, 
  isBefore, 
  isAfter, 
  setHours, 
  setMinutes, 
  isToday, 
  startOfToday, 
  startOfDay, 
  endOfDay,
  addDays,
  getDay,
  isValid
} from 'date-fns';
import { convertToIST, formatISTDate, isSameDayInIST } from '@/lib/dateUtils';

const DEFAULT_CHECK_RANGE_DAYS = 30;

// Helper to generate potential time slots based on schedule
interface PotentialSlot {
  time: string; // HH:mm format
  isBreak?: boolean; // Optional: if the slot itself is a break
}

function generateSlots(
  startTimeStr: string,
  endTimeStr: string,
  slotDurationMinutes: number,
  breakStartTimeStr?: string | null,
  breakEndTimeStr?: string | null
): PotentialSlot[] {
  const slots: PotentialSlot[] = [];
  const startMinutes = timeToMinutes(startTimeStr);
  const endMinutes = timeToMinutes(endTimeStr);
  const breakStartMinutes = breakStartTimeStr ? timeToMinutes(breakStartTimeStr) : null;
  const breakEndMinutes = breakEndTimeStr ? timeToMinutes(breakEndTimeStr) : null;

  if (startMinutes === null || endMinutes === null || startMinutes >= endMinutes) {
    return [];
  }

  let currentSlotStartMinutes = startMinutes;
  while (currentSlotStartMinutes < endMinutes) {
    const slotStartHours = Math.floor(currentSlotStartMinutes / 60);
    const slotStartMins = currentSlotStartMinutes % 60;
    const slotTime = `${String(slotStartHours).padStart(2, '0')}:${String(slotStartMins).padStart(2, '0')}`;

    const currentSlotEndMinutes = currentSlotStartMinutes + slotDurationMinutes;

    let isDuringBreak = false;
    if (breakStartMinutes !== null && breakEndMinutes !== null) {
      // Check if the slot (start to end) overlaps with the break (start to end)
      // Overlap condition: (SlotStart < BreakEnd) and (SlotEnd > BreakStart)
      if (currentSlotStartMinutes < breakEndMinutes && currentSlotEndMinutes > breakStartMinutes) {
        isDuringBreak = true;
      }
    }

    if (!isDuringBreak) {
      slots.push({ time: slotTime });
    } else {
      // Optionally, you could mark it as a break slot: slots.push({ time: slotTime, isBreak: true });
      // For now, we just skip adding it to potential bookable slots
    }
    currentSlotStartMinutes += slotDurationMinutes; // Move to the next slot start
  }
  return slots;
}

// Helper to convert HH:MM to minutes from midnight (ensure this is defined or imported)
function timeToMinutes(timeStr: string | null): number | null {
  if (!timeStr || !timeStr.includes(':')) return null;
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    console.warn(`[timeToMinutes] Invalid time format: ${timeStr}`);
    return null;
  }
  return hours * 60 + minutes;
}

// Helper utility to check IST midnight transitions
function getISTDateRange(date: Date) {
  // Convert to IST for consistent date handling
  const istDate = convertToIST(date);
  
  // Create a date at midnight IST on the specified date
  const midnightIST = new Date(
    istDate.getFullYear(),
    istDate.getMonth(),
    istDate.getDate(),
    0, 0, 0, 0
  );
  
  // Get UTC equivalents for database queries (convert back to UTC)
  const startUTC = new Date(midnightIST.getTime() - 5.5 * 60 * 60 * 1000); // 5.5 hours earlier
  const endUTC = new Date(startUTC.getTime() + 24 * 60 * 60 * 1000); // 24 hours later
  
  console.log(`[getISTDateRange] Converting date range:`, {
    inputDate: date.toISOString(),
    istDate: istDate.toISOString(),
    midnightIST: midnightIST.toISOString(),
    startUTC: startUTC.toISOString(),
    endUTC: endUTC.toISOString(),
  });
  
  return { startUTC, endUTC, istDate };
}

export async function GET(request: Request) {
  // LOUD DEBUG LOG: Confirm this endpoint is being called
  const url = new URL(request.url);
  const doctorIdParam = url.searchParams.get('doctorId');
  const dateParam = url.searchParams.get('date');

  const doctorId = doctorIdParam;
  console.log(`[Available Slots API] === HIT ENDPOINT === doctorId=${doctorId} date=${dateParam}`);

  try {
    if (!doctorId) {
      return NextResponse.json({ disabledDates: null, error: 'Doctor ID is required' }, { status: 400 });
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: { name: true }
    });

    if (!doctor) {
      return NextResponse.json({ disabledDates: null, error: 'Doctor not found' }, { status: 404 });
    }

    // --- General Disable Calculations ---
    // 1. Get working days for the doctor
    const schedules = await prisma.doctorSchedule.findMany({
      where: {
        doctorId: doctorId
      },
      select: {
        dayOfWeek: true,
        isActive: true
      }
    });

    // Create a Set of active working days
    const workingDays = new Set(
      schedules
        .filter(s => s.isActive)
        .map(s => s.dayOfWeek)
    );
    console.log(`[Available Slots API] Doctor works on days:`, Array.from(workingDays));

    // 2. Get blocked dates from SpecialDate
    const specialDates = await prisma.specialDate.findMany({
      where: {
        OR: [
          { doctorId: null }, // Global blocks
          { doctorId: doctorId } // Doctor-specific blocks
        ],
        type: {
          in: ['BLOCKED', 'UNAVAILABLE']
        }
      },
      select: {
        date: true,
        type: true,
        doctorId: true
      }
    });

    const blockedDateStrings = new Set(
      specialDates.map((d) => {
        try {
          // Format the date in IST timezone
          return formatISTDate(d.date);
        } catch (e) {
          console.error("[Available Slots API] Error formatting special date:", d.date, e);
          return null;
        }
      }).filter((d): d is string => d !== null)
    );
    console.log(`[Available Slots API] Blocked date strings (SpecialDate) in IST:`, Array.from(blockedDateStrings));

    // 3. Calculate disabled dates within a range
    const disabledDates: string[] = [];
    const today = startOfToday();
    const rangeEnd = addDays(today, DEFAULT_CHECK_RANGE_DAYS);

    for (let day = today; isBefore(day, rangeEnd); day = addDays(day, 1)) {
      const dayOfWeek = getDay(day); // date-fns getDay() is 0=Sun
      const dateString = formatISTDate(day);
      let isDisabled = false;
      let reason = '';

      // Check 1: Is it a non-working day?
      if (!workingDays.has(dayOfWeek)) {
        isDisabled = true;
        reason = 'Non-working day';
      }
      // Check 2: Is it a globally or specifically blocked date?
      else if (blockedDateStrings.has(dateString)) {
        isDisabled = true;
        reason = 'Blocked (Special Date)';
      }

      if (isDisabled) {
        disabledDates.push(dateString);
      }
    }
      
    console.log(`[Available Slots API] Calculated future disabled dates in IST:`, disabledDates);

    // Return just the general data if no date is specified
    if (!dateParam) {
      return NextResponse.json({ 
        disabledDates,
        doctorName: doctor.name,
        workingDays: Array.from(workingDays),
      });
    }

    // --- Specific Date Processing ---
    // Parse the specific date for slot generation
    const selectedDate = new Date(dateParam);
    
    // For date debugging
    const { startUTC, endUTC, istDate } = getISTDateRange(selectedDate);
    console.log(`[Available Slots API] Request for specific date: ${dateParam}`, {
      originalDate: selectedDate,
      originalDateISO: selectedDate.toISOString(),
      istDate: istDate,
      istDateISO: istDate.toISOString(), 
      dateInIST: formatISTDate(selectedDate),
      selectedDateStart: startUTC.toISOString(),
      selectedDateEnd: endUTC.toISOString(),
      message: `Processing request for ${formatISTDate(selectedDate)} in IST timezone`
    });

    // Extract the dateString for checking (formatted in IST timezone)
    const dateStringForCheck = formatISTDate(selectedDate);

    // Check 1: Is this a generally disabled date?
    if (disabledDates.includes(dateStringForCheck)) {
      console.log(`[Available Slots API] Date ${dateStringForCheck} (IST) is generally disabled.`);
      return NextResponse.json({ 
        disabledDates, 
        slots: [],
        error: `This date is unavailable in the doctor's schedule (IST: ${dateStringForCheck})`
      });
    }

    // Check 2: Doctor's schedule active on this day? Use IST day.
    const dayOfWeek = istDate.getDay(); // Use the IST date's day of week (0-6, Sun-Sat)
    
    const schedule = await prisma.doctorSchedule.findFirst({
      where: {
        doctorId: doctorId,
        dayOfWeek: dayOfWeek, // Use the correct IST day of week
        isActive: true,
      },
    });
    if (!schedule) {
      // Log using the correct day number based on IST
      console.log(`[Available Slots API] No active schedule found for doctor ${doctorId} on date ${dateStringForCheck} (IST) (Day ${dayOfWeek} in IST).`);
      return NextResponse.json({ 
        disabledDates, 
        slots: [],
        error: `Doctor is not available on ${format(istDate, 'EEEE')}s (IST)` // Error message uses istDate already
      });
    }

    // Check 3: Is it blocked by a SpecialDate (global or specific)?
    // Replace date range query with IST-based comparison
    const allSpecialDates = await prisma.specialDate.findMany({
      where: {
        OR: [
          { doctorId: null }, // Global blocks
          { doctorId: doctorId } // Doctor-specific blocks
        ]
      }
    });

    // Filter in memory using isSameDayInIST for accurate timezone comparison
    const specialDateOrBlock = allSpecialDates.find(specialDate => 
      isSameDayInIST(specialDate.date, selectedDate) && 
      (specialDate.type === 'BLOCKED' || specialDate.type === 'UNAVAILABLE')
    );
      
    if (specialDateOrBlock) {
      // Convert the date to IST for logging
      const blockDateIST = convertToIST(specialDateOrBlock.date);
      const selectedDateIST = convertToIST(selectedDate);
      
      // Log the actual date from the database for debugging
      console.log(`[Available Slots API] Found blocking SpecialDate:`, {
        id: specialDateOrBlock.id,
        date: specialDateOrBlock.date.toISOString(),
        dateInIST: blockDateIST.toISOString(),
        selectedDate: selectedDate.toISOString(),
        selectedDateIST: selectedDateIST.toISOString(),
        name: specialDateOrBlock.name,
        type: specialDateOrBlock.type,
        doctorId: specialDateOrBlock.doctorId
      });
        
      const reason = specialDateOrBlock.doctorId 
                    ? `Doctor unavailable: ${specialDateOrBlock.reason || specialDateOrBlock.name}`
                    : `Clinic unavailable: ${specialDateOrBlock.name} (${specialDateOrBlock.type})`;
                    
      const blockedDateFormatted = formatISTDate(specialDateOrBlock.date);
      console.log(`[Available Slots API] Block found via SpecialDate: ${reason} on ${blockedDateFormatted} (IST)`);
      
      return NextResponse.json({ 
        disabledDates, 
        slots: [],
        error: `${reason} on ${blockedDateFormatted} (IST)` 
      }); 
    }

    // Find any TIME_BLOCK entries for this date
    const timeBlocks = allSpecialDates.filter(specialDate => 
      isSameDayInIST(specialDate.date, selectedDate) && 
      specialDate.type === 'TIME_BLOCK'
    );
    
    // Create a structure to hold blocked times
    const blockedTimeRanges: Array<{start: string, end: string, reason: string}> = [];
    
    // Parse time blocks from the reason field (format: TIME:09:00-12:00:Meeting)
    if (timeBlocks.length > 0) {
      console.log(`[Available Slots API] Found ${timeBlocks.length} time-specific blocks for ${formatISTDate(selectedDate)} (IST)`);
      
      timeBlocks.forEach(block => {
        if (block.reason && block.reason.startsWith('TIME:')) {
          try {
            // Extract time range from format TIME:START-END:REASON
            const timePattern = /TIME:(\d{2}:\d{2})-(\d{2}:\d{2}):(.*)/;
            const match = block.reason.match(timePattern);
            
            if (match && match.length >= 3) {
              const [_, startTime, endTime, blockReason] = match;
              blockedTimeRanges.push({
                start: startTime,
                end: endTime,
                reason: blockReason || block.name || 'Time Block'
              });
              
              console.log(`[Available Slots API] Parsed time block: ${startTime} - ${endTime}: ${blockReason}`);
            }
          } catch (err) {
            console.error(`[Available Slots API] Error parsing time block reason: ${block.reason}`, err);
          }
        }
      });
    }

    console.log(`[Available Slots API] Date ${dateStringForCheck} is valid. Proceeding to generate slots.`);
    
    // --- Generate Slots ---
    console.log("[Available Slots API] Using schedule object:", schedule);

    // Fetch existing appointments for the selected doctor on the selected date
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctorId!, // doctorId is validated earlier
        date: {
          gte: startUTC,
          lt: endUTC,
        },
        status: {
          in: ['SCHEDULED', 'CONFIRMED']
        }
      },
      select: {
        date: true,
        time: true
      },
    });

    console.log(`[Available Slots API] Found ${existingAppointments.length} existing (SCHEDULED/CONFIRMED) appointments on ${formatISTDate(selectedDate)} (IST) for doctor ${doctorId}:`, existingAppointments.map(a => ({date: a.date, time: a.time})));

    if (!schedule) { // Should have been checked earlier, but as a safeguard
        console.error('[Available Slots API] CRITICAL: Schedule object is null or undefined at slot generation point.');
        return NextResponse.json({ disabledDates, slots: [], error: 'Doctor schedule not found for slot generation.' });
    }
    
    // Generate potential slots based on doctor's schedule
    const potentialSlots: PotentialSlot[] = generateSlots(
      schedule.startTime,
      schedule.endTime,
      schedule.slotDuration,
      schedule.breakStart,
      schedule.breakEnd
    );
    console.log(`[Available Slots API] Generated ${potentialSlots.length} potential slots for doctor ${doctorId} on ${dateStringForCheck}. Schedule: Start ${schedule.startTime}, End ${schedule.endTime}, Slot ${schedule.slotDuration}min, Break: ${schedule.breakStart}-${schedule.breakEnd}`);
    
    // Filter out booked slots
    const availableSlots = potentialSlots.filter((slot: PotentialSlot) => {
      if (slot.isBreak) return false; // Explicitly skip if marked as a break slot by generateSlots

      const slotTimeStr = slot.time;
      const slotStartDateTime = parse(slotTimeStr, 'HH:mm', istDate); 
      const slotEndDateTime = addMinutes(slotStartDateTime, schedule.slotDuration);

      // Check if slot overlaps with any time block
      const isBlockedByTimeBlock = blockedTimeRanges.some(block => {
        const blockStartDateTime = parse(block.start, 'HH:mm', istDate);
        const blockEndDateTime = parse(block.end, 'HH:mm', istDate);
        
        // Check if there's any overlap between the slot and the block
        const overlap = isBefore(slotStartDateTime, blockEndDateTime) && 
                        isBefore(blockStartDateTime, slotEndDateTime);
        
        if (overlap) {
          console.log(`[Available Slots API] Slot ${slotTimeStr} overlaps with time block ${block.start}-${block.end}: ${block.reason}`);
        }
        return overlap;
      });
      
      if (isBlockedByTimeBlock) return false;

      const isBooked = existingAppointments.some((appt) => {
        if (!appt.time) return false;
        
        // Ensure appointment date is correctly used for parsing its time
        // The appt.date from DB is UTC. Convert it to IST for consistent comparison with slot time.
        const apptDateInIST = convertToIST(appt.date); 
        const apptStartDateTime = parse(appt.time, 'HH:mm', apptDateInIST);
        
        // Assume appointment duration is also based on the doctor's slotDuration for this check
        const apptEndDateTime = addMinutes(apptStartDateTime, schedule.slotDuration); 

        const overlap = isBefore(slotStartDateTime, apptEndDateTime) && isAfter(slotEndDateTime, apptStartDateTime);
        if (overlap) {
          console.log(`[Available Slots API] Slot ${slotTimeStr} (parsed with istDate ${istDate.toISOString()}) overlaps with existing appointment at ${appt.time} on ${formatISTDate(appt.date)} (parsed with apptDateInIST ${apptDateInIST.toISOString()})`);
        }
        return overlap;
      });
      return !isBooked;
    });

    // Custom override: remove specific slots only for the given doctor ID
    try {
      const targetDoctorId = '2e3de056-4948-4038-982f-74338d1f1e62';
      if (doctorId === targetDoctorId) {
        console.log(`[Available Slots API] === FILTERING SLOTS FOR Dr. Naveen & team ===`);
        const blockedTimes = new Set(['11:35', '11:45', '11:55']);
        const originalLength = availableSlots.length;
        for (let i = availableSlots.length - 1; i >= 0; i--) {
          if (blockedTimes.has(availableSlots[i].time)) {
            console.log(`[Available Slots API] REMOVING slot: ${availableSlots[i].time}`);
            availableSlots.splice(i, 1);
          }
        }
        console.log(`[Available Slots API] Removed ${originalLength - availableSlots.length} blocked slots for Dr. Naveen & team`);
      }
    } catch (e) {
      console.error('[Available Slots API] Failed to apply custom slot filter for target doctor:', e);
    }

    console.log(`[Available Slots API] Generated ${availableSlots.length} available slots for ${dateStringForCheck}`);
    if (availableSlots.length === 0) {
      console.log(`[Available Slots API] WARNING: No slots generated! Schedule:`, schedule);
    }
    
    return NextResponse.json({ 
        disabledDates, 
        slots: availableSlots.map(s => s.time), // Return only time strings
        doctorName: doctor?.name 
    });

  } catch (error) {
    console.error('[Available Slots API] Error:', error);
    // Avoid exposing internal error details unless necessary
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: 'Internal Server Error', details: message }, { status: 500 });
  }
}