'use client';

import React, { useEffect, useState } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';
import {
  fetchAppointments,
  updateAppointmentStatus,
  createAppointment,
  updateAppointment,
  fetchDoctors,
  fetchAllAppointmentsForCalendar,
  deleteAppointmentAction,
  recordCheckIn,
  recordCheckOut,
  recordEngage,
  undoCheckIn,
  undoCheckOut,
  undoEngage
} from '@/app/actions/admin';
import { toast } from 'react-hot-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, CalendarIcon, ListIcon, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2, Trash2, LogIn, LogOut, FileText, Undo2, Stethoscope, Search, ArrowUpDown, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AppointmentDetailDrawer } from '@/components/admin/AppointmentDetailDrawer';
import { Pagination, PaginationData } from '@/components/admin/Pagination';
import AdminCalendar from '@/components/AdminCalendar';
import AppointmentModal from '@/components/AppointmentModal';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';

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
  checkInAt: Date | null;
  engagedAt: Date | null;
  checkOutAt: Date | null;
  visitNotes: string | null;
  diagnosis: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const SORT_OPTIONS = [
  { key: 'upcoming', label: 'Upcoming first', sortBy: 'upcoming', sortOrder: 'desc' },
  { key: 'date_desc', label: 'Appointment date (newest)', sortBy: 'date', sortOrder: 'desc' },
  { key: 'date_asc', label: 'Appointment date (oldest)', sortBy: 'date', sortOrder: 'asc' },
  { key: 'booked', label: 'Recently booked', sortBy: 'createdAt', sortOrder: 'desc' },
  { key: 'name', label: 'Patient name (A–Z)', sortBy: 'patientName', sortOrder: 'asc' },
  { key: 'status', label: 'Status', sortBy: 'status', sortOrder: 'asc' },
] as const;

