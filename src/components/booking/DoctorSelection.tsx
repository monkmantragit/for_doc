'use client';

import { useEffect, useState } from 'react';
import { Star, Clock, Calendar, MapPin, Search, Filter, X, Users, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import type { Doctor } from '@/types/booking';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useBookingForm } from '@/contexts/BookingFormContext';
import { format, isToday, isTomorrow } from 'date-fns';

// Helper function to format availability date
const formatAvailabilityDate = (availabilityDate: Date | string | undefined): string => {
  if (!availabilityDate) return "Not available";
  
  const date = typeof availabilityDate === 'string' ? new Date(availabilityDate) : availabilityDate;
  
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  
  // Format as "Jan 15" for other dates
  return format(date, 'MMM d');
};

interface DoctorCardProps {
  doctor: Doctor;
  isSelected: boolean;
  onSelect: (doctor: Doctor) => void;
}

const DoctorCard = ({ doctor, isSelected, onSelect }: DoctorCardProps) => {
  // Get the next available date from the API instead of simulation
  const [availabilityDate, setAvailabilityDate] = useState<Date | undefined>();
  const [isLoadingAvailability, setIsLoadingAvailability] = useState<boolean>(false);
  
  useEffect(() => {
    const fetchNextAvailableDate = async () => {
      // Only fetch if the doctor is available in general
      if (!doctor.availability) return;
      
      try {
        setIsLoadingAvailability(true);
        const response = await fetch(`/api/doctors/${doctor.id}/next-available`);
        
        if (!response.ok) {
          console.error(`Error fetching next available date for doctor ${doctor.id}: ${response.status}`);
          return;
        }
        
        const data = await response.json();
        if (data.nextAvailableDate) {
          setAvailabilityDate(new Date(data.nextAvailableDate));
        }
      } catch (error) {
        console.error(`Failed to fetch next available date for doctor ${doctor.id}:`, error);
      } finally {
        setIsLoadingAvailability(false);
      }
    };
    
    fetchNextAvailableDate();
  }, [doctor.id, doctor.availability]);
  
  const availabilityText = isLoadingAvailability 
    ? "Checking..." 
    : formatAvailabilityDate(availabilityDate);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onClick={() => onSelect(doctor)}
      className={`
        relative w-full rounded-2xl overflow-hidden cursor-pointer
        transition-all duration-200 touch-manipulation
        ${isSelected
          ? 'bg-gradient-to-br from-soi-navy-500 to-soi-navy-700 text-white shadow-xl'
          : 'bg-white border border-soi-pink-200 hover:border-soi-pink-400 hover:shadow-md'
        }
      `}
    >
      <div className="p-4 sm:p-5">
        <div className="flex gap-4">
          {/* Doctor Image with Status */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 ring-2 ring-white">
              <Image
                src={doctor.image || '/default-doctor.png'}
                alt={doctor.name}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
            {doctor.availability && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full ring-2 ring-white" />
            )}
          </div>

          {/* Doctor Info */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div>
                <h3 className={`text-lg font-semibold tracking-tight ${isSelected ? 'text-white' : 'text-soi-navy-800'}`}>
                  {doctor.name}
                </h3>
                <p className={`text-sm mt-0.5 ${isSelected ? 'text-white/90' : 'text-soi-navy-600'}`}>
                  {doctor.speciality}
                </p>
              </div>
              <div className="text-right">
                <div className={`text-xl font-bold ${isSelected ? 'text-white' : 'text-soi-navy-700'}`}>₹{doctor.fee}</div>
                <div className={`text-xs mt-0.5 ${isSelected ? 'text-white/80' : 'text-soi-navy-500'}`}>Per Visit</div>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className={`
                  p-2 rounded-lg
                  ${isSelected ? 'bg-white/20' : 'bg-soi-mint-100'}
                `}>
                  <Clock className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-soi-mint-600'}`} />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-soi-navy-800'}`}>
                    Available
                  </p>
                  <p className={`text-xs font-medium ${isSelected ? 'text-white/90' : 'text-soi-navy-600'}`}>
                    {availabilityText}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className={`
                  p-2 rounded-lg
                  ${isSelected ? 'bg-white/20' : 'bg-soi-pink-100'}
                `}>
                  <MapPin className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-soi-pink-600'}`} />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-soi-navy-800'}`}>
                    HSR Layout
                  </p>
                  <p className={`text-xs font-medium ${isSelected ? 'text-white/90' : 'text-soi-navy-600'}`}>
                    Location
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface DoctorSelectionProps {
  onNext?: () => void;
}

const DoctorSelection = ({ onNext }: DoctorSelectionProps = {}) => {
  const { state, dispatch } = useBookingForm();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setIsLoading(true);
        console.log('DoctorSelection: Fetching /api/doctors...');
        const response = await fetch('/api/doctors');
        console.log('DoctorSelection: API response status:', response.status);

        if (!response.ok) {
          console.error('DoctorSelection: API response not OK', response);
          throw new Error(`Failed to fetch doctors. Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('DoctorSelection: Data received from API:', data);
        setDoctors(data);
        setError(null);
      } catch (err) {
        console.error('DoctorSelection: Error in fetchDoctors catch block:', err);
        
        // Fallback to database values if API fails
        const fallbackDoctors = [
          {
            id: 'dr-sameer',
            name: 'Dr. Sameer',
            speciality: 'Orthopedic Surgeon',
            image: '/images/team-hero.jpg',
            fee: 800,
            availability: true,
            experience: 15,
            rating: 4.9
          },
          {
            id: 'other-doctors',
            name: 'Other Doctors',
            speciality: 'Sports Orthopedic Doctors',
            image: '/images/team-hero.jpg',
            fee: 1000,
            availability: true,
            experience: 10,
            rating: 4.7
          }
        ];
        console.log('DoctorSelection: Setting fallback doctors:', fallbackDoctors);
        setDoctors(fallbackDoctors);
        
        setError('Using backup doctor data. Some information may not be up-to-date.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const specialties = Array.from(new Set(doctors.map(doctor => doctor.speciality)));

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.speciality.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = !selectedSpecialty || doctor.speciality === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  // Create a handleDoctorSelect function that sets the selected doctor in the context
  const handleDoctorSelect = (doctor: Doctor) => {
    dispatch({ type: 'SET_DOCTOR', payload: doctor });
    
    // Reset acknowledgment when a doctor is selected
    if (state.hasAcknowledgedNaveen) {
      dispatch({ type: 'SET_ACKNOWLEDGED_NAVEEN', payload: false });
    }

    // Only auto-advance if it's NOT Dr. Naveen
    const isNaveen = doctor.name.toLowerCase().includes('naveen');
    
    // If there's a next button action to trigger, pass it to parent
    if (onNext && !isNaveen) {
      onNext();
    }
  };

  console.log('DoctorSelection: doctors state before render:', doctors);
  console.log('DoctorSelection: filteredDoctors before render:', filteredDoctors);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-soi-navy-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-soi-navy-600">Loading doctors...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-soi-navy-800 mb-2">Something went wrong</h3>
        <p className="text-soi-navy-600 text-center mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-soi-navy-500 text-white rounded-lg hover:bg-soi-navy-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-soi-navy-800 mb-1">
          Select a Doctor
        </h1>
        <p className="text-sm sm:text-base text-soi-navy-600">
          Choose from our experienced medical professionals
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-soi-navy-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search doctors by name or specialty"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-soi-pink-200 focus:border-soi-pink-500 focus:ring-2 focus:ring-soi-pink-200/50 transition-all text-soi-navy-800 placeholder:text-soi-navy-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(true)}
          className={`
            p-2.5 rounded-xl border transition-all
            ${selectedSpecialty
              ? 'border-[#8B5C9E] bg-[#8B5C9E] text-white'
              : 'border-gray-200 text-gray-700 hover:border-[#8B5C9E] hover:text-[#8B5C9E]'
            }
          `}
        >
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Dr. Naveen special note marquee (seamless) */}
      <div className="relative w-full overflow-hidden py-2 bg-white">
        <div className="flex items-center gap-6 px-2 whitespace-nowrap animate-marquee" style={{ width: 'max-content' }}>
          {[1, 2].map((_, i) => (
            <span key={i} className="flex items-center gap-2 mr-12">
              <AlertCircle className="inline-block w-5 h-5 text-[#8B5C9E]" />
              <span className="text-sm font-medium text-[#8B5C9E]">
                Dr. Naveen no longer treats <b>back pain, neck pain, or spine-related issues</b>. All patients with these conditions should schedule with <b>Dr. Sameer</b>.
              </span>
            </span>
          ))}
        </div>
        <style jsx>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            display: flex;
            animation: marquee 18s linear infinite;
            will-change: transform;
          }
        `}</style>
      </div>

      {/* Doctor List */}
      <div className="space-y-4 overflow-y-auto max-h-[calc(60vh-10rem)] overscroll-contain pb-6 scroll-smooth">
        <AnimatePresence>
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor) => {
              const isSelected = state.doctor?.id === doctor.id;
              const isNaveen = doctor.name.toLowerCase().includes('naveen');
              
              return (
                <div key={doctor.id} className="space-y-3">
                  <DoctorCard
                    doctor={doctor}
                    isSelected={isSelected}
                    onSelect={(selectedDoctor) => {
                      handleDoctorSelect(selectedDoctor);
                    }}
                  />
                  
                  {isSelected && isNaveen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-soi-pink-50 border border-soi-pink-200 rounded-xl p-4 flex items-start gap-3 mt-2 shadow-sm"
                    >
                      <input
                        type="checkbox"
                        id={`naveen-ack-${doctor.id}`}
                        checked={state.hasAcknowledgedNaveen}
                        onChange={(e) => dispatch({ type: 'SET_ACKNOWLEDGED_NAVEEN', payload: e.target.checked })}
                        className="mt-0.5 w-5 h-5 rounded border-soi-pink-300 text-soi-navy-600 focus:ring-soi-navy-500 shadow-sm cursor-pointer"
                      />
                      <label htmlFor={`naveen-ack-${doctor.id}`} className="text-sm font-medium text-soi-navy-800 cursor-pointer flex-1">
                        Read and understood that Dr. Naveen doesn&apos;t consult for Back pain/ Neck pain/ Spine Issues
                      </label>
                    </motion.div>
                  )}
                </div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-8 px-4"
            >
              <Users className="w-12 h-12 text-soi-navy-400 mb-4" />
              <h3 className="text-lg font-semibold text-soi-navy-800 mb-1">No doctors found</h3>
              <p className="text-soi-navy-600 text-center">
                Try adjusting your search or filters
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filter Sheet */}
      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Filter Doctors</SheetTitle>
          </SheetHeader>
          <div className="py-6">
            <h3 className="text-sm font-medium text-soi-navy-800 mb-3">Specialty</h3>
            <div className="space-y-2">
              {specialties.map((specialty) => (
                <button
                  key={specialty}
                  onClick={() => {
                    setSelectedSpecialty(specialty === selectedSpecialty ? null : specialty);
                    setShowFilters(false);
                  }}
                  className={`
                    w-full flex items-center justify-between px-4 py-2 rounded-lg text-left
                    ${specialty === selectedSpecialty
                      ? 'bg-soi-navy-500 text-white'
                      : 'hover:bg-soi-pink-50 text-soi-navy-700'
                    }
                  `}
                >
                  <span>{specialty}</span>
                  {specialty === selectedSpecialty && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 rounded-full bg-white"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default DoctorSelection;
