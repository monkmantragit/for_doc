'use client';

import BookingButton from '@/components/BookingButton';
import { Video, Calendar } from 'lucide-react';

interface HeroSectionProps {
  title: string;
  description: string;
  imageSrc: string;
}

export function HeroSection({ title, description, imageSrc }: HeroSectionProps) {
  return (
    <section 
      className="relative min-h-[60vh] md:min-h-[70vh] flex items-center justify-center text-center text-white overflow-hidden"
      style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
    >
      <div className="absolute inset-0 z-0 bg-gray-800">
        <div className="w-full h-full relative">
          <img 
            src={imageSrc}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover opacity-70"
          />
          {/* Apply gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80" /> 
        </div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 pt-24 md:pt-32">
        {/* Heading Style */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-6">
          <span className="relative inline-block">
            {title.split(' ')[0]}
            <div className="absolute -inset-1 bg-soi-purple-500/20 blur-xl animate-pulse"></div>
          </span>
          <br />
          <span className="text-white">
            {title.split(' ').slice(1).join(' ')}
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
          {description}
        </p>
        
        {/* Call to action buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <a 
            href="#videos" 
            className="px-6 py-3 bg-soi-navy-500 hover:bg-soi-navy-600 text-white font-medium rounded-lg inline-flex items-center transition-colors"
          >
            <Video className="w-5 h-5 mr-2" />
            Watch Videos
          </a>
          
          <BookingButton 
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg inline-flex items-center transition-colors backdrop-blur-sm border-2 border-white/30 hover:border-soi-pink-400"
            icon={<Calendar className="w-5 h-5 mr-2" />}
            text="Book Consultation"
          />
        </div>
      </div>
    </section>
  );
} 