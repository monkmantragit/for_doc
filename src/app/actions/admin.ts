'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { normalizePhone, normalizeNameKey } from '@/lib/patient';

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

export async function fetchAppointments(filters?: {
  startDate?: Date;
  endDate?: Date;
  doctorId?: string;
  status?: string;
}) {
  try {
    const where: any = {};

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

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
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
      }
    });

    return { success: true, data: appointments };
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return { success: false, error: 'Failed to fetch appointments' };
  }
}

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
      return { success: false, error: 'Appointment not found' };
    }

    return { success: true, data: appointment };
  } catch (error) {
    console.error('Error fetching appointment detail:', error);
    return { success: false, error: 'Failed to fetch appointment' };
  }
}

export async function recordCheckIn(appointmentId: string) {
  try {
    const existing = await prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!existing) return { success: false, error: 'Appointment not found' };
    if (existing.checkInAt) return { success: false, error: 'Already checked in' };

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        checkInAt: new Date(),
        status: existing.status === 'SCHEDULED' ? 'CONFIRMED' : existing.status,
      },
    });

    revalidatePath('/admin/appointments');
    return { success: true, data: updated };
  } catch (error) {
    console.error('Error recording check-in:', error);
    return { success: false, error: 'Failed to record check-in' };
  }
}

export async function recordCheckOut(appointmentId: string) {
  try {
    const existing = await prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!existing) return { success: false, error: 'Appointment not found' };
    if (!existing.checkInAt) return { success: false, error: 'Patient must check in first' };
    if (existing.checkOutAt) return { success: false, error: 'Already checked out' };

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        checkOutAt: new Date(),
        status: 'COMPLETED',
      },
    });

    revalidatePath('/admin/appointments');
    return { success: true, data: updated };
  } catch (error) {
    console.error('Error recording check-out:', error);
    return { success: false, error: 'Failed to record check-out' };
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
    return { success: true, data: updated };
  } catch (error) {
    console.error('Error updating visit notes:', error);
    return { success: false, error: 'Failed to update visit notes' };
  }
}

export async function fetchPatientHistoryByPhone(phoneInput: string) {
  try {
    const phone = normalizePhone(phoneInput);
    if (!phone) return { success: false, error: 'Invalid phone number' };

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

    return { success: true, data: { phone, patients } };
  } catch (error) {
    console.error('Error fetching patient history:', error);
    return { success: false, error: 'Failed to fetch patient history' };
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

    if (!patient) return { success: false, error: 'Patient not found' };
    return { success: true, data: patient };
  } catch (error) {
    console.error('Error fetching patient by id:', error);
    return { success: false, error: 'Failed to fetch patient' };
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

    // Calculate revenue by doctor
    const revenueMap = new Map<string, { id: string; name: string; revenue: number }>();
    
    completedAppointmentsWithFees.forEach(apt => {
      if (apt.doctor) {
        const doctorId = apt.doctor.id;
        const fee = apt.doctor.fee || 0;
        const existing = revenueMap.get(doctorId);
        
        if (existing) {
          existing.revenue += fee;
        } else {
          revenueMap.set(doctorId, {
            id: doctorId,
            name: apt.doctor.name,
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
      CONFIRMED: ['COMPLETED', 'CANCELLED', 'NO_SHOW'],
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