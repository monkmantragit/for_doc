'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AffiliationLogo {
  src: string;
  alt: string;
  name: string;
}

interface AffiliationsSliderProps {
  className?: string;
  speed?: 'slow' | 'medium' | 'fast';
  pauseOnHover?: boolean;
  showNames?: boolean;
  variant?: 'glassmorphic' | 'minimal';
}

const affiliationLogos: AffiliationLogo[] = [
  {
    src: '/images/affiliations/asia-pacific-ortho-association.jpeg',
    alt: 'Asia Pacific Orthopaedic Association',
    name: 'Asia Pacific Orthopaedic Association'
  },
  {
    src: '/images/affiliations/ebot.jpeg',
    alt: 'European Board of Orthopaedics and Traumatology',
    name: 'EBOT'
  },
  {
    src: '/images/affiliations/general-medical-association.png',
    alt: 'General Medical Association',
    name: 'General Medical Association'
  },
  {
    src: '/images/affiliations/indian-arthoscopy-society.jpeg',
    alt: 'Indian Arthroscopy Society',
    name: 'Indian Arthroscopy Society'
  },
  {
    src: '/images/affiliations/indian-orthopaedic-society.png',
    alt: 'Indian Orthopaedic Society',
    name: 'Indian Orthopaedic Society'
  },
  {
    src: '/images/affiliations/international-society-of-orthopadeics.jpeg',
    alt: 'International Society of Orthopaedics',
    name: 'International Society of Orthopaedics'
  },
  {
    src: '/images/affiliations/edge-hill-university.png',
    alt: 'Edge Hill University',
    name: 'Edge Hill University'
  },
  {
    src: '/images/affiliations/manipal-academy-of-higher-education.jpeg',
    alt: 'Manipal Academy of Higher Education',
    name: 'Manipal Academy of Higher Education'
  },
  {
    src: '/images/affiliations/royal-college-of-surgeons-of-england.png',
    alt: 'Royal College of Surgeons of England',
    name: 'Royal College of Surgeons of England'
  },
  {
    src: '/images/affiliations/university-of-salford.png',
    alt: 'University of Salford',
    name: 'University of Salford'
  }
];

const speedConfig = {
  slow: 80,
  medium: 50,
  fast: 30
};

const AffiliationsSlider = ({ 
  className,
  speed = 'slow',
  pauseOnHover = true,
  showNames = true,
  variant = 'glassmorphic'
}: AffiliationsSliderProps) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleMouseEnter = () => {
    if (pauseOnHover && !prefersReducedMotion) {
      setIsPaused(true);
    }
  };

  const handleMouseLeave = () => {
    if (pauseOnHover && !prefersReducedMotion) {
      setIsPaused(false);
    }
  };

  // Double the logos for seamless infinite scroll
  const doubledLogos = [...affiliationLogos, ...affiliationLogos];

  const animationDuration = prefersReducedMotion ? 'none' : `${speedConfig[speed]}s`;

  return (
    <div 
      className={cn(
        "w-full overflow-hidden relative",
        "before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-24 before:bg-gradient-to-r before:from-tint-authority before:to-transparent before:content-['']",
        "after:absolute after:right-0 after:top-0 after:z-10 after:h-full after:w-24 after:bg-gradient-to-l after:from-tint-authority after:to-transparent after:content-['']",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="region"
      aria-label="Our affiliations and partnerships"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-soi-purple-500/10 animate-float-slow" />
        <div className="absolute top-1/2 right-1/3 w-3 h-3 rounded-full bg-soi-mint-500/8 animate-float-medium" />
        <div className="absolute bottom-1/4 left-1/3 w-4 h-4 rounded-full bg-soi-pink-500/6 animate-float-fast" />
      </div>
      
      <div
        ref={sliderRef}
        className={cn(
          "flex items-center gap-8 py-8",
          !prefersReducedMotion && "animate-infinite-scroll",
          isPaused && "animation-paused"
        )}
        style={{
          animationDuration: animationDuration,
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
          width: 'fit-content'
        }}
      >
        {doubledLogos.map((logo, index) => (
          <div
            key={`${logo.name}-${index}`}
            className={cn(
              "group relative flex-shrink-0 transition-all duration-500 ease-out",
              "hover:scale-105 hover:z-20",
              variant === 'glassmorphic' 
                ? "bg-white/80 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:bg-white/90" 
                : "bg-white rounded-xl p-4 shadow-md hover:shadow-lg",
              "w-32 h-32 md:w-40 md:h-40 flex flex-col items-center justify-center",
              "hover:border-soi-purple-500/30 hover:shadow-soi-purple-500/10"
            )}
            style={{
              minWidth: '8rem',
              minHeight: '8rem'
            }}
          >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-soi-purple-500/0 via-soi-mint-500/0 to-soi-pink-500/0 group-hover:from-soi-purple-500/10 group-hover:via-soi-mint-500/5 group-hover:to-soi-pink-500/10 transition-all duration-500" />
            
            {/* Image container */}
            <div className="relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
              {!isLoaded ? (
                <div className="w-full h-full bg-gray-200 animate-pulse rounded-lg" />
              ) : (
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  fill
                  className="object-contain transition-transform duration-300 group-hover:scale-110"
                  sizes="(max-width: 768px) 80px, 96px"
                  loading="lazy"
                />
              )}
            </div>
            
            {/* Logo name */}
            {showNames && (
              <div className="mt-3 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-xs text-soi-navy-600 font-medium leading-tight line-clamp-2 max-w-28">
                  {logo.name}
                </p>
              </div>
            )}
            
            {/* Hover border animation */}
            <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-soi-purple-500/20 transition-all duration-300" />
            
            {/* Corner accents */}
            <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-soi-mint-500/0 group-hover:border-soi-mint-500/40 transition-all duration-300 rounded-tl-lg" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-soi-pink-500/0 group-hover:border-soi-pink-500/40 transition-all duration-300 rounded-br-lg" />
          </div>
        ))}
      </div>
      
      {/* Accessibility: Reduced motion fallback */}
      {prefersReducedMotion && (
        <div className="sr-only">
          Logos displayed in a static grid for users who prefer reduced motion
        </div>
      )}
    </div>
  );
};

export default AffiliationsSlider;