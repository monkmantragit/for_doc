'use client';

import * as React from 'react';
import BookingModal from '@/components/booking/BookingModal';
import { useRouter } from 'next/navigation'; // Import useRouter
import SiteHeader from '@/components/layout/SiteHeader'; // Import header if needed
import SiteFooter from '@/components/layout/SiteFooter'; // Import footer if needed

export default function BookAppointmentPage() {
  const [isModalOpen, setIsModalOpen] = React.useState(true); // Use React.useState
  const router = useRouter();

  const handleClose = () => {
    setIsModalOpen(false);
    // Optional: Navigate back or to home page when modal is closed
    // router.push('/'); 
    // Or use router.back() if you want the browser back button behavior
    router.back(); // Navigate back when closed
  };

  // If the modal is closed by means other than the handleClose function (e.g., clicking outside),
  // ensure we navigate back. We use useEffect to monitor isModalOpen.
  React.useEffect(() => { // Use React.useEffect
    if (!isModalOpen) {
      // Use a slight delay to allow the modal closing animation to finish
      const timer = setTimeout(() => {
        router.back();
      }, 300); // Adjust delay based on modal animation duration

      return () => clearTimeout(timer); // Cleanup the timer
    }
  }, [isModalOpen, router]);

  return (
    <div className="min-h-screen flex flex-col bg-tint-care">
      {/* Optional: Include Header and Footer if you want the standard layout */}
      {/* <SiteHeader /> */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* You can add placeholder content here if needed, 
            but the main focus is the modal which overlays this */}
        <h1 className="text-2xl font-bold text-center mb-4 text-soi-navy-800">Booking Appointment</h1>
        <p className="text-center text-soi-navy-600">
          Loading booking options...
        </p>
      </main>
      {/* <SiteFooter /> */}

      <BookingModal isOpen={isModalOpen} onClose={handleClose} />
    </div>
  );
} 