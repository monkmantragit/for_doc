import { createContext, useContext, useReducer, ReactNode } from 'react';

interface Doctor {
  id: string;
  name: string;
  speciality: string;
  image?: string;
  fee: number;
  availability?: boolean;
}

export interface BookingFormData {
  doctor: Doctor | null;
  selectedDate: Date | null;
  selectedTime: string;
  patientName: string;
  email: string;
  phone: string;
  hasAcknowledgedNaveen: boolean;
}

interface BookingFormState extends BookingFormData {
  isSubmitting: boolean;
  currentStep: number;
  errors: Record<string, string>;
}

type BookingFormAction =
  | { type: 'SET_DOCTOR'; payload: Doctor | null }
  | { type: 'SET_DATE'; payload: Date | null }
  | { type: 'SET_TIME'; payload: string }
  | { type: 'SET_PATIENT_INFO'; payload: { name: string; email: string; phone: string } }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: { field: string; message: string } }
  | { type: 'CLEAR_ERROR'; payload: string }
  | { type: 'SET_ACKNOWLEDGED_NAVEEN'; payload: boolean }
  | { type: 'RESET_FORM' };

const initialState: BookingFormState = {
  doctor: null,
  selectedDate: null,
  selectedTime: '',
  patientName: '',
  email: '',
  phone: '',
  isSubmitting: false,
  currentStep: 0,
  errors: {},
  hasAcknowledgedNaveen: false,
};

const BookingFormContext = createContext<{
  state: BookingFormState;
  dispatch: React.Dispatch<BookingFormAction>;
} | null>(null);

function bookingFormReducer(state: BookingFormState, action: BookingFormAction): BookingFormState {
  switch (action.type) {
    case 'SET_DOCTOR':
      return { ...state, doctor: action.payload, errors: {} };
    case 'SET_DATE':
      return { ...state, selectedDate: action.payload, selectedTime: '', errors: {} };
    case 'SET_TIME':
      return { ...state, selectedTime: action.payload, errors: {} };
    case 'SET_PATIENT_INFO':
      return {
        ...state,
        patientName: action.payload.name,
        email: action.payload.email,
        phone: action.payload.phone,
        errors: {},
      };
    case 'SET_STEP':
      return { ...state, currentStep: action.payload, errors: {} };
    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.payload };
    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.payload.field]: action.payload.message },
      };
    case 'CLEAR_ERROR':
      const newErrors = { ...state.errors };
      delete newErrors[action.payload];
      return { ...state, errors: newErrors };
    case 'SET_ACKNOWLEDGED_NAVEEN':
      return { ...state, hasAcknowledgedNaveen: action.payload };
    case 'RESET_FORM':
      return initialState;
    default:
      return state;
  }
}

export function BookingFormProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bookingFormReducer, initialState);

  return (
    <BookingFormContext.Provider value={{ state, dispatch }}>
      {children}
    </BookingFormContext.Provider>
  );
}

export function useBookingForm() {
  const context = useContext(BookingFormContext);
  if (!context) {
    throw new Error('useBookingForm must be used within a BookingFormProvider');
  }
  return context;
} 