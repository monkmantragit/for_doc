'use client';

import React, { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { format } from 'date-fns';
import { fetchAppointments } from '@/app/actions/admin';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  Users,
  Clock,
  BarChart2,
  Settings,
  Menu,
  X,
  LogOut,
  CalendarRange,
  CalendarClock,
  FileText,
  Image as ImageIcon,
  Search,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import AdminFooter from '@/components/admin/AdminFooter';

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: BarChart2 },
  { href: '/admin/today', label: "Today's Appointments", icon: CalendarClock },
  { href: '/admin/doctors', label: 'Doctors', icon: Users },
  { href: '/admin/schedule', label: 'Schedule', icon: Calendar },
  { href: '/admin/appointments', label: 'Appointments', icon: Clock },
  { href: '/admin/physiotherapy-bookings', label: 'Physiotherapy Bookings', icon: Activity },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/content', label: 'Content', icon: FileText, hideOnMobile: true },
  { href: '/admin/gallery', label: 'Gallery', icon: ImageIcon, hideOnMobile: true }
];

export default function AdminLayout({
  children,
}: {
  children: any;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  
  // Check if current page is login page
  const isLoginPage = pathname === '/admin/login';

  // Handle sidebar visibility based on screen size
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Logout failed');

      // Clear any client-side state
      router.push('/admin/login');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  // --- GLOBAL NOTIFICATION LOGIC ---
  const [lastNotificationTime, setLastNotificationTime] = useState<Date>(new Date());
  const hasRequestedPermission = useRef(false);

  // SWR polling for today's appointments
  const { data } = useSWR<{
    success: boolean;
    error?: string;
    data?: {
      appointments: any[];
      pagination: any;
    };
  }>(
    ['todayAppointments-global'],
    async ([key]) => {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      // Notification poller is for the orthopedic team. Physiotherapy
      // bookings notify separately via the /admin/physiotherapy-bookings tab.
      return await fetchAppointments(1, 100, {
        startDate: startOfDay,
        endDate: endOfDay,
        excludeSpeciality: 'Physiotherapist',
      });
    },
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  // Play notification sound
  const playNotificationSound = () => {
    const audio = new Audio('/notification.wav');
    audio.play();
  };

  // Request browser notification permission
  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default' && !hasRequestedPermission.current) {
      Notification.requestPermission();
      hasRequestedPermission.current = true;
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    if (data?.success && data?.data?.appointments) {
      const newAppointments = data.data.appointments.filter(
        (apt: any) => new Date(apt.createdAt) > lastNotificationTime
      );
      newAppointments.forEach((apt: any) => {
        const doctorName = apt.doctor?.name ? ` with ${apt.doctor.name}` : '';
        const timeStr = apt.time || format(new Date(apt.date), 'HH:mm');
        toast.success(`New appointment for ${apt.patientName || 'Unknown Patient'}${doctorName} at ${timeStr}`, {
          duration: 5000,
        });
        playNotificationSound();
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('New Appointment', {
            body: `${apt.patientName || 'Unknown Patient'}${doctorName} at ${timeStr}`,
            icon: '/favicon.ico',
          });
        }
      });
      if (newAppointments.length > 0) {
        setLastNotificationTime(new Date());
      }
    }
  }, [data, lastNotificationTime]);

  // If this is the login page, render a simplified layout without the sidebar
  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Simple header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6">
          <h1 className="text-xl font-bold text-[#8B5C9E]">Sports Orthopedics Admin</h1>
        </header>
        
        {/* Main content */}
        <main className="flex-1 flex items-center justify-center">
          {children}
        </main>
        
        {/* Admin Footer */}
        <AdminFooter />
      </div>
    );
  }

  // Regular admin layout with sidebar for authenticated pages
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:sticky top-0 left-0 z-30 h-screen w-[250px] bg-white border-r border-gray-200',
          'transform transition-transform duration-200 ease-in-out',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0 flex-shrink-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 flex-shrink-0">
            <h1 className="text-lg font-bold text-[#8B5C9E]">Admin Panel</h1>
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Navigation - Fixed height with own scrollbar */}
          <div className="flex-grow flex flex-col h-[calc(100vh-64px-60px)] overflow-hidden">
            <nav className="flex-grow overflow-y-auto py-4">
              <ul className="space-y-1 px-2">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  
                  // Skip items marked as hideOnMobile on small screens
                  if (item.hideOnMobile && typeof window !== 'undefined' && window.innerWidth < 768) {
                    return null;
                  }
                  
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-[#8B5C9E] text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Logout Button - Fixed at bottom */}
          <div className="p-4 border-t border-gray-200 flex-shrink-0">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper - Apply flex-col and remove overflow-hidden */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Mobile Header */}
        <header className="sticky top-0 z-10 md:hidden bg-white border-b border-gray-200 flex-shrink-0 h-16">
          <div className="flex items-center justify-between h-full px-4">
            <button
              className="p-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-5 h-5 text-gray-500" />
            </button>
            <h1 className="text-lg font-semibold text-[#8B5C9E]">Admin Panel</h1>
            <div className="w-10" /> {/* Spacer for alignment */}
          </div>
        </header>

        {/* Page Content Area - Make it grow and scroll, remove explicit height */}
        <main className="flex-1 overflow-y-auto w-full">
          {children}
        </main>

        {/* Wrapper div for Admin Footer to apply flex-shrink-0 */}
        <div className="flex-shrink-0">
          <AdminFooter />
        </div>
      </div>
    </div>
  );
} 