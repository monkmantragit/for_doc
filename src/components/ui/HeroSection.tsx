'use client';

import { ReactNode, useEffect, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export type HeroVariant = 'image' | 'gradient' | 'light' | 'color';

interface HeroSectionProps {
  title: string | ReactNode;
  subtitle?: string | ReactNode;
  bgImage?: string;
  bgColor?: string;
  variant?: HeroVariant;
  height?: 'small' | 'medium' | 'large';
  align?: 'left' | 'center' | 'right';
  actions?: ReactNode;
  overlayOpacity?: number;
  className?: string;
  children?: ReactNode;
}

export default function HeroSection({
  title,
  subtitle,
  bgImage,
  bgColor = '#2E3A59',
  variant = 'gradient',
  height = 'medium',
  align = 'center',
  actions,
  overlayOpacity = 0.7,
  className,
  children,
}: HeroSectionProps) {
  // Keep track of mounted state for client-side effects
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine height class based on prop
  const heightClass = {
    small: 'min-h-[50vh] md:min-h-[60vh]',
    medium: 'min-h-[60vh] md:min-h-[70vh]',
    large: 'min-h-[80vh] md:min-h-[90vh]',
  }[height];

  // Determine text alignment
  const alignClass = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  }[align];

  // Background gradient - convert hex to rgba for transparency
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Animation variants
  const containerAnimation = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2,
        duration: 0.6
      }
    }
  };

  const itemAnimation = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  // Skip animation if reduced motion is preferred
  const prefersReducedMotion = mounted && typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  // Render the appropriate background based on variant
  const renderBackground = () => {
    switch (variant) {
      case 'image':
        return (
          <div className="absolute inset-0 z-0 bg-[#2E3A59]">
            <div className="relative w-full h-full">
              <img
                src={bgImage || '/images/default-hero.jpg'}
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: 'center' }}
              />
              <div className="absolute inset-0 bg-black/60" />
              <div 
                className="absolute inset-0" 
                style={{ 
                  background: `linear-gradient(to bottom, ${hexToRgba(bgColor, 0.6)} 0%, ${hexToRgba(bgColor, overlayOpacity)} 60%, ${hexToRgba(bgColor, 0.8)} 100%)`
                }}
              />
              <div className="absolute inset-0 mix-blend-overlay bg-gradient-to-br from-black/10 to-transparent" />
              <div className="absolute inset-0 bg-[url('/images/blue-grid.svg')] opacity-10 mix-blend-overlay" />
            </div>
          </div>
        );
      
      case 'gradient':
        return (
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div
              className="absolute inset-0" 
              style={{ 
                background: `radial-gradient(circle at 30% 30%, ${bgColor} 0%, ${hexToRgba(bgColor, 0.8)} 70%, ${hexToRgba(bgColor, 0.6)} 100%)`
              }}
            />
            <div className="absolute inset-0 bg-[url('/images/blue-grid.svg')] opacity-10 mix-blend-overlay"></div>
            
            {/* Subtle accent colors */}
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-white/5 blur-3xl rounded-full transform translate-x-1/4 -translate-y-1/4"></div>
            <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-white/5 blur-3xl rounded-full transform -translate-x-1/4 translate-y-1/4"></div>
          </div>
        );
      
      case 'light':
        return (
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white"></div>
            <div className="absolute inset-0 bg-[url('/images/blue-grid.svg')] opacity-10"></div>
            <div 
              className="absolute top-0 left-0 right-0 h-1/2 opacity-15"
              style={{ 
                background: `linear-gradient(to bottom, ${bgColor} 0%, transparent 100%)`
              }}
            />
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-white/8 blur-3xl rounded-full transform translate-x-1/4 -translate-y-1/4"></div>
          </div>
        );
      
      case 'color':
        return (
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div 
              className="absolute inset-0" 
              style={{ backgroundColor: bgColor }}
            />
            <div className="absolute inset-0 bg-[url('/images/blue-grid.svg')] opacity-10 mix-blend-overlay"></div>
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-white/5 blur-3xl rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-white/5 blur-3xl rounded-full"></div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <section 
      className={cn(
        "relative flex items-center justify-center overflow-hidden",
        heightClass,
        variant === 'light' ? 'text-gray-900' : 'text-white',
        className
      )}
      style={{ textShadow: variant !== 'light' ? '0 1px 2px rgba(0,0,0,0.3)' : 'none' }}
    >
      {renderBackground()}
      
      <motion.div 
        className={cn(
          "relative z-10 container mx-auto px-4 pt-24 md:pt-32 flex flex-col justify-center", 
          alignClass
        )}
        initial={prefersReducedMotion ? undefined : "hidden"}
        animate={prefersReducedMotion ? undefined : "visible"}
        variants={containerAnimation}
      >
        {typeof title === 'string' ? (
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
            variants={itemAnimation}
          >
            <span className="relative inline-block">
              {title}
              <div className="absolute -inset-1 bg-white/10 blur-lg animate-pulse-slow opacity-70"></div>
            </span>
          </motion.h1>
        ) : (
          <motion.div variants={itemAnimation}>
            {title}
          </motion.div>
        )}
        
        {subtitle && (
          typeof subtitle === 'string' ? (
            <motion.p 
              className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-8 drop-shadow-md"
              variants={itemAnimation}
            >
              {subtitle}
            </motion.p>
          ) : (
            <motion.div variants={itemAnimation}>
              {subtitle}
            </motion.div>
          )
        )}
        
        {actions && (
          <motion.div 
            className="flex flex-wrap gap-4 justify-center mt-4"
            variants={itemAnimation}
          >
            {actions}
          </motion.div>
        )}
        
        {children && (
          <motion.div 
            className="w-full mt-8"
            variants={itemAnimation}
          >
            {children}
          </motion.div>
        )}
      </motion.div>
    </section>
  );
} 