"use client";

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { UserCircle2, Award } from 'lucide-react';
import { getPublicImageUrl } from '@/lib/directus';

interface StaffCardProps {
  staff: {
    slug: string;
    name: string;
    title: string;
    qualifications: string;
    imageUrl: string;
    contactInfo?: string;
  };
}

export function StaffCard({ staff }: StaffCardProps) {
  // Card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    },
    hover: { 
      y: -4,
      boxShadow: '0 12px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.06)',
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-soi-pink-200 hover:border-soi-pink-300 max-w-xs mx-auto"
      initial="hidden"
      animate="visible"
      whileHover="hover"
      variants={cardVariants}
    >
      <div className="block group flex flex-col">
        <div className="relative overflow-hidden">
          {staff.imageUrl ? (
           <div className="relative w-full h-64">
              <Image
                src={getPublicImageUrl(staff.imageUrl) || '/placeholder-staff.jpg'}
                alt={staff.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          ) : (
            <div className="bg-purple-50 w-full h-64 flex items-center justify-center">
              <UserCircle2 className="w-16 h-16 text-soi-pink-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-soi-pink-600/50 to-transparent opacity-70"></div>
          
          {/* Position tag */}
          {staff.title && (
            <div className="absolute top-3 right-3 bg-soi-navy-500 text-white text-xs font-medium px-2 py-1 rounded text-center">
              {staff.title.includes('Consultant') ? 'Surgeon' : 
               staff.title.includes('Psychologist') ? 'Specialist' : 
               staff.title.includes('Director') ? 'Director' : 'Staff'}
            </div>
          )}
        </div>
        
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="text-lg font-semibold text-soi-navy-800 mb-1 group-hover:text-soi-pink-600 transition-colors line-clamp-2">
            {staff.name}
          </h3>
          
          {staff.title && (
            <p className="text-sm text-soi-navy-600 font-medium mb-2">{staff.title}</p>
          )}
          
          {staff.qualifications && (
            <p className="text-xs text-soi-navy-500 line-clamp-2 mb-3 leading-relaxed">{staff.qualifications}</p>
          )}
          
          <div className="mt-auto pt-2 flex items-center text-soi-pink-600 text-xs font-medium">
            <Award className="w-3 h-3 mr-1" />
            <span>Expert Team Member</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}