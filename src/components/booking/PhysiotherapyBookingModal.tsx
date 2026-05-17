'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { useBookingForm, BookingFormProvider } from '@/contexts/BookingFormContext';
import DateTimeSelection from './DateTimeSelection';
import PatientDetails from './PatientDetails';
import Summary from './Summary';
import ThankYou from './ThankYou';
import { createAppointment } from '@/app/actions/admin';
import toast from 'react-hot-toast';

interface PhysiotherapyBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Steps for this flow (no Doctor Selection — physiotherapist is preselected):
//   0 -> DateTimeSelection
//   1 -> PatientDetails
//   2 -> Summary
//   3 -> ThankYou
// The number of steps maps cleanly into the existing BookingFormContext
// `currentStep` because the form context is generic; we just never advance to
// the doctor-selection screen.

const PhysiotherapyBookingModalContent = ({ isOpen, onClose }: PhysiotherapyBookingModalProps) => {
  const { state, dispatch } = useBookingForm();
  const [isLoadingDoctor, setIsLoadingDoctor] = useState(false);
  const [doctorLoadError, setDoctorLoadError] = useState<string | null>(null);

  // Reset form when modal closes, and pre-select the physiotherapist when it opens.
  useEffect(() => {
    if (!isOpen) {
      dispatch({ type: 'RESET_FORM' });
      return;
    }

    let cancelled = false;
    const preselectPhysiotherapist = async () => {
      setIsLoadingDoctor(true);
      setDoctorLoadError(null);
      try {
        const res = await fetch('/api/doctors?speciality=Physiotherapist');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const doctors = await res.json();
        if (cancelled) return;
        if (!Array.isArray(doctors) || doctors.length === 0) {
          setDoctorLoadError(
            'Physiotherapy booking is not currently available. Please add a physiotherapist in the admin panel.'
          );
          return;
        }
        // Use the first active physiotherapist (Dr. Atharva Mishra at launch).
        dispatch({ type: 'SET_DOCTOR', payload: doctors[0] });
      } catch (err) {
        console.error('PhysiotherapyBookingModal: failed to fetch physiotherapist', err);
        if (!cancelled) {
          setDoctorLoadError('Could not load physiotherapy availability. Please try again.');
        }
      } finally {
        if (!cancelled) setIsLoadingDoctor(false);
      }
    };

    preselectPhysiotherapist();
    return () => {
      cancelled = true;
    };
  }, [isOpen, dispatch]);

  const handleBack = () => {
    if (state.currentStep > 0) {
      dispatch({ type: 'SET_STEP', payload: state.currentStep - 1 });
    }
  };

  const handleNext = () => {
    if (canProceed()) {
      dispatch({ type: 'SET_STEP', payload: state.currentStep + 1 });
    }
  };

  const handleSubmit = async () => {
    if (!canProceed() || state.isSubmitting || !state.doctor || !state.selectedDate || !state.selectedTime) return;

    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });

      const newAppointmentData = {
        patientName: state.patientName,
        email: state.email,
        phone: state.phone,
        notes: state.notes?.trim() || null,
        doctorId: state.doctor.id,
        date: state.selectedDate,
        time: state.selectedTime,
        status: 'SCHEDULED',
        id: undefined,
        customerId: null,
        doctor: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await createAppointment(newAppointmentData);

      if (result.success) {
        // ThankYou step lives at index 3 here (no DoctorSelection step).
        dispatch({ type: 'SET_STEP', payload: 3 });
      } else {
        toast.error(result.error || 'Booking failed. Please try again.');
        dispatch({ type: 'SET_SUBMITTING', payload: false });
      }
    } catch (error) {
      console.error('Physiotherapy booking submission error:', error);
      toast.error('An unexpected error occurred during booking.');
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  };

  // Step indices for this flow (one less than the main BookingModal because we
  // skip the Doctor Selection step):
  //   0 -> DateTimeSelection
  //   1 -> PatientDetails
  //   2 -> Summary
  //   3 -> ThankYou
  const canProceed = () => {
    if (!state.doctor) return false;
    switch (state.currentStep) {
      case 0: // Date & Time Selection
        return !!state.selectedDate && !!state.selectedTime;
      case 1: // Patient Details
        return (
          !!state.patientName?.trim() &&
          !!state.email?.trim() &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim()) &&
          !!state.phone?.trim() &&
          /^\+?[\d\s-]{10,}$/.test(state.phone.replace(/\D/g, ''))
        );
      case 2: // Summary
        return !state.isSubmitting;
      default:
        return false;
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => state.currentStep === 3 && onClose()}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-xl overflow-hidden">
          {state.currentStep !== 3 && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-500 transition-colors z-10"
              aria-label="Close booking dialog"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex flex-col max-h-[90vh]">
            {/* Header banner — makes the flow visibly different from the main one */}
            {state.currentStep !== 3 && (
              <div className="bg-gradient-to-r from-soi-purple-500 to-soi-navy-500 px-6 py-4 text-white">
                <div className="text-sm font-medium opacity-90">Physiotherapy Booking</div>
                <div className="text-lg font-semibold">
                  {state.doctor?.name
                    ? `with ${state.doctor.name}`
                    : 'Sports Orthopedic Institute, HSR'}
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto">
              {/* Pre-loading the doctor record */}
              {isLoadingDoctor && (
                <div className="p-12 flex flex-col items-center justify-center text-gray-600">
                  <Loader2 className="w-8 h-8 animate-spin text-soi-purple-500 mb-3" />
                  <p>Preparing physiotherapy schedule…</p>
                </div>
              )}

              {!isLoadingDoctor && doctorLoadError && (
                <div className="p-12 text-center">
                  <p className="text-soi-navy-700 font-medium mb-4">{doctorLoadError}</p>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-soi-navy-500 text-white rounded-lg hover:bg-soi-navy-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}

              {!isLoadingDoctor && !doctorLoadError && state.doctor && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={state.currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="p-6"
                  >
                    {state.currentStep === 0 && <DateTimeSelection onBack={handleBack} />}
                    {state.currentStep === 1 && <PatientDetails onBack={handleBack} />}
                    {state.currentStep === 2 && (
                      <Summary
                        formData={state}
                        onBack={handleBack}
                        onSubmit={handleSubmit}
                        isSubmitting={state.isSubmitting}
                      />
                    )}
                    {state.currentStep === 3 && <ThankYou onClose={onClose} />}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            {/* Footer with Back/Continue. Hidden on Summary (it has its own
                submit button) and on ThankYou. */}
            {!isLoadingDoctor && !doctorLoadError && state.doctor && state.currentStep < 2 && (
              <div className="flex-shrink-0 border-t border-soi-pink-200 bg-soi-pink-50 p-4">
                <div className="flex items-center justify-between">
                  {state.currentStep > 0 ? (
                    <button
                      onClick={handleBack}
                      className="px-4 py-2 text-sm font-medium text-soi-navy-600 hover:text-soi-navy-800 transition-colors"
                    >
                      Back
                    </button>
                  ) : (
                    <div />
                  )}

                  <button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className={`
                      px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                      ${canProceed()
                        ? 'bg-soi-purple-500 text-white hover:bg-soi-purple-600 shadow-sm hover:shadow-md'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }
                    `}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default function PhysiotherapyBookingModal(props: PhysiotherapyBookingModalProps) {
  return (
    <BookingFormProvider>
      <PhysiotherapyBookingModalContent {...props} />
    </BookingFormProvider>
  );
}
