'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import useSWR from 'swr';
import { fetchAppointments } from '@/app/actions/admin';

interface Doctor {
  name: string;
  speciality: string;
  fee: number;
}

interface Appointment {
  id: string;
  patientName: string | null;
  email: string | null;
  phone: string | null;
  date: Date;
  time: string | null;
  status: string;
  doctorId: string;
  customerId: string | null;
  doctor: Doctor;
  createdAt: Date;
  updatedAt: Date;
}

const getStatusColor = (status: string) => {
  switch (status.toUpperCase()) {
    case 'CONFIRMED':
      return 'bg-green-100 text-green-800';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    case 'COMPLETED':
      return 'bg-blue-100 text-blue-800';
    case 'NO_SHOW':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg text-gray-900">
            {appointment.patientName || 'No Name'}
          </h3>
          <p className="text-sm text-gray-600">
            {appointment.time || format(new Date(appointment.date), 'HH:mm')}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
          {appointment.status}
        </span>
      </div>
      <div className="space-y-1">
        <p className="text-sm text-gray-900 font-semibold">
          with {appointment.doctor.name}
        </p>
        {appointment.phone && (
          <p className="text-sm text-gray-600">
            <span className="font-medium">Phone:</span> {appointment.phone}
          </p>
        )}
        {appointment.email && (
          <p className="text-sm text-gray-600 truncate">
            <span className="font-medium">Email:</span> {appointment.email}
          </p>
        )}
      </div>
    </Card>
  );
};

export default function TodayPage() {
  // Set up SWR for polling today's appointments
  const { data, error, isLoading } = useSWR<{
    success: boolean;
    error?: string;
    data?: {
      appointments: Appointment[];
      pagination: {
        total: number;
        page: number;
        pageSize: number;
        pageCount: number;
      };
    };
  }>(
    ['todayAppointments'],
    async ([key]) => {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      
      // Physiotherapy bookings have their own dedicated admin tab
      // (/admin/physiotherapy-bookings), so this clinic-wide "Today's
      // Appointments" view excludes them.
      return await fetchAppointments(1, 100, {
        startDate: startOfDay,
        endDate: endOfDay,
        excludeSpeciality: 'Physiotherapist',
      });
    },
    {
      refreshInterval: 30000, // Poll every 30 seconds
      revalidateOnFocus: true,
    }
  );


  // Render appointments
  const renderAppointments = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 bg-red-50 text-red-500 rounded-md">
          Error loading appointments. Please try again.
        </div>
      );
    }

    if (!data?.success || !data?.data?.appointments || data.data.appointments.length === 0) {
      return (
        <div className="p-4 bg-gray-50 text-gray-500 rounded-md text-center">
          No appointments scheduled for today.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.data.appointments.map((appointment: Appointment) => (
          <AppointmentCard key={appointment.id} appointment={appointment} />
        ))}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Today's Appointments</h1>
        <p className="text-sm text-gray-600">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>
      {renderAppointments()}
    </div>
  );
}
