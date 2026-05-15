'use client';

import { useState } from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import BookingModal from '@/components/booking/BookingModal';

export default function BookingButton() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  
  return (
    <>
      <button
        onClick={() => setIsBookingModalOpen(true)}
        className="w-full py-3 px-6 flex items-center justify-center space-x-2 bg-[#8B5C9E] text-white rounded-md hover:bg-[#7A4C8C] transition-colors"
      >
        <Calendar className="w-5 h-5" />
        <span>Book Consultation</span>
        <ArrowRight className="w-4 h-4" />
      </button>
      
      {/* Booking Modal */}
      <BookingModal 
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </>
  );
} 