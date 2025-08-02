'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import BookingWidget from '@/components/BookingWidget';

// Separate client component that uses searchParams
function WidgetContent() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Send height updates to parent
    const sendHeight = () => {
      const height = document.documentElement.offsetHeight;
      window.parent.postMessage({ type: 'treboundResize', height }, '*');
    };

    // Send initial height
    sendHeight();

    // Send height on resize
    window.addEventListener('resize', sendHeight);
    
    // Cleanup
    return () => window.removeEventListener('resize', sendHeight);
  }, []);

  return (
    <div className="p-4 bg-white">
      <BookingWidget
        buttonStyle={(searchParams.get('buttonStyle') as 'default' | 'outline' | 'minimal') || 'default'}
        buttonText={searchParams.get('buttonText') || 'Book Appointment'}
        primaryColor={searchParams.get('primaryColor') || '#1e3a5f'}
      />
    </div>
  );
}

// Main page component with Suspense boundary
export default function WidgetPage() {
  return (
    <Suspense fallback={<div className="p-4 bg-white text-soi-navy-600">Loading...</div>}>
      <WidgetContent />
    </Suspense>
  );
} 