import { useState } from 'react';
import BookingModal from './booking/BookingModal';

interface BookingWidgetProps {
  buttonStyle?: 'default' | 'outline' | 'minimal';
  buttonText?: string;
  primaryColor?: string;
}

const BookingWidget = ({
  buttonStyle = 'default',
  buttonText = 'Book Consultation',
  primaryColor = '#1e3a5f'
}: BookingWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const getButtonClasses = () => {
    const baseClasses = 'px-6 py-3 rounded-lg font-medium transition-all duration-200';
    
    switch (buttonStyle) {
      case 'outline':
        return `${baseClasses} border-2 border-[${primaryColor}] text-[${primaryColor}] hover:bg-[${primaryColor}] hover:text-white`;
      case 'minimal':
        return `${baseClasses} text-[${primaryColor}] hover:bg-[${primaryColor}]/10`;
      default:
        return `${baseClasses} bg-[${primaryColor}] text-white hover:bg-[${primaryColor}]/90`;
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={getButtonClasses()}
      >
        {buttonText}
      </button>

      <BookingModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
};

export default BookingWidget; 