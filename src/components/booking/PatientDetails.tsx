'use client';

import React from 'react';
import { useBookingForm } from '@/contexts/BookingFormContext';
import { ChevronLeft } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css'; // Import library styles
import { cn } from '@/lib/utils'; // Import cn for conditional classes

interface PatientDetailsProps {
  onBack: () => void;
}

const PatientDetails = ({ onBack }: PatientDetailsProps) => {
  const { state, dispatch } = useBookingForm();

  const handleChange = (field: string, value: string | undefined) => {
    dispatch({
      type: 'SET_PATIENT_INFO',
      payload: {
        name: field === 'name' ? value : state.patientName,
        email: field === 'email' ? value : state.email,
        phone: field === 'phone' ? value : state.phone,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[#8B5C9E] hover:text-[#6B4A7E] rounded-md hover:bg-[#8B5C9E]/5 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">
          Patient Details
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Please provide your contact information
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={state.patientName}
            onChange={(e) => handleChange('name', e.target.value)}
            className={`
              w-full px-4 py-2.5 rounded-xl border transition-colors
              ${state.errors.name
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-[#8B5C9E] focus:ring-[#8B5C9E]'
              }
            `}
            placeholder="Enter your full name"
          />
          {state.errors.name && (
            <p className="mt-1 text-sm text-red-600">{state.errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={state.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={`
              w-full px-4 py-2.5 rounded-xl border transition-colors
              ${state.errors.email
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-[#8B5C9E] focus:ring-[#8B5C9E]'
              }
            `}
            placeholder="Enter your email"
          />
          {state.errors.email && (
            <p className="mt-1 text-sm text-red-600">{state.errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <PhoneInput
            international
            countryCallingCodeEditable={false}
            defaultCountry="IN"
            countries={["IN"]}
            value={state.phone}
            onChange={(value: string | undefined) => handleChange('phone', value)}
            className={cn(
              'phone-input-container w-full rounded-xl border border-gray-300 focus-within:border-[#8B5C9E] focus-within:ring-1 focus-within:ring-[#8B5C9E]',
              state.errors.phone ? 'border-red-300 focus-within:border-red-500 focus-within:ring-red-500' : ''
            )}
            placeholder="Enter your phone number"
          />
          {state.errors.phone && (
            <p className="mt-1 text-sm text-red-600">{state.errors.phone}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason for visit / concerns <span className="text-gray-400">(optional)</span>
          </label>
          <textarea
            value={state.notes}
            onChange={(e) => dispatch({ type: 'SET_NOTES', payload: e.target.value })}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#8B5C9E] focus:ring-1 focus:ring-[#8B5C9E] transition-colors"
            placeholder="Briefly describe your symptoms or what you'd like to consult about"
          />
          <p className="mt-1 text-xs text-gray-500">
            This helps the doctor prepare for your visit.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