type SortKey = (typeof SORT_OPTIONS)[number]['key'];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [calendarAppointments, setCalendarAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');

  // List view: server-side search + sort + optional single-date filter.
  // Search runs only when submitted (Enter / button), not on every keystroke.
  const [searchTerm, setSearchTerm] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('upcoming');
  const activeSort = SORT_OPTIONS.find((o) => o.key === sortKey) ?? SORT_OPTIONS[0];
  const [listDate, setListDate] = useState<string>(''); // 'yyyy-MM-dd' or ''
  
  // Add pagination state
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    pageSize: 10,
    pageCount: 0
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isNewAppointment, setIsNewAppointment] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [prefilledTimeForModal, setPrefilledTimeForModal] = useState<string | undefined>(undefined);
  const [selectedMonth, setSelectedMonth] = useState<Date>(startOfMonth(new Date()));

  // State for delete confirmation dialog
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [appointmentIdToDelete, setAppointmentIdToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false); // For loading state on confirm button

  // Check-in / Check-out + visit-notes drawer
  const [actingOnId, setActingOnId] = useState<string | null>(null);
  const [drawerAppointmentId, setDrawerAppointmentId] = useState<string | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

  const handleCheckIn = async (appointmentId: string) => {
    setActingOnId(appointmentId);
    const res = await recordCheckIn(appointmentId);
    setActingOnId(null);
    if (res.success) {
      toast.success('Checked in');
      loadInitialData();
    } else {
      toast.error(res.error || 'Failed');
    }
  };

  const handleCheckOut = async (appointmentId: string) => {
    setActingOnId(appointmentId);
    const res = await recordCheckOut(appointmentId);
    setActingOnId(null);
    if (res.success) {
      toast.success('Checked out');
      loadInitialData();
    } else {
      toast.error(res.error || 'Failed');
    }
  };

  const handleUndoCheckIn = async (appointmentId: string) => {
    setActingOnId(appointmentId);
    const res = await undoCheckIn(appointmentId);
    setActingOnId(null);
    if (res.success) {
      toast.success('Check-in reverted');
      loadInitialData();
    } else {
      toast.error(res.error || 'Failed');
    }
  };

  const handleUndoCheckOut = async (appointmentId: string) => {
    setActingOnId(appointmentId);
    const res = await undoCheckOut(appointmentId);
    setActingOnId(null);
    if (res.success) {
      toast.success('Check-out reverted');
      loadInitialData();
    } else {
      toast.error(res.error || 'Failed');
    }
  };

  const handleEngage = async (appointmentId: string) => {
    setActingOnId(appointmentId);
    const res = await recordEngage(appointmentId);
    setActingOnId(null);
    if (res.success) {
      toast.success('Patient engaged');
      loadInitialData();
    } else {
      toast.error(res.error || 'Failed');
    }
  };

  const handleUndoEngage = async (appointmentId: string) => {
    setActingOnId(appointmentId);
    const res = await undoEngage(appointmentId);
    setActingOnId(null);
    if (res.success) {
      toast.success('Engage reverted');
      loadInitialData();
    } else {
      toast.error(res.error || 'Failed');
    }
  };

  const openDetailDrawer = (id: string) => {
    setDrawerAppointmentId(id);
    setIsDetailDrawerOpen(true);
  };

  const fmtTime = (d: Date | string | null) =>
    d ? format(new Date(d), 'h:mm a') : '—';

  // Run the search only when the user submits it (Enter or the Search button).
  const runSearch = () => {
    const next = searchTerm.trim();
    setSubmittedSearch(next);
    setPagination((prev) => (prev.page === 1 ? prev : { ...prev, page: 1 }));
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSubmittedSearch('');
    setPagination((prev) => (prev.page === 1 ? prev : { ...prev, page: 1 }));
  };

  // A new sort or date filter should always start from page 1.
  useEffect(() => {
    setPagination((prev) => (prev.page === 1 ? prev : { ...prev, page: 1 }));
  }, [sortKey, listDate]);

  useEffect(() => {
    loadInitialData();
    // Reload when page, page size, month, view, submitted search, sort or date changes
  }, [pagination.page, pagination.pageSize, selectedMonth, viewMode, submittedSearch, sortKey, listDate]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      let appointmentResult;
      // Physiotherapy bookings live in their own admin tab (/admin/physiotherapy-bookings),
      // so this Appointments tab should NOT include them. Every fetch call here
      // passes excludeSpeciality so the lists/calendars stay strictly orthopedic.
      if (viewMode === 'list') {
        // The list shows all dates (upcoming first by default) with server-side
        // search + sort. An optional single-date filter scopes it to one day.
        const dayFilter = listDate
          ? { startDate: startOfDay(new Date(`${listDate}T00:00:00`)), endDate: endOfDay(new Date(`${listDate}T00:00:00`)) }
          : {};
        appointmentResult = await fetchAppointments(
          pagination.page,
          pagination.pageSize,
          {
            excludeSpeciality: 'Physiotherapist',
            search: submittedSearch || undefined,
            sortBy: activeSort.sortBy,
            sortOrder: activeSort.sortOrder,
            ...dayFilter,
          }
        );
      } else {
        appointmentResult = await fetchAppointments(pagination.page, pagination.pageSize, {
            startDate: startOfMonth(selectedMonth),
            endDate: endOfMonth(selectedMonth),
            excludeSpeciality: 'Physiotherapist',
        });
      }
      const [calendarAppointmentResult, doctorResult] = await Promise.all([
        fetchAllAppointmentsForCalendar({ excludeSpeciality: 'Physiotherapist' }),
        fetchDoctors()
      ]);

      if (appointmentResult.success && appointmentResult.data) {
        setAppointments(appointmentResult.data.appointments);
        setPagination(appointmentResult.data.pagination);
      } else {
        toast.error(appointmentResult.error || 'Failed to load appointments list');
      }

      if (calendarAppointmentResult.success && calendarAppointmentResult.data) {
        setCalendarAppointments(calendarAppointmentResult.data);
      } else {
        toast.error(calendarAppointmentResult.error || 'Failed to load calendar appointments');
        setCalendarAppointments([]);
      }

      if (doctorResult.success && doctorResult.data) {
        setDoctors(doctorResult.data);
      } else {
        toast.error(doctorResult.error || 'Failed to load doctors');
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load page data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAppointments = async () => {
    try {
      const result = await fetchAppointments(pagination.page, pagination.pageSize, {
        excludeSpeciality: 'Physiotherapist',
      });
      if (result.success && result.data) {
        setAppointments(result.data.appointments);
        setPagination(result.data.pagination);
      } else {
        toast.error(result.error || 'Failed to load appointments');
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast.error('Failed to load appointments');
    }
  };

  // Add pagination navigation handlers
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newSize: number) => {
    setPagination(prev => ({ ...prev, pageSize: newSize, page: 1 }));
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      setUpdatingStatus(appointmentId);
      const result = await updateAppointmentStatus(appointmentId, newStatus);
      if (result.success) {
        toast.success('Appointment status updated successfully');
        loadAppointments();
      } else {
        toast.error(result.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update appointment status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SCHEDULED':
        return 'bg-[#F3E8FF] text-[#8B5C9E] border border-[#E9D5FF]';
      case 'CONFIRMED':
        return 'bg-[#8B5C9E] text-white';
      case 'IN_CONSULTATION':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'COMPLETED':
        return 'bg-[#8B5C9E]/80 text-white';
      case 'CANCELLED':
        // MODIFICATION: Changed to dull grey styling
        return 'bg-gray-100 text-gray-500 border border-gray-200 opacity-75'; 
      case 'NO_SHOW':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SCHEDULED':
        return '🕒';
      case 'CONFIRMED':
        return '✓';
      case 'IN_CONSULTATION':
        return '🩺';
      case 'COMPLETED':
        return '✔️';
      case 'CANCELLED':
        return '✕';
      case 'NO_SHOW':
        return '⚠️';
      default:
        return '•';
    }
  };

  const getAvailableStatuses = (currentStatus: string) => {
    const allStatuses = ['SCHEDULED', 'CONFIRMED', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
    return allStatuses.filter(status => status !== currentStatus);
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    setAppointmentIdToDelete(appointmentId);
    setIsConfirmDeleteDialogOpen(true);
  };

  // Actual deletion logic to be called by the confirmation dialog
  const executeDeleteAppointment = async () => {
    if (!appointmentIdToDelete) return;

    setIsDeleting(true);
    const toastId = toast.loading('Deleting appointment...');
    try {
      const result = await deleteAppointmentAction(appointmentIdToDelete);
      if (result.success) {
        toast.success(result.message || 'Appointment deleted successfully', { id: toastId });
        loadInitialData(); // Refresh data
      } else {
        toast.error(result.error || 'Failed to delete appointment', { id: toastId });
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error('An error occurred while deleting the appointment.', { id: toastId });
    }
    setIsConfirmDeleteDialogOpen(false);
    setAppointmentIdToDelete(null);
    setIsDeleting(false);
  };

  const columns = [
    {
      header: 'Patient',
      accessorKey: 'patientName',
      cell: (appointment: Appointment) => (
        <div className={appointment.status === 'CANCELLED' ? 'text-gray-500 opacity-75' : ''}>
          <div className={`font-medium ${appointment.status === 'CANCELLED' ? 'text-gray-500' : 'text-gray-900'}`}>
            {appointment.patientName || 'N/A'}
          </div>
          <div className="text-sm">
            {appointment.email && (
              <div className="truncate">{appointment.email}</div>
            )}
            {appointment.phone && (
              <div>{appointment.phone}</div>
            )}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Doctor',
      accessorKey: 'doctor',
      hideOnMobile: true,
      cell: (appointment: Appointment) => (
        <div className={appointment.status === 'CANCELLED' ? 'text-gray-500 opacity-75' : ''}>
          <div className={`font-medium ${appointment.status === 'CANCELLED' ? 'text-gray-500' : 'text-gray-900'}`}>{appointment.doctor?.name}</div>
          <div className="text-sm">{appointment.doctor?.speciality}</div>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Date & Time',
      accessorKey: 'date',
      cell: (appointment: Appointment) => (
        <div className={appointment.status === 'CANCELLED' ? 'text-gray-500 opacity-75' : ''}>
          <div
            className={`font-medium ${appointment.status === 'CANCELLED' ? 'text-gray-500' : 'text-gray-900'}`}
            title={format(new Date(appointment.date), 'MMM d, yyyy')}
          >
            {format(new Date(appointment.date), 'MMM d')}
          </div>
          <div className="text-sm">{appointment.time}</div>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (appointment: Appointment) => (
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
              appointment.status
            )}`}
          >
            <span className="mr-1">{getStatusIcon(appointment.status)}</span>
            {appointment.status}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0 hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:opacity-50"
                disabled={updatingStatus === appointment.id}
              >
                {updatingStatus === appointment.id ? (
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-primary" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-[160px] p-2 bg-white shadow-lg rounded-md border border-primary/10"
            >
              {getAvailableStatuses(appointment.status).map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => handleStatusChange(appointment.id, status)}
                  className={`flex items-center px-3 py-2 text-sm rounded-md cursor-pointer mb-1 last:mb-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                    status === 'CANCELLED' || status === 'NO_SHOW'
                      ? 'text-red-600 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700'
                      : 'text-primary hover:bg-primary/5 hover:text-primary focus:bg-primary/5 focus:text-primary'
                  }`}
                >
                  <span className="mr-2">{getStatusIcon(status)}</span>
                  Change to {status.toLowerCase()}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Fee',
      accessorKey: 'doctor.fee',
      hideOnMobile: true,
      cell: (appointment: Appointment) => {
        const fee = appointment.doctor?.fee ?? 0;
        return (
          <div className={`font-medium ${appointment.status === 'CANCELLED' ? 'text-gray-500 opacity-75' : 'text-gray-900'}`}>
            ₹{fee.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        );
      },
      sortable: true,
    },
    {
      header: 'Visit progress',
      accessorKey: 'checkInAt',
      cell: (appointment: Appointment) => (
        <div className="flex flex-col gap-1 min-w-[120px]">
          {/* Check-in */}
          {appointment.checkInAt ? (
            <span className="text-xs text-green-700 inline-flex items-center gap-1">
              <LogIn className="w-3 h-3" />
              {fmtTime(appointment.checkInAt)}
              <button
                type="button"
                title="Undo check-in"
                disabled={actingOnId === appointment.id || !!appointment.engagedAt || !!appointment.checkOutAt}
                onClick={() => handleUndoCheckIn(appointment.id)}
                className="ml-1 p-0.5 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Undo2 className="w-3 h-3" />
              </button>
            </span>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              disabled={
                actingOnId === appointment.id ||
                ['CANCELLED', 'NO_SHOW'].includes(appointment.status)
              }
              onClick={() => handleCheckIn(appointment.id)}
            >
              <LogIn className="w-3 h-3 mr-1" />
              Check in
            </Button>
          )}

          {/* Engage */}
          {appointment.engagedAt ? (
            <span className="text-xs text-amber-700 inline-flex items-center gap-1">
              <Stethoscope className="w-3 h-3" />
              {fmtTime(appointment.engagedAt)}
              <button
                type="button"
                title="Undo engage"
                disabled={actingOnId === appointment.id || !!appointment.checkOutAt}
                onClick={() => handleUndoEngage(appointment.id)}
                className="ml-1 p-0.5 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Undo2 className="w-3 h-3" />
              </button>
            </span>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              disabled={
                actingOnId === appointment.id ||
                !appointment.checkInAt ||
                !!appointment.checkOutAt ||
                ['CANCELLED', 'NO_SHOW'].includes(appointment.status)
              }
              onClick={() => handleEngage(appointment.id)}
            >
              <Stethoscope className="w-3 h-3 mr-1" />
              Engage
            </Button>
          )}

          {/* Check-out */}
          {appointment.checkOutAt ? (
            <span className="text-xs text-blue-700 inline-flex items-center gap-1">
              <LogOut className="w-3 h-3" />
              {fmtTime(appointment.checkOutAt)}
              <button
                type="button"
                title="Undo check-out"
                disabled={actingOnId === appointment.id}
                onClick={() => handleUndoCheckOut(appointment.id)}
                className="ml-1 p-0.5 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700 disabled:opacity-30"
              >
                <Undo2 className="w-3 h-3" />
              </button>
            </span>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              disabled={
                actingOnId === appointment.id ||
                !appointment.checkInAt ||
                ['CANCELLED', 'NO_SHOW'].includes(appointment.status)
              }
              onClick={() => handleCheckOut(appointment.id)}
            >
              <LogOut className="w-3 h-3 mr-1" />
              Check out
            </Button>
          )}
        </div>
      ),
      sortable: false,
    },
    {
      header: 'Created',
      accessorKey: 'createdAt',
      hideOnMobile: true,
      cell: (appointment: Appointment) => (
        <div className="text-xs text-gray-500">
          {format(new Date(appointment.createdAt), 'MMM d')}
          <div>{format(new Date(appointment.createdAt), 'h:mm a')}</div>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Updated',
      accessorKey: 'updatedAt',
      hideOnMobile: true,
      cell: (appointment: Appointment) => (
        <div className="text-xs text-gray-500">
          {format(new Date(appointment.updatedAt), 'MMM d')}
          <div>{format(new Date(appointment.updatedAt), 'h:mm a')}</div>
        </div>
      ),
      sortable: true,
    },
    // Actions Column
    {
      header: 'Actions',
      cell: (appointment: Appointment) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs text-[#8B5C9E] hover:bg-[#F3E8FF]"
            onClick={() => openDetailDrawer(appointment.id)}
            title="Notes & details"
          >
            <FileText className="h-3.5 w-3.5 mr-1" />
            Notes
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hover:bg-red-100 hover:text-red-600"
            onClick={() => handleDeleteAppointment(appointment.id)}
            title="Delete Appointment"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    }
  ];

  const handleUpdateAppointment = async (appointment: Appointment) => {
    try {
      setUpdatingStatus(appointment.id || null);
      const result = await updateAppointment(appointment);
      if (result.success) {
        toast.success('Appointment updated successfully');
        loadAppointments();
      } else {
        toast.error(result.error || 'Failed to update appointment');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment');
    } finally {
      setUpdatingStatus(null);
    }
  };
  
  const handleCreateAppointment = async (appointment: Appointment) => {
    try {
      const result = await createAppointment(appointment);
      if (result.success) {
        toast.success('Appointment created successfully');
        loadAppointments();
      } else {
        toast.error(result.error || 'Failed to create appointment');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Failed to create appointment');
    }
  };

  // --- Handlers for calendar integration ---
  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsNewAppointment(false);
    setPrefilledTimeForModal(undefined);
    setIsModalOpen(true);
  };

  const handleBookAgain = (appointment: Appointment) => {
    setIsNewAppointment(true);
    setSelectedAppointment(appointment);
    setSelectedDate(new Date()); // Default to today, user can change
    setPrefilledTimeForModal(undefined);
    setIsModalOpen(true);
  };

  const handleDrawerAddSlotClick = (date: Date, time: string) => {
    setSelectedDate(date);
    setPrefilledTimeForModal(time);
    setSelectedAppointment(null);
    setIsNewAppointment(true);
    setIsModalOpen(true);
  };

  const handleSaveAppointment = async (appointment: Appointment) => {
    if (isNewAppointment) {
      await createAppointment(appointment);
    } else {
      await updateAppointment(appointment);
    }
    setIsModalOpen(false);
    loadInitialData();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-600">Loading appointments...</div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 px-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage all appointments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative bg-gray-100 rounded-full p-1 flex flex-nowrap w-auto min-w-[220px]">
            <button
              className={`flex-1 px-3 py-2 rounded-full transition-all duration-200 text-sm font-medium focus:outline-none whitespace-nowrap ${viewMode === 'list' ? 'bg-[#8B5C9E] text-white shadow' : 'text-[#8B5C9E] hover:bg-[#F3E8FF]'}`}
              onClick={() => setViewMode('list')}
              aria-pressed={viewMode === 'list'}
            >
              List View
            </button>
            <button
              className={`flex-1 px-3 py-2 rounded-full transition-all duration-200 text-sm font-medium focus:outline-none whitespace-nowrap ${viewMode === 'calendar' ? 'bg-[#8B5C9E] text-white shadow' : 'text-[#8B5C9E] hover:bg-[#F3E8FF]'}`}
              onClick={() => setViewMode('calendar')}
              aria-pressed={viewMode === 'calendar'}
            >
              Calendar View
            </button>
          </div>
        </div>
      </div>
      {/* List view: search (submitted) + date filter + sort controls */}
      {viewMode === 'list' && (
        <div className="px-4 mb-2 flex flex-col sm:flex-row sm:items-center gap-2">
          {/* Search — runs on Enter or the Search button, not while typing */}
          <div className="flex items-stretch gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by name, phone or email…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') runSearch();
                }}
                className="pl-9 pr-9 bg-white text-gray-900 border-gray-200"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              size="sm"
              className="h-10 bg-[#8B5C9E] text-white hover:bg-[#7A4F8C]"
              onClick={runSearch}
            >
              <Search className="h-3.5 w-3.5 mr-1" />
              Search
            </Button>
          </div>

          {/* Single-date filter */}
          <div className="flex items-center gap-1">
            <Input
              type="date"
              value={listDate}
              onChange={(e) => setListDate(e.target.value)}
              aria-label="Filter by date"
              className="h-10 w-[150px] bg-white text-gray-900 border-gray-200"
            />
            {listDate && (
              <button
                type="button"
                onClick={() => setListDate('')}
                aria-label="Clear date filter"
                className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                title="Clear date"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-10 gap-2 text-[#8B5C9E] border-gray-200 bg-white">
                <ArrowUpDown className="h-3.5 w-3.5" />
                <span className="whitespace-nowrap">Sort: {activeSort.label}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white">
              {SORT_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.key}
                  onClick={() => setSortKey(opt.key)}
                  className={`cursor-pointer text-sm ${opt.key === sortKey ? 'bg-[#F3E8FF] text-[#8B5C9E] font-medium' : 'text-gray-700'}`}
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="text-sm text-gray-500 sm:ml-auto whitespace-nowrap">
            {pagination.total} appointment{pagination.total === 1 ? '' : 's'}
          </div>
        </div>
      )}
      {viewMode === 'list' ? (
        <Card className="mt-4 border-0 shadow-none bg-transparent">
          <div className="overflow-x-auto w-full">
            <DataTable
              columns={columns}
              data={appointments}
              loading={isLoading}
            />
            <Pagination 
              pagination={pagination}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        </Card>
      ) : (
        <Card className="mt-4 p-4 overflow-hidden border-0 shadow-none bg-transparent">
          <AdminCalendar
            appointments={calendarAppointments}
            onAppointmentClick={handleAppointmentClick}
            onAddSlotClick={handleDrawerAddSlotClick}
            enableViewSwitcher
          />
          {isModalOpen && (
            <AppointmentModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              appointment={selectedAppointment}
              onSave={handleSaveAppointment}
              isNewAppointment={isNewAppointment}
              selectedDate={selectedDate}
              prefilledTime={prefilledTimeForModal}
              doctors={doctors}
              onBookAgain={handleBookAgain}
              onDelete={(appId: string) => { // For delete from modal, directly trigger confirmation
                setAppointmentIdToDelete(appId);
                setIsConfirmDeleteDialogOpen(true);
                // No need to close modal here, confirmation will handle it or user can cancel
              }}
            />
          )}
          {/* Confirmation Dialog for Deletion */}
          <ConfirmationDialog
            isOpen={isConfirmDeleteDialogOpen}
            onClose={() => {
              setIsConfirmDeleteDialogOpen(false);
              setAppointmentIdToDelete(null);
            }}
            onConfirm={executeDeleteAppointment}
            title="Confirm Deletion"
            description="Are you sure you want to permanently delete this appointment? This action cannot be undone."
            confirmText="Delete"
            // confirmButtonVariant="destructive" // Using className for brand color
            confirmButtonClassName="bg-red-600 hover:bg-red-700 text-white"
            isConfirming={isDeleting}
          />
        </Card>
      )}

      <AppointmentDetailDrawer
        appointmentId={drawerAppointmentId}
        open={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        onChanged={loadInitialData}
      />
    </div>
  );
} 