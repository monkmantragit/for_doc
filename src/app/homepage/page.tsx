'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { Calendar, Activity, Heart, Users, Phone, Mail, MapPin, ArrowRight, Star, Plus, Menu, X, Instagram, Facebook, Twitter, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import BookingModal from '@/components/booking/BookingModal';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { cn } from '@/lib/utils';
import { Metadata } from 'next';
import HeroSection from '@/components/ui/HeroSection';
import AffiliationsSlider from '@/components/ui/AffiliationsSlider';
import { AnimatePresence } from 'framer-motion';

const specialties = [
  {
    title: 'Knee',
    description: 'We provide comprehensive specialized care for injuries and conditions affecting the knee joint, ligaments, cartilage, muscles & bones around.',
    icon: Activity,
    image: '/images/orthopedics/knee-mobility.webp',
    href: '/bone-joint-school/knee-pain/'
  },
  {
    title: 'Shoulder',
    description: 'We provide comprehensive specialized care for injuries and conditions affecting the shoulder joint, ligaments, cartilage, muscles & bones around.',
    icon: Activity,
    image: '/images/orthopedics/shoulder-mobility.webp',
    href: '/bone-joint-school/shoulder-pain/'
  },
  {
    title: 'Ankle',
    description: 'We provide comprehensive specialized care for injuries and conditions affecting the ankle joint, ligaments, cartilage, muscles & bones around.',
    icon: Activity,
    image: '/images/orthopedics/ankle-therapy.webp',
    href: '/bone-joint-school/ankle-pain/'
  },
  {
    title: 'Hip',
    description: 'We provide comprehensive specialized care for injuries and conditions affecting the hip joint, ligaments, cartilage, muscles and bones around.',
    icon: Activity,
    image: '/images/orthopedics/hip-model.webp',
    href: '/bone-joint-school/hip-pain/'
  },
  {
    title: 'Elbow',
    description: 'We provide comprehensive specialized care for injuries and conditions affecting the elbow joint, ligaments, cartilage, muscles and bones around.',
    icon: Activity,
    image: '/images/orthopedics/elbow-injury.webp',
    href: '/bone-joint-school/elbow-pain/'
  },
  {
    title: 'Wrist',
    description: 'We provide comprehensive specialized care for injuries and conditions affecting the wrist joint, ligaments, cartilage, muscles & bones around.',
    icon: Activity,
    image: '/images/orthopedics/wrist-pain.webp',
    href: '/bone-joint-school/wrist-pain/'
  },
];

const features = [
  {
    title: 'Putting you first',
    description: 'We treat all our patients equally and humanely with individual care and attention.',
    icon: Heart,
  },
  {
    title: 'Vast Pool of Experience',
    description: 'We have extensive experience treating patients across multiple regions and are continually updating our knowledge through participation in global conferences and training.',
    icon: Users,
  },
  {
    title: 'Accurate Diagnosis',
    description: 'We strive to achieve the correct diagnosis with minimal investigations to ensure effective treatment planning.',
    icon: Activity,
  },
  {
    title: 'Interactive Session',
    description: 'We believe in empowering our patients with clear information about their condition and treatment options, making them active participants in their healthcare journey.',
    icon: Calendar,
  },
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Patient",
    comment: "Exceptional care and attention to detail. The team made my recovery journey smooth.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop"
  },
  {
    name: "Michael Chen",
    role: "Athlete",
    comment: "Professional sports medicine care that got me back on track faster than expected.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop"
  }
];

// Lazy loading components for better performance
const LazyImage = ({ src, alt, fill, ...props }: any) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  return (
    <div 
      className="relative overflow-hidden" 
      style={fill ? {
        position: 'relative', 
        minHeight: '250px',
        height: '100%',
        width: '100%'
      } : {}}
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
      <div style={{position: 'absolute', top: 0, left: 0, bottom: 0, right: 0}}>
        <Image 
          src={src} 
          alt={alt}
          fill={fill}
          onLoad={() => setIsLoaded(true)}
          sizes={fill ? "(max-width: 768px) 100vw, 50vw" : props.sizes || "100vw"}
          className={cn(
            "transition-opacity duration-500",
            isLoaded ? "opacity-100" : "opacity-0",
            props.className || ""
          )}
          {...props}
        />
      </div>
    </div>
  );
};

export default function HomePage() {
  const containerRef = useRef(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Animation for rotating specialty text
  const specialtyWords = ["Joint Health", "Knee Pain", "Shoulder Pain", "Ankle Pain", "Hip Pain", "Elbow Pain", "Wrist Pain", "Sports Injuries"];
  const [currentSpecialtyIndex, setCurrentSpecialtyIndex] = useState(0);
  
  // Fix hydration issues with useEffect
  useEffect(() => {
    setMounted(true);
    
    // Rotate through specialty words
    const intervalId = setInterval(() => {
      setCurrentSpecialtyIndex((prev: number) => (prev + 1) % specialtyWords.length);
    }, 3000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "200%"]);

  // Optimize FAQ section with accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  
  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };
  
  // Skip animation if reduced motion is preferred
  const prefersReducedMotion = mounted && typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;
    
  const animationProps = prefersReducedMotion 
    ? { initial: {}, animate: {}, transition: {} }
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
      };

  return (
    <div className="min-h-screen bg-white" ref={containerRef}>
      <SiteHeader theme="transparent" />

      {/* Hero Section */}
      <HeroSection
        variant="image"
        height="large"
        bgColor="#1e3a5f"
        bgImage="https://images.unsplash.com/photo-1588776814546-daab30f310ce?q=80&w=2070&auto=format&fit=crop"
        title={
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-block bg-soi-mint-500/20 text-white px-4 py-1 rounded-lg text-sm font-medium mb-6 backdrop-blur-sm border border-soi-mint-500/30">
              Excellence in Motion
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Expert Care for <br />
              <span className="text-soi-mint-400 bg-clip-text bg-gradient-to-r from-soi-mint-400 to-soi-pink-400 relative inline-block">
                {mounted && (
                  <AnimatePresence>
                    <motion.span
                      key={currentSpecialtyIndex}
                      initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
                      transition={{ 
                        duration: 0.5, 
                        ease: [0.4, 0, 0.2, 1] 
                      }}
                      className="absolute inset-0 whitespace-nowrap"
                    >
                      {specialtyWords[currentSpecialtyIndex]}
                    </motion.span>
                  </AnimatePresence>
                )}
                {/* Invisible text for layout spacing */}
                <span className="opacity-0 whitespace-nowrap">
                  {mounted ? specialtyWords[currentSpecialtyIndex] : 'Joint Health'}
                </span>
              </span>
            </h1>
            <p className="mt-6 text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed font-light">
              Comprehensive orthopedic evaluation and treatment from experienced specialists dedicated to restoring your mobility and comfort.
            </p>
          </div>
        }
      >
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button 
            size="lg" 
            className="bg-soi-purple-500 hover:bg-soi-purple-600 text-white px-8 py-4 text-lg border-2 border-soi-pink-500 hover:border-soi-pink-400 transition-all duration-300 hover:shadow-lg"
            onClick={() => setIsBookingModalOpen(true)}
          >
            Book Appointment
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-2 border-white text-white hover:bg-white hover:text-soi-navy-800 px-8 py-4 text-lg backdrop-blur-sm transition-all duration-300"
            asChild
          >
            <Link href="#specialties">Our Services</Link>
          </Button>
        </div>
      </HeroSection>

      {/* Professional Trust Indicators Section (Moved from Hero) */}
      <section id="trust-indicators" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          {/* Wrapper for visual grouping and padding - Adjusted for white background */}
          <div className="relative bg-gray-50 rounded-xl p-8 border border-gray-200">
            {/* Top decorative line - Adjusted for white background */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
              {/* Trust Indicator 1 - SOI Navy Authority */}
              <div className="group flex flex-col items-center text-center transition-all duration-300">
                 <div className="w-16 h-16 rounded-full bg-soi-navy-100 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 ring-2 ring-soi-navy-200 group-hover:ring-soi-navy-500">
                  <Activity className="w-8 h-8 text-soi-navy-800" />
                </div>
                <p className="text-3xl font-bold text-soi-navy-800 mb-1">10k+</p>
                <p className="text-sm text-soi-navy-600 uppercase tracking-wider font-medium">Successful Surgical Procedures</p>
              </div>
              
              {/* Trust Indicator 2 - SOI Purple Expertise */}
              <div className="group flex flex-col items-center text-center transition-all duration-300">
                 <div className="w-16 h-16 rounded-full bg-soi-purple-100 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 ring-2 ring-soi-purple-200 group-hover:ring-soi-purple-500">
                  <Calendar className="w-8 h-8 text-soi-purple-500" />
                </div>
                <p className="text-3xl font-bold text-soi-purple-500 mb-1">25+</p>
                <p className="text-sm text-soi-purple-600 uppercase tracking-wider font-medium">Years of Experience</p>
              </div>
              
              {/* Trust Indicator 3 - SOI Mint Wellness */}
              <div className="group flex flex-col items-center text-center transition-all duration-300">
                <div className="w-16 h-16 rounded-full bg-soi-mint-100 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 ring-2 ring-soi-mint-200 group-hover:ring-soi-mint-500">
                  <Users className="w-8 h-8 text-soi-mint-600" />
                </div>
                <p className="text-3xl font-bold text-soi-mint-600 mb-1">6+</p>
                <p className="text-sm text-soi-mint-700 uppercase tracking-wider font-medium">Specialized Care Areas</p>
              </div>
            </div>
            
            {/* Bottom decorative line - Adjusted for white background */}
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section id="specialties" className="py-24 bg-white relative overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-b from-soi-purple-500/10 to-transparent blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-t from-soi-navy-500/5 to-transparent blur-3xl" />
          {/* SOI Floating Elements */}
          <div className="absolute top-1/4 left-1/4 w-4 h-4 rounded-full bg-soi-pink-500/20 animate-float-slow" />
          <div className="absolute top-1/3 right-1/3 w-6 h-6 rounded-full bg-soi-mint-500/15 animate-float-medium" />
          <div className="absolute bottom-1/4 right-1/4 w-8 h-8 rounded-full bg-soi-purple-500/10 animate-float-fast" />
        </div>

        <div className="container mx-auto px-4">
          {/* Enhanced Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20 relative"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-block mb-4 relative"
            >
              <div className="absolute inset-0 bg-soi-purple-500/20 blur-xl animate-pulse" />
              <span className="relative bg-soi-purple-100 text-soi-purple-600 px-6 py-3 rounded-full text-sm font-medium border border-soi-purple-200 backdrop-blur-sm">
                Our Expertise
              </span>
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 relative">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-soi-navy-800 via-soi-purple-500 to-soi-navy-600">
                Specialized Care Areas
              </span>
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-soi-purple-500/10 rounded-full blur-2xl animate-pulse" />
            </h2>
            <p className="text-xl text-soi-navy-600 max-w-3xl mx-auto leading-relaxed">
              Comprehensive care for every stage of recovery in orthopedic treatments and rehabilitation
            </p>
            {/* SOI Decorative Line */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-soi-purple-400 to-transparent" />
          </motion.div>

          {/* Enhanced Specialties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {specialties.map((specialty, index) => (
              <motion.div
                key={specialty.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="group relative"
              >
                {/* Enhanced Card Container */}
                <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  {/* Image Container with Enhanced Effects */}
                  <div className="relative h-64 w-full" style={{minHeight: '16rem'}}>
                    <LazyImage
                      src={specialty.image}
                      alt={specialty.title}
                      fill
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-80" />
                    
                    {/* Enhanced Floating Icon */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.2, duration: 0.5 }}
                      className="absolute top-4 right-4 w-12 h-12"
                    >
                      <div className="absolute inset-0 bg-white/10 rounded-xl blur-md transform group-hover:scale-110 transition-transform duration-500" />
                      <div className="relative w-full h-full rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                        <specialty.icon className="w-6 h-6 text-white transform group-hover:scale-110 transition-transform duration-500" />
                      </div>
                    </motion.div>
                  </div>

                  {/* Content Container - Always Visible */}
                  <div className="p-6 relative z-10">
                    <h3 className="text-2xl font-semibold text-soi-navy-800 flex items-center mb-3">
                      <span className="relative">
                        {specialty.title}
                        <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-soi-purple-500 group-hover:w-full transition-all duration-500" />
                      </span>
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.3, duration: 0.5 }}
                        className="ml-3 w-2 h-2 rounded-full bg-soi-purple-500 group-hover:animate-pulse"
                      />
                    </h3>
                    <p className="text-soi-navy-600 mb-4 leading-relaxed">
                      {specialty.description}
                    </p>
                    
                    {/* Enhanced Action Area */}
                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        className="bg-transparent border-soi-purple-500 text-soi-purple-500 hover:bg-soi-purple-50 rounded-full transition-all duration-300 group-hover:scale-105"
                      >
                        <Link href={specialty.href} className="flex items-center">
                        Learn More
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </Link>
                      </Button>
                      
                      {/* Hover Effect Indicator */}
                      <div className="w-8 h-8 rounded-full bg-soi-mint-100 flex items-center justify-center transform group-hover:rotate-45 transition-transform duration-500">
                        <Plus className="w-4 h-4 text-soi-mint-600 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Hover Effects */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    {/* SOI Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-soi-purple-500/10 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-soi-mint-500/5 via-transparent to-soi-pink-500/5" />
                    
                    {/* Animated Corner Lines */}
                    <div className="absolute top-0 left-0 w-16 h-16">
                      <div className="absolute top-0 left-0 w-full h-1 bg-soi-purple-500/20 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                      <div className="absolute top-0 left-0 w-1 h-full bg-soi-purple-500/20 transform origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-500" />
                    </div>
                    <div className="absolute bottom-0 right-0 w-16 h-16">
                      <div className="absolute bottom-0 right-0 w-full h-1 bg-soi-mint-500/20 transform origin-right scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                      <div className="absolute bottom-0 right-0 w-1 h-full bg-soi-mint-500/20 transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="why-choose-us" className="py-24 bg-tint-care relative overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
             <span className="inline-block bg-soi-pink-200 text-soi-pink-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                Our Commitment
              </span>
            <h2 className="text-3xl md:text-4xl font-bold text-soi-navy-800 mb-4">
              Why Choose Sports Orthopedics?
            </h2>
            <p className="text-xl text-soi-navy-600 max-w-3xl mx-auto">
              Experience dedicated care focused on your well-being and recovery.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="text-center p-6 bg-white rounded-xl shadow-lg border border-soi-pink-200 hover:shadow-xl transition-shadow duration-300 group"
              >
                <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-soi-navy-100 text-soi-navy-800 transition-transform duration-300 group-hover:scale-105">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-soi-navy-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-soi-navy-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Section - Added for SEO */}
      <section id="about-us" className="py-24 bg-gradient-to-b from-white via-gray-50/30 to-white relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-block bg-soi-purple-100 text-soi-purple-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  About Sports Orthopedics Institute
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-soi-navy-800 mb-6">
                  Dedicated to Excellence in Orthopedic Care
                </h2>
                <div className="text-soi-navy-600 space-y-4">
                  <p>
                    At Sports Orthopedics Institute, we are committed to providing exceptional orthopedic care with a focus on sports medicine and rehabilitation. Our team of skilled specialists combines years of experience with cutting-edge techniques to deliver personalized treatment plans.
                  </p>
                  <p>
                    Whether you're recovering from an injury, managing chronic pain, or seeking to improve your mobility and performance, our comprehensive approach addresses your specific needs and goals.
                  </p>
                </div>
                <div className="mt-8">
                  <Link
                    href="/bone-joint-school"
                    className="inline-flex items-center text-soi-purple-500 font-medium hover:text-soi-purple-600 hover:underline transition-colors"
                  >
                    Learn more about our approach
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-soi-purple-500/5 rounded-2xl blur-xl" />
                <div className="relative aspect-square rounded-2xl overflow-hidden" style={{height: '100%', minHeight: '300px'}}>
                  <LazyImage
                    src="https://images.unsplash.com/photo-1666214280557-f1b5022eb634?q=80&w=1500&auto=format&fit=crop"
                    alt="Medical professionals discussing a patient case"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-soi-purple-500/10 rounded-full blur-3xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Our Director Section */}
      <section id="director" className="py-24 bg-gray-50 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-1/4 left-0 w-1/2 h-1/2 bg-gradient-to-br from-soi-pink-500/5 to-transparent blur-3xl" />
          <div className="absolute -bottom-1/4 right-0 w-1/3 h-1/2 bg-gradient-to-tl from-soi-pink-500/5 to-transparent blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center"
            >
              <div className="lg:col-span-1 relative">
                <div className="absolute -inset-4 bg-soi-pink-500/10 rounded-full blur-2xl animate-pulse" />
                <div className="relative aspect-square rounded-full overflow-hidden shadow-xl mx-auto lg:mx-0 w-64 h-64 lg:w-full lg:h-auto" style={{minHeight: '16rem', position: 'relative'}}>
                  <div style={{position: 'absolute', top: 0, left: 0, bottom: 0, right: 0}}>
                    <Image
                      src="/images/orthopedics/dr-naveen.jpg"
                      alt="Dr. Naveen Kumar L.V"
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 1024px) 256px, 100vw"
                    />
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2 text-center lg:text-left relative isolate">
                {/* Subtle background accent */}
                <div
                   className="absolute inset-y-0 right-0 -z-10 w-full max-w-xl origin-top-right skew-x-[-10deg] bg-gradient-to-br from-soi-pink-500/5 via-transparent to-transparent opacity-50"
                   aria-hidden="true"
                 />
                <span className="inline-block bg-soi-pink-200 text-soi-pink-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  Meet Our Director
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-soi-navy-800 mb-4">
                  Dr. Naveen Kumar L.V
                </h2>
                <p className="text-sm text-soi-navy-500 italic mb-6">
                  MBBS, MS Orth (India), FRCS Orth (Eng), MCh Hip & Knee (UK), MSc Orth (UK), Dip SICOT (Italy), FEBOT (Portugal), MRCGP (UK), Dip FIFA SM (Switzerland) (FSEM (UK))
                </p>
                <div className="text-soi-navy-600 space-y-4 prose max-w-none">
                  <p>
                    Dr. Naveen, a globally acclaimed orthopedic surgeon, is the Chief of Orthopedics & Sports Medicine at Manipal Hospital. With 26+ years of experience, numerous international qualifications, and fellowships, he specializes in advanced arthroscopy, arthroplasty, and trauma care.
                  </p>
                  <p>
                    Dedicated to excellence, he sees over 80 patients daily and performs thousands of complex surgeries annually, alongside contributing to anonymous charitable work.
                  </p>
                </div>
                 <div className="mt-8">
                  <Link
                    href="/surgeons-staff"
                    className="inline-flex items-center text-soi-pink-600 font-medium hover:text-soi-pink-700 hover:underline transition-colors"
                  >
                    Learn more about our team
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Affiliations & Partnerships Section */}
      <section id="affiliations" className="py-24 bg-tint-authority relative overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-3" />
          <div className="absolute top-0 right-0 w-1/4 h-1/2 bg-gradient-to-bl from-soi-navy-500/5 to-transparent blur-3xl" />
          <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-soi-purple-500/5 to-transparent blur-3xl" />
          {/* Floating accent elements */}
          <div className="absolute top-1/3 left-1/5 w-3 h-3 rounded-full bg-soi-mint-500/15 animate-float-slow" />
          <div className="absolute bottom-1/3 right-1/4 w-2 h-2 rounded-full bg-soi-pink-500/20 animate-float-medium" />
        </div>

        <div className="container mx-auto px-4 relative">
           <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16 relative"
            >
              {/* Enhanced section badge */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-block mb-6 relative"
              >
                <div className="absolute inset-0 bg-soi-navy-500/10 blur-xl animate-pulse" />
                <span className="relative bg-soi-navy-100 text-soi-navy-700 px-6 py-3 rounded-full text-sm font-medium border border-soi-navy-200 backdrop-blur-sm shadow-lg">
                  Professional Associations
                </span>
              </motion.div>

              <h2 className="text-3xl md:text-5xl font-bold text-soi-navy-800 mb-6 relative">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-soi-navy-800 via-soi-purple-600 to-soi-navy-700">
                  Affiliations & Partnerships
                </span>
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-soi-purple-500/5 rounded-full blur-2xl animate-pulse" />
              </h2>
              <p className="text-xl text-soi-navy-600 max-w-3xl mx-auto leading-relaxed">
                Proudly associated with leading medical institutions, universities, and professional organizations worldwide.
              </p>
              {/* Decorative line */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-soi-navy-400 to-transparent" />
            </motion.div>
            
            {/* Clean Logo Slider */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="relative"
            >
              <AffiliationsSlider 
                speed="slow"
                pauseOnHover={true}
                showNames={true}
                variant="minimal"
                className=""
              />
            </motion.div>
            
            {/* Optional: Trust statement below slider */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <p className="text-sm text-soi-navy-600/80 italic max-w-2xl mx-auto">
                Our partnerships with globally renowned institutions ensure we deliver world-class orthopedic care backed by the latest medical research and educational excellence.
              </p>
            </motion.div>
        </div>
      </section>

      {/* FAQ section for SEO benefits */}
      <section className="py-24 bg-tint-wellness relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block bg-soi-mint-200 text-soi-mint-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                Frequently Asked Questions
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-soi-navy-800 mb-4">
                Common Questions About Our Services
              </h2>
              <p className="text-soi-navy-600">
                Find answers to the most common questions about our orthopedic treatments and procedures
              </p>
            </div>
            
            <div className="space-y-4">
              {[
                {
                  question: "How do I schedule an appointment?",
                  answer: "You can schedule an appointment by using our online booking system, calling our office directly, or sending us an email. Our staff will help you find the most convenient time for your visit."
                },
                {
                  question: "What insurance plans do you accept?",
                  answer: "We accept most major insurance plans including Medicare and private health insurance. Please contact our office to verify if your specific plan is accepted."
                },
                {
                  question: "How should I prepare for my first appointment?",
                  answer: "Please bring your insurance card, a form of identification, a list of current medications, and any relevant medical records or imaging from previous providers. Wearing comfortable clothing that allows easy examination of the affected area is also recommended."
                },
                {
                  question: "What types of conditions do you treat?",
                  answer: "We treat a wide range of orthopedic conditions including sports injuries, joint pain, fractures, arthritis, spine disorders, and more. Our specialists are experienced in treating conditions affecting all major joints and muscles."
                },
                {
                  question: "Do you offer non-surgical treatments?",
                  answer: "Yes, we offer many non-surgical treatment options including physical therapy, medication management, injections, and minimally invasive procedures. Our goal is to explore all appropriate conservative options before considering surgery."
                }
              ].map((faq, index) => (
                <div 
                  key={index}
                  className="border border-gray-200 rounded-lg bg-white overflow-hidden"
                >
                  <button
                    className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-soi-mint-500/50 hover:bg-soi-mint-50 transition-colors duration-200"
                    onClick={() => toggleFaq(index)}
                    aria-expanded={openFaqIndex === index}
                    aria-controls={`faq-answer-${index}`}
                  >
                    <span className="font-medium text-soi-navy-800">{faq.question}</span>
                    <span className={`transform transition-transform ${openFaqIndex === index ? 'rotate-45' : 'rotate-0'}`}>
                      <Plus className="w-5 h-5 text-soi-mint-600" />
                    </span>
                  </button>
                  <div
                    id={`faq-answer-${index}`}
                    className={`px-6 overflow-hidden transition-all duration-300 ${
                      openFaqIndex === index ? 'max-h-96 py-4' : 'max-h-0 py-0'
                    }`}
                  >
                    <p className="text-soi-navy-600">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <p className="text-soi-navy-600 mb-6">
                Don't see your question here? Contact us directly for more information.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-soi-mint-600 hover:bg-soi-mint-700 text-white font-medium rounded-lg transition-colors"
              >
                Contact Us
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 gradient-soi-medical-authority relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 mix-blend-soft-light" />
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Start Your Recovery Journey?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Schedule an appointment with our specialists and take the first step towards better mobility and comfort.
            </p>
            <Button
              size="lg"
              className="group bg-white text-soi-navy-800 hover:bg-soi-mint-50 border-2 border-soi-pink-400 rounded-full px-8 py-6 text-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-xl"
              onClick={() => setIsBookingModalOpen(true)}
              aria-label="Book an appointment now"
            >
              <span className="relative flex items-center justify-center">
                Book an Appointment Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />

      {/* Booking Modal */}
      <BookingModal 
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </div>
  );
} 