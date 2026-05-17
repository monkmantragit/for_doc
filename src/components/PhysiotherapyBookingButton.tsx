'use client';

import { useState, ReactNode } from 'react';
import { Calendar } from 'lucide-react';
import PhysiotherapyBookingModal from '@/components/booking/PhysiotherapyBookingModal';

interface PhysiotherapyBookingButtonProps {
  className?: string;
  icon?: ReactNode;
  text?: string;
  ariaLabel?: string;
}

/**
 * Mirrors the public API of <BookingButton> but opens the dedicated
 * PhysiotherapyBookingModal (which skips Doctor Selection and pre-selects the
 * physiotherapist).
 *
 * Use this for any CTA that should book a physiotherapy session — every other
 * "Book an Appointment" CTA on the site should keep using <BookingButton>.
 */
export default function PhysiotherapyBookingButton({
  className = 'w-full py-3 px-6 flex items-center justify-center space-x-2 bg-[#8B5C9E] text-white rounded-md hover:bg-[#7A4C8C] transition-colors',
  icon = <Calendar className="w-5 h-5 mr-2" />,
  text = 'Book a Physiotherapy Session',
  ariaLabel,
}: PhysiotherapyBookingButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={className}
        aria-label={ariaLabel || text}
      >
        {icon}
        {text && <span>{text}</span>}
      </button>

      <PhysiotherapyBookingModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
