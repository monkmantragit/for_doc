import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { patientSchema } from './schema';
import { FormField } from './FormField';
import type { PatientFormData } from './types';

interface PatientDetailsProps {
  data: PatientFormData;
  onSubmit: (data: PatientFormData) => void;
  onBack: () => void;
}

export default function PatientDetails({ data, onSubmit }: PatientDetailsProps) {
  const methods = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: data,
    mode: 'onChange',
  });

  return (
    <FormProvider {...methods}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-md mx-auto space-y-8"
      >
        <header className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-soi-navy-800">
            Patient Details
          </h2>
          <p className="text-base text-soi-navy-600">
            Please provide your contact information
          </p>
        </header>

        <form 
          onSubmit={methods.handleSubmit(onSubmit)} 
          className="space-y-6"
        >
          <FormField
            name="name"
            label="Full Name"
            type="text"
            placeholder="Enter your full name"
            autoComplete="name"
          />

          <FormField
            name="phone"
            label="Phone Number"
            type="tel"
            placeholder="Enter your phone number"
            autoComplete="tel"
          />

          <FormField
            name="email"
            label="Email Address"
            type="email"
            placeholder="Enter your email address"
            autoComplete="email"
          />

          <FormField
            name="notes"
            label="Additional Notes"
            type="textarea"
            placeholder="Any additional information you'd like to share"
            optional
          />

          <input type="submit" className="hidden" />
        </form>
      </motion.div>
    </FormProvider>
  );
} 