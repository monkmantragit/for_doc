'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Calendar, Menu, X, ChevronDown, ChevronRight, Activity, Users, Bookmark, BookOpen } from 'lucide-react';
import BookingButton from '@/components/BookingButton';
import { motion, AnimatePresence } from 'framer-motion';
import { getBoneJointCategories, getBoneJointTopics, getBoneJointContent, getImageUrl } from '@/lib/directus';
import { getNavbarProceduresAction } from '@/app/procedure-surgery/actions';
import { getBoneJointTopics as getTopicsData } from '@/app/bone-joint-school/actions';

interface SiteHeaderProps {
  theme?: 'light' | 'transparent' | 'fixed' | 'default';
  className?: string;
}

interface BoneJointTopicCategory {
  slug: string;
  title: string;
}

// Add a new BoneJointTopic interface to match what's returned from getBoneJointTopics
interface BoneJointTopic {
  slug: string;
  title: string;
  imageUrl: string;
  summary: string;
  category?: string;
}

// Interface for procedure items
interface ProcedureItem {
  id: string;
  slug: string;
  title: string;
  category?: string;
  content_text?: string;
}

export default function SiteHeader({ theme = 'default', className = '' }: SiteHeaderProps) {
  const [scrollY, setScrollY] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const isMobile = useRef(false);
  const [boneJointCategories, setBoneJointCategories] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [boneJointTopics, setBoneJointTopics] = useState<BoneJointTopic[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [leaveTimeout, setLeaveTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Procedures state
  const [procedureCategories, setProcedureCategories] = useState<string[]>([]);
  const [proceduresLoading, setProceduresLoading] = useState(true);
  const [procedures, setProcedures] = useState<ProcedureItem[]>([]);
  const [activeProcedureCategory, setActiveProcedureCategory] = useState<string | null>(null);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Set initial mobile state and attach event listener for window resize
  useEffect(() => {
    const checkMobile = () => {
      isMobile.current = window.innerWidth < 1024;
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Enhanced scroll handler with throttling for better performance
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    const handleScroll = () => {
      lastScrollY = window.scrollY;
      setScrollY(lastScrollY);
      
      // Simplified scroll detection - make it more immediate on mobile
      if (isMobile.current) {
        setScrolled(lastScrollY > 10);
      } else {
        setScrolled(lastScrollY > 20);
      }
      
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateHeaderOpacity(lastScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    
    const updateHeaderOpacity = (currentScrollY: number) => {
      if (!headerRef.current) return;
      
      // Simplified mobile opacity logic - more immediate/predictable
      if (isMobile.current && theme === 'transparent') {
        // On mobile with transparent theme, quickly transition to solid
        const opacity = currentScrollY > 10 ? 1 : 0.2;
        headerRef.current.style.setProperty('--header-bg-opacity', opacity.toString());
        headerRef.current.style.setProperty('--header-blur', opacity > 0.5 ? '8px' : '0px');
      } else if (!isMobile.current) {
        // Desktop can keep the existing gradual transition
        const maxScroll = 150;
        const baseOpacity = 0;
        const opacity = Math.min(baseOpacity + (currentScrollY / maxScroll), 1);
        headerRef.current.style.setProperty('--header-bg-opacity', opacity.toString());
        const blurValue = Math.min(Math.round(opacity * 10), 8);
        headerRef.current.style.setProperty('--header-blur', `${blurValue}px`);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initialize values on mount
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [theme]);

  // Close mobile menu and dropdowns when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  // Fetch categories and topics on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        setCategoriesLoading(true);
        // Fetch topics and categories
        const { categories, topics } = await getTopicsData();
        
        // Only add 'All' if it's not already in the categories
        const categoriesWithAll = 
          categories.includes('All') 
            ? categories 
            : ['All', ...categories.filter((cat: string | null) => cat)];
            
        setBoneJointCategories(categoriesWithAll);
        setBoneJointTopics(topics);
      } catch (error) {
        console.error("Failed to fetch Bone & Joint School categories:", error);
        setBoneJointCategories(['All']); // Fallback
        setBoneJointTopics([]);
      } finally {
        setCategoriesLoading(false);
      }
    }
    loadCategories();
  }, []);

  // Fetch procedures data on mount via server action (server-to-server, no CORS)
  useEffect(() => {
    async function loadProcedures() {
      try {
        setProceduresLoading(true);
        const { categories, procedures } = await getNavbarProceduresAction();
        setProcedureCategories(categories);
        setProcedures(procedures as any);
      } catch (error) {
        console.error("Failed to fetch procedures:", error);
        setProcedureCategories(['All']);
        setProcedures([]);
      } finally {
        setProceduresLoading(false);
      }
    }
    loadProcedures();
  }, []);

  const isTransparent = theme === 'transparent';
  const isLight = theme === 'light' || (theme === 'transparent' && scrolled);
  const isFixed = theme === 'fixed';

  // Main navigation links (Procedures removed from here as it's now a dropdown)
  const mainNavLinks = [
    { name: 'Home', href: '/' },
    { name: 'Surgeons & Staff', href: '/surgeons-staff' },
  ];

  // Education dropdown items
  const educationLinks = [
    { name: 'Bone & Joint School', href: '/bone-joint-school', hasSubmenu: true },
    // Can add more educational content here in the future
  ];

  // Sports Rehabilitation top-level link (replaces the old Resources dropdown)
  const sportsRehabLink = { name: 'Sports Rehabilitation', href: '/physiotherapy' };

  // Resources dropdown items (order per client spec)
  const mediaLinks = [
    { name: 'Clinical Videos', href: '/clinical-videos' },
    { name: 'Publications', href: '/publications' },
    { name: 'Blogs', href: '/blogs' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Fellowship Programme', href: '/fellowship-programme' },
    { name: 'Contact', href: '/contact' },
  ];

  // All mobile navigation links flattened with sections (Procedures removed as it's now a section)
  const allMobileLinks = [
    { name: 'Home', href: '/' },
    { name: 'Surgeons & Staff', href: '/surgeons-staff' },
    // Procedures section for mobile
    { section: 'Procedures' },
    { name: 'All Procedures', href: '/procedure-surgery' },
    ...(procedureCategories.filter(cat => cat !== 'All').map((category: string) => ({
      name: `  ${category}`, // Indent to show hierarchy  
      href: `/procedure-surgery?category=${encodeURIComponent(category)}`
    }))),
    // Add Bone Joint School section for mobile
    { section: 'Bone Joint School' },
    { name: 'Bone & Joint School', href: '/bone-joint-school' },
    ...(boneJointCategories.map((category: string) => ({
      name: `  ${category}`, // Indent to show hierarchy
      href: `/bone-joint-school${category === 'All' ? '' : `?category=${encodeURIComponent(category)}`}`
    }))),
    sportsRehabLink,
    { section: 'Resources' },
    ...mediaLinks,
  ];

  // Enhanced mouse over handlers with delay
  const handleMouseEnter = (dropdown: string) => {
    // Only activate hover behavior on desktop
    if (!isMobile.current) {
      // Clear any existing timeout
      if (leaveTimeout) {
        clearTimeout(leaveTimeout);
        setLeaveTimeout(null);
      }
      setActiveDropdown(dropdown);
      // Reset category when entering main dropdown
      if (dropdown !== 'education') {
        setActiveCategory(null);
      }
      if (dropdown !== 'procedures') {
        setActiveProcedureCategory(null);
      }
    }
  };

  const handleMouseLeave = () => {
    // Only deactivate hover behavior on desktop
    if (!isMobile.current) {
      // Set a timeout to delay menu closing
      const timeout = setTimeout(() => {
        setActiveDropdown(null);
        setActiveCategory(null);
        setActiveProcedureCategory(null);
      }, 500); // Increased to 500ms for better UX
      
      setLeaveTimeout(timeout);
    }
  };

  // Handle category hover with delay
  const handleCategoryMouseEnter = (category: string) => {
    if (!isMobile.current) {
      // Clear any existing timeout
      if (leaveTimeout) {
        clearTimeout(leaveTimeout);
        setLeaveTimeout(null);
      }
      console.log('Setting active category:', category); // Debug log
      setActiveCategory(category);
    }
  };

  // Handle menu container mouse enter - clear any closing timeout
  const handleMenuContainerMouseEnter = () => {
    if (leaveTimeout) {
      clearTimeout(leaveTimeout);
      setLeaveTimeout(null);
    }
  };

  // Get category icon based on name
  const getCategoryIcon = (category: string) => {
    switch(category.toLowerCase()) {
      case 'knee':
        return <Activity className="h-4 w-4 mr-2 text-[#8B5C9E] opacity-70" />;
      case 'shoulder':
        return <Activity className="h-4 w-4 mr-2 text-[#8B5C9E] opacity-70" />;
      case 'hip':
        return <Activity className="h-4 w-4 mr-2 text-[#8B5C9E] opacity-70" />;
      case 'elbow':
        return <Activity className="h-4 w-4 mr-2 text-[#8B5C9E] opacity-70" />;
      case 'hand & wrist':
        return <Activity className="h-4 w-4 mr-2 text-[#8B5C9E] opacity-70" />;
      case 'foot & ankle':
        return <Activity className="h-4 w-4 mr-2 text-[#8B5C9E] opacity-70" />;
      case 'spine':
        return <Activity className="h-4 w-4 mr-2 text-[#8B5C9E] opacity-70" />;
      case 'achilles':
        return <Activity className="h-4 w-4 mr-2 text-[#8B5C9E] opacity-70" />;
      default:
        return <Bookmark className="h-4 w-4 mr-2 text-gray-400" />;
    }
  };

  // Get topics for a specific category
  const getTopicsForCategory = (category: string) => {
    if (!category || category === 'All') {
      return boneJointTopics;
    }
    return boneJointTopics.filter(topic => topic.category === category);
  };

  // Get procedures for a specific category
  const getProceduresForCategory = (category: string) => {
    if (!category || category === 'All') {
      return procedures;
    }
    return procedures.filter(proc => proc.category === category);
  };

  // Handle procedure category hover
  const handleProcedureCategoryMouseEnter = (category: string) => {
    if (!isMobile.current) {
      if (leaveTimeout) {
        clearTimeout(leaveTimeout);
        setLeaveTimeout(null);
      }
      setActiveProcedureCategory(category);
    }
  };

  // Update your Link components to use the router for smoother transitions
  const handleNavigation = (href: string) => {
    router.push(href);
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  };

  // Helper function to get text and icon colors based on scroll position
  const getTextColor = (baseScrolled = scrolled) => {
    // With the new dark header, the text should be white unless it's transparent and not scrolled.
    if (isTransparent && !baseScrolled) {
      return 'text-white';
    }
    // All other cases (scrolled, fixed, default theme) will have a dark background.
    return 'text-white';
  };

  // Fallback categories if API data isn't loading
  const fallbackCategories = ['Knee', 'Shoulder', 'Hip', 'Elbow', 'Hand & Wrist', 'Foot & Ankle', 'Spine', 'Achilles'];
  const displayCategories = boneJointCategories.length > 1 ? boneJointCategories : fallbackCategories;

  return (
    <>
      <header 
        ref={headerRef}
        className={`w-full z-50 transition-all duration-300 flex items-center ${
          isFixed ? 'fixed top-0 left-0 right-0' : 'absolute top-0 left-0 right-0'
        } ${
          isTransparent ? 'bg-opacity-var backdrop-blur-var' : 'bg-soi-navy-700'
        } ${className}`}
        style={{
          // CSS variables will be set via JS for dynamic opacity and blur
          '--header-bg-opacity': '0',
          '--header-blur': '0px',
          height: scrolled ? 'var(--header-height-scrolled, 72px)' : 'var(--header-height, 88px)',
          backgroundColor: isTransparent ? `rgba(42, 77, 107, var(--header-bg-opacity))` : '',
          backdropFilter: isTransparent ? `blur(var(--header-blur))` : '',
          boxShadow: scrolled ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : 'none'
        } as CSSProperties}
      >
        <div className="container mx-auto px-4 flex items-center h-full">
          <div className="flex items-center w-full">
            {/* Logo and Brand - left flex-1 zone */}
            <div className="flex items-center flex-1">
              <button 
                onClick={() => handleNavigation('/')} 
                className="group flex items-start space-x-3"
                aria-label="Go to homepage"
              >
                <div className="relative h-[44px] w-[44px] md:h-[52px] md:w-[52px] overflow-hidden shadow-sm transition-all duration-300 group-hover:shadow-md">
                  <Image
                    src="/logo.jpg"
                    alt=""
                    width={78}
                    height={78}
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="flex flex-col justify-start text-left">
                  <span className={`whitespace-nowrap font-bold text-sm md:text-base leading-tight tracking-tight transition-colors duration-300 ${getTextColor()}`}>
                    Sports Orthopedics
                  </span>
                  <span className={`whitespace-nowrap font-medium text-xs md:text-sm leading-tight transition-colors duration-300 ${getTextColor()}`}>
                    Institute
                  </span>
                </div>
              </button>
            </div>
            
            {/* Desktop Navigation - centered between the two flex-1 zones */}
            <nav className={`hidden lg:flex items-center px-4 2xl:px-8 py-2 rounded-full transition-all duration-300 ${
              isTransparent && !scrolled
                ? 'bg-white/10 backdrop-blur-sm'
                : 'bg-soi-navy-900/50 backdrop-blur-sm'
            }`}>
                <ul className="flex items-center">
                  {mainNavLinks.map((item) => (
                    <li key={item.name} className="mr-5 2xl:mr-8">
                      <button
                        onClick={() => handleNavigation(item.href)}
                        className={`whitespace-nowrap text-sm 2xl:text-base font-medium transition-colors duration-300 relative group ${
                          isTransparent && !scrolled
                            ? 'text-white hover:text-white/80'
                            : 'text-gray-200 hover:text-soi-mint-400'
                        } py-2 block`}
                      >
                        {item.name}
                        <span className={`absolute bottom-0 left-0 w-0 h-0.5 ${
                          isTransparent && !scrolled ? 'bg-white' : 'bg-soi-mint-400'
                        } group-hover:w-full transition-all duration-300`}></span>
                      </button>
                    </li>
                  ))}
                  
                  {/* Procedures Dropdown */}
                  <li
                    className="relative mr-5 2xl:mr-8"
                    onMouseEnter={() => handleMouseEnter('procedures')}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      className={`whitespace-nowrap text-sm 2xl:text-base font-medium transition-colors duration-300 flex items-center group ${
                        isTransparent && !scrolled
                          ? 'text-white hover:text-white/80'
                          : 'text-gray-200 hover:text-soi-mint-400'
                      } py-2`}
                      aria-expanded={activeDropdown === 'procedures'}
                      aria-haspopup="true"
                    >
                      Procedures
                      <span className={`flex items-center justify-center ml-2 w-5 h-5 ${
                        isTransparent && !scrolled
                          ? 'bg-white/20 group-hover:bg-white/30'
                          : 'bg-soi-navy-600 group-hover:bg-soi-navy-500'
                      } rounded-full transition-all duration-150 ${activeDropdown === 'procedures' ? 'rotate-180' : ''}`}>
                        <ChevronDown className={`w-3.5 h-3.5 ${
                          isTransparent && !scrolled ? 'text-white' : 'text-soi-mint-400'
                        }`} />
                      </span>
                      <span className={`absolute bottom-0 left-0 w-0 h-0.5 ${
                        isTransparent && !scrolled ? 'bg-white' : 'bg-soi-mint-400'
                      } group-hover:w-full transition-all duration-300`}></span>
                    </button>
                    
                    {/* Procedures Dropdown Menu */}
                    {activeDropdown === 'procedures' && (
                      <div className="absolute top-full left-0 pt-2 z-[60]">
                        <div 
                          className="bg-white rounded-xl shadow-2xl border border-gray-100/80 w-80 overflow-visible"
                          onMouseEnter={handleMenuContainerMouseEnter}
                        >
                          <div className="p-4 pr-8">
                            {/* View All Procedures Link */}
                            <Link
                              href="/procedure-surgery"
                              className="flex items-center px-3 py-2 mb-3 rounded-lg bg-[#8B5C9E]/5 hover:bg-[#8B5C9E]/10 transition-colors"
                              onClick={() => setActiveDropdown(null)}
                            >
                              <BookOpen className="h-4 w-4 mr-2 text-[#8B5C9E]" />
                              <span className="font-semibold text-[#8B5C9E]">View All Procedures</span>
                            </Link>
                            
                            <h4 className="font-bold text-gray-900 mb-3 px-2">Procedures by Category</h4>
                            
                            {proceduresLoading ? (
                              <div className="text-center py-4 text-gray-500">
                                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#8B5C9E]"></div>
                                <p className="mt-2 text-sm">Loading procedures...</p>
                              </div>
                            ) : procedureCategories.length === 0 ? (
                              <div className="text-center py-4 text-gray-500">No procedures found</div>
                            ) : (
                              <div className="space-y-1">
                                {procedureCategories
                                  .filter(category => category !== 'All')
                                  .map(category => {
                                    const categoryProcedures = getProceduresForCategory(category);
                                    
                                    return (
                                      <div 
                                        key={category}
                                        className="relative group"
                                      >
                                        <div
                                          className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                          onMouseEnter={() => handleProcedureCategoryMouseEnter(category)}
                                        >
                                          <Link
                                            href={`/procedure-surgery?category=${encodeURIComponent(category)}`}
                                            className="flex items-center flex-1"
                                            onClick={() => setActiveDropdown(null)}
                                          >
                                            <Activity className="h-4 w-4 mr-2 text-[#8B5C9E] opacity-70" />
                                            <span className="font-medium text-gray-900">{category}</span>
                                            <span className="ml-2 text-xs text-gray-500">({categoryProcedures.length})</span>
                                          </Link>
                                          {categoryProcedures.length > 0 && (
                                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#8B5C9E] transition-colors" />
                                          )}
                                        </div>

                                        {/* Procedures submenu */}
                                        {categoryProcedures.length > 0 && activeProcedureCategory === category && (
                                          <div 
                                            className="absolute left-full top-0 ml-2 z-[80] transition-all duration-200"
                                          >
                                            <div
                                              className="bg-white rounded-xl shadow-2xl border border-gray-100/80 w-80 max-h-[400px] overflow-y-auto"
                                              onMouseEnter={handleMenuContainerMouseEnter}
                                            >
                                              <div className="p-4">
                                                <h5 className="font-bold text-gray-900 mb-3 px-2">{category} Procedures</h5>
                                                <ul className="space-y-1">
                                                  {categoryProcedures.slice(0, 10).map((procedure: ProcedureItem) => (
                                                    <li key={procedure.slug}>
                                                      <Link
                                                        href={`/procedure-surgery/${procedure.slug}`}
                                                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-[#8B5C9E]/10 hover:text-[#8B5C9E] rounded-lg transition-colors"
                                                        onClick={() => setActiveDropdown(null)}
                                                      >
                                                        {procedure.title}
                                                      </Link>
                                                    </li>
                                                  ))}
                                                  {categoryProcedures.length > 10 && (
                                                    <li>
                                                      <Link
                                                        href={`/procedure-surgery?category=${encodeURIComponent(category)}`}
                                                        className="block px-3 py-2 text-sm font-medium text-[#8B5C9E] hover:bg-[#8B5C9E]/10 rounded-lg transition-colors"
                                                        onClick={() => setActiveDropdown(null)}
                                                      >
                                                        View all {categoryProcedures.length} {category} procedures →
                                                      </Link>
                                                    </li>
                                                  )}
                                                </ul>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                  
                  {/* Bone Joint School Dropdown */}
                  <div
                    className="relative group"
                    onMouseEnter={() => handleMouseEnter('education')}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button className={`whitespace-nowrap inline-flex items-center gap-1 px-2 2xl:px-4 py-2 text-sm 2xl:text-base font-medium transition-colors ${
                      isTransparent && !scrolled
                        ? 'text-white hover:text-white/80'
                        : 'text-gray-200 hover:text-soi-mint-400'
                    }`}>
                      Bone Joint School
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                        activeDropdown === 'education' ? 'rotate-180' : ''
                      }`} />
                    </button>
                    
                    {/* Level 1: Main dropdown */}
                    {activeDropdown === 'education' && (
                      <div className="absolute top-full left-0 pt-2 z-[60]">
                        <div 
                          className="bg-white rounded-xl shadow-2xl border border-gray-100/80 w-80 overflow-visible"
                          onMouseEnter={handleMenuContainerMouseEnter}
                        >
                          {/* Categories directly in main dropdown */}
                          <div className="p-4 pr-8">
                            {/* View All Bone Joint School Link */}
                            <Link
                              href="/bone-joint-school"
                              className="flex items-center px-3 py-2 mb-3 rounded-lg bg-[#8B5C9E]/5 hover:bg-[#8B5C9E]/10 transition-colors"
                              onClick={() => setActiveDropdown(null)}
                            >
                              <BookOpen className="h-4 w-4 mr-2 text-[#8B5C9E]" />
                              <span className="font-semibold text-[#8B5C9E]">View All Bone Joint School</span>
                            </Link>

                            <h4 className="font-bold text-gray-900 mb-3 px-2">Categories</h4>
                            {categoriesLoading ? (
                              <div className="text-center py-4 text-gray-500">Loading...</div>
                            ) : displayCategories.length === 0 ? (
                              <div className="text-center py-4 text-gray-500">No categories found</div>
                            ) : (
                              <div className="space-y-1">
                                {displayCategories
                                  .filter(category => category !== 'All')
                                  .map(category => {
                                    const categoryTopics = getTopicsForCategory(category);
                                    
                                    return (
                                      <div 
                                        key={category}
                                        className="relative group"
                                      >
                                        <div
                                          className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                          onMouseEnter={() => handleCategoryMouseEnter(category)}
                                        >
                                          <Link
                                            href={`/bone-joint-school?category=${category}`}
                                            className="flex items-center flex-1"
                                            onClick={() => setActiveDropdown(null)}
                                          >
                                            {getCategoryIcon(category)}
                                            <span className="font-medium text-gray-900">{category}</span>
                                            <span className="ml-2 text-xs text-gray-500">({categoryTopics.length})</span>
                                          </Link>
                                          {categoryTopics.length > 0 && (
                                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#8B5C9E]" />
                                          )}
                                        </div>

                                        {/* Topics submenu - Properly positioned next to category */}
                                        {categoryTopics.length > 0 && activeCategory === category && (
                                          <div 
                                            className="absolute left-full top-0 ml-2 z-[80] transition-all duration-200"
                                          >
                                            <div
                                              className="bg-white rounded-xl shadow-2xl border border-gray-100/80 w-80 max-h-[400px] overflow-y-auto"
                                              onMouseEnter={handleMenuContainerMouseEnter}
                                            >
                                              <div className="p-4">
                                                <h5 className="font-bold text-gray-900 mb-3 px-2 capitalize">{category} Topics</h5>
                                                <ul className="space-y-1">
                                                  {categoryTopics.map((topic: BoneJointTopic) => (
                                                    <li key={topic.slug}>
                                                      <Link
                                                        href={`/bone-joint-school/${topic.slug}`}
                                                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-[#8B5C9E]/10 hover:text-[#8B5C9E] rounded-lg transition-colors"
                                                        onClick={() => setActiveDropdown(null)}
                                                      >
                                                        {topic.title}
                                                      </Link>
                                                    </li>
                                                  ))}
                                                </ul>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Sports Rehabilitation - top-level link */}
                  <li className="mr-5 2xl:mr-8">
                    <button
                      onClick={() => handleNavigation(sportsRehabLink.href)}
                      className={`whitespace-nowrap text-sm 2xl:text-base font-medium transition-colors duration-300 relative group ${
                        isTransparent && !scrolled
                          ? 'text-white hover:text-white/80'
                          : 'text-gray-200 hover:text-soi-mint-400'
                      } py-2 block`}
                    >
                      {sportsRehabLink.name}
                      <span className={`absolute bottom-0 left-0 w-0 h-0.5 ${
                        isTransparent && !scrolled ? 'bg-white' : 'bg-soi-mint-400'
                      } group-hover:w-full transition-all duration-300`}></span>
                    </button>
                  </li>

                  {/* Media Dropdown - Using hover with delay */}
                  <li
                    className="relative"
                    onMouseEnter={() => handleMouseEnter('media')}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      className={`whitespace-nowrap text-sm 2xl:text-base font-medium transition-colors duration-300 flex items-center group ${
                        isTransparent && !scrolled
                          ? 'text-white hover:text-white/80'
                          : 'text-gray-200 hover:text-soi-mint-400'
                      } py-2`}
                      aria-expanded={activeDropdown === 'media'}
                      aria-haspopup="true"
                    >
                      Resources
                      <span className={`flex items-center justify-center ml-2 w-5 h-5 ${
                        isTransparent && !scrolled
                          ? 'bg-white/20 group-hover:bg-white/30'
                          : 'bg-soi-navy-600 group-hover:bg-soi-navy-500'
                      } rounded-full transition-all duration-150 ${activeDropdown === 'media' ? 'rotate-180' : ''}`}>
                        <ChevronDown className={`w-3.5 h-3.5 ${
                          isTransparent && !scrolled ? 'text-white' : 'text-soi-mint-400'
                        }`} />
                      </span>
                      <span className={`absolute bottom-0 left-0 w-0 h-0.5 ${
                        isTransparent && !scrolled ? 'bg-white' : 'bg-soi-mint-400'
                      } group-hover:w-full transition-all duration-300`}></span>
                    </button>
                    
                    {activeDropdown === 'media' && (
                      <div 
                        className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100"
                        onMouseEnter={handleMenuContainerMouseEnter}
                        role="menu"
                        aria-label="Resources"
                      >
                        {mediaLinks.map((item) => (
                          <button
                            key={item.name}
                            onClick={() => handleNavigation(item.href)}
                            className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-50 hover:text-[#8B5C9E] transition-colors duration-150"
                            role="menuitem"
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </li>
                </ul>
              </nav>

            {/* Right cluster - right flex-1 zone (booking CTA + mobile hamburger) */}
            <div className="flex items-center justify-end flex-1 gap-2">
              {/* Desktop Booking Button — compact at lg, full at 2xl+ */}
              <BookingButton
                className={`hidden lg:flex px-4 2xl:px-6 py-2 2xl:py-3 rounded-full text-sm 2xl:text-base font-medium transition-colors duration-300 shadow-sm hover:shadow-md items-center whitespace-nowrap ${
                  isTransparent && scrollY < 50
                    ? 'bg-white text-[#8B5C9E] hover:bg-white/90'
                    : 'bg-[#8B5C9E] text-white hover:bg-[#7a4f8a]'
                }`}
                icon={<Calendar className="w-4 h-4 2xl:w-5 2xl:h-5 mr-1.5 2xl:mr-2" />}
                text={
                  <>
                    <span className="2xl:hidden">Book Now</span>
                    <span className="hidden 2xl:inline">Book an Appointment</span>
                  </>
                }
                ariaLabel="Book an Appointment"
              />

              {/* Mobile Booking Button (compact) */}
              <BookingButton
                className={`lg:hidden px-3 py-2 rounded-full font-medium transition-colors duration-300 shadow-sm hover:shadow-md flex items-center ${
                  isTransparent && !scrolled
                    ? 'bg-white text-[#8B5C9E] hover:bg-white/90'
                    : 'bg-[#8B5C9E] text-white hover:bg-[#7a4f8a]'
                }`}
                icon={<Calendar className="w-4 h-4" />}
                text=""
                ariaLabel="Book an Appointment"
              />

              {/* Mobile Menu Button */}
              <button
                className={`lg:hidden p-2 rounded-full transition-colors duration-300 ${
                  isTransparent && !scrolled
                    ? 'bg-white/20 hover:bg-white/30'
                    : 'bg-soi-navy-600 hover:bg-soi-navy-500'
                }`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                <Menu className={`transition-colors duration-300 ${
                  isTransparent && !scrolled ? 'text-white' : 'text-soi-mint-400'
                }`} size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-[280px] max-w-[80vw] bg-white shadow-xl z-50 flex flex-col"
            >
              {/* Drawer Header */}
              <div className="border-b border-gray-100 p-4 flex justify-between items-center">
                <div className="flex items-start space-x-3">
                  <div className="relative h-[44px] w-[44px] overflow-hidden shadow-sm">
                    <Image
                      src="/logo.jpg"
                      alt=""
                      width={78}
                      height={78}
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col justify-start text-left">
                    <span className="font-bold text-sm leading-tight tracking-tight text-[#8B5C9E]">
                      Sports Orthopedics
                    </span>
                    <span className="font-medium text-xs leading-tight text-[#8B5C9E]">
                      Institute
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5 text-[#8B5C9E]" />
                </button>
              </div>
              
              {/* Drawer Content - Navigation */}
              <div className="flex-1 overflow-y-auto">
                <nav className="py-4">
                  {/* Display main navigation links first */}
                  {mainNavLinks.map((item) => (
                    <button
                      key={item.href}
                      onClick={() => handleNavigation(item.href)}
                      className={`flex w-full text-left px-4 py-3 text-gray-800 hover:bg-gray-50 transition-colors ${
                        pathname === item.href ? 'bg-gray-50 text-[#8B5C9E] font-medium' : ''
                      }`}
                    >
                      {item.name}
                    </button>
                  ))}

                  {/* Procedures Section */}
                  {!proceduresLoading && procedureCategories.length > 0 && (
                    <div className="mt-4">
                      <div className="px-4 pt-2 pb-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Procedures
                      </div>

                      {/* "All Procedures" link */}
                      <button
                        key="procedures-all"
                        onClick={() => handleNavigation('/procedure-surgery')}
                        className={`flex w-full text-left px-4 py-3 text-gray-800 hover:bg-gray-50 transition-colors ${
                          pathname === '/procedure-surgery' && !pathname.includes('?category=') 
                            ? 'bg-gray-50 text-[#8B5C9E] font-medium' 
                            : ''
                        }`}
                      >
                        <BookOpen className="h-4 w-4 mr-2 text-[#8B5C9E] opacity-70" />
                        All Procedures
                      </button>

                      {/* Categories as expandable sections */}
                      {procedureCategories.filter(cat => cat !== 'All').map((category) => (
                        <div key={`mobile-procedure-category-${category}`} className="relative">
                          <button
                            onClick={() => {
                              if (activeProcedureCategory === category) {
                                setActiveProcedureCategory(null);
                              } else {
                                setActiveProcedureCategory(category);
                              }
                            }}
                            className={`flex w-full text-left px-4 py-3 text-gray-800 hover:bg-gray-50 transition-colors justify-between items-center ${
                              pathname.includes(`/procedure-surgery?category=${encodeURIComponent(category)}`) 
                                ? 'bg-gray-50 text-[#8B5C9E] font-medium' 
                                : ''
                            }`}
                          >
                            <div className="flex items-center">
                              <Activity className="h-4 w-4 mr-2 text-[#8B5C9E] opacity-70" />
                              <span>{category}</span>
                              <span className="ml-2 text-xs text-gray-500">({getProceduresForCategory(category).length})</span>
                            </div>
                            <ChevronDown 
                              className={`h-4 w-4 transition-transform ${activeProcedureCategory === category ? 'rotate-180' : ''}`} 
                            />
                          </button>

                          {/* Expanded procedures for this category */}
                          {activeProcedureCategory === category && (
                            <div className="bg-gray-50">
                              {getProceduresForCategory(category).slice(0, 8).map(procedure => (
                                <button
                                  key={`mobile-procedure-${procedure.slug}`}
                                  onClick={() => handleNavigation(`/procedure-surgery/${procedure.slug}`)}
                                  className={`flex w-full text-left pl-8 pr-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors ${
                                    pathname.includes(procedure.slug) 
                                      ? 'bg-gray-100 text-[#8B5C9E] font-medium' 
                                      : ''
                                  }`}
                                >
                                  {procedure.title}
                                </button>
                              ))}
                              {getProceduresForCategory(category).length > 8 && (
                                <button
                                  onClick={() => handleNavigation(`/procedure-surgery?category=${encodeURIComponent(category)}`)}
                                  className="flex w-full text-left pl-8 pr-4 py-2 text-[#8B5C9E] hover:bg-gray-100 transition-colors font-medium"
                                >
                                  View all {getProceduresForCategory(category).length} procedures →
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Education Section */}
                  {!categoriesLoading && boneJointCategories.length > 0 && (
                    <div className="mt-4">
                      <div className="px-4 pt-2 pb-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
                                                  Bone Joint School
                      </div>

                      {/* "All" category */}
                      <button
                        key="bone-joint-all"
                        onClick={() => handleNavigation('/bone-joint-school')}
                        className={`flex w-full text-left px-4 py-3 text-gray-800 hover:bg-gray-50 transition-colors ${
                          pathname === '/bone-joint-school' && !pathname.includes('?category=') 
                            ? 'bg-gray-50 text-[#8B5C9E] font-medium' 
                            : ''
                        }`}
                      >
                        All Topics
                      </button>

                      {/* Categories as expandable sections */}
                      {boneJointCategories.filter(cat => cat !== 'All').map((category) => (
                        <div key={`mobile-category-${category}`} className="relative">
                          <button
                            onClick={() => {
                              if (activeCategory === category) {
                                setActiveCategory(null);
                              } else {
                                setActiveCategory(category);
                              }
                            }}
                            className={`flex w-full text-left px-4 py-3 text-gray-800 hover:bg-gray-50 transition-colors justify-between items-center ${
                              pathname.includes(`?category=${encodeURIComponent(category)}`) 
                                ? 'bg-gray-50 text-[#8B5C9E] font-medium' 
                                : ''
                            }`}
                          >
                            <span>{category}</span>
                            <ChevronDown 
                              className={`h-4 w-4 transition-transform ${activeCategory === category ? 'rotate-180' : ''}`} 
                            />
                          </button>

                          {/* Expanded topics for this category */}
                          {activeCategory === category && (
                            <div className="bg-gray-50">
                              {getTopicsForCategory(category).map(topic => (
                                <button
                                  key={`mobile-topic-${topic.slug}`}
                                  onClick={() => handleNavigation(`/bone-joint-school/${topic.slug}`)}
                                  className={`flex w-full text-left pl-8 pr-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors ${
                                    pathname.includes(topic.slug) 
                                      ? 'bg-gray-100 text-[#8B5C9E] font-medium' 
                                      : ''
                                  }`}
                                >
                                  {topic.title}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Sports Rehabilitation - top-level link */}
                  <button
                    key={sportsRehabLink.href}
                    onClick={() => handleNavigation(sportsRehabLink.href)}
                    className={`flex w-full text-left px-4 py-3 text-gray-800 hover:bg-gray-50 transition-colors ${
                      pathname === sportsRehabLink.href ? 'bg-gray-50 text-[#8B5C9E] font-medium' : ''
                    }`}
                  >
                    {sportsRehabLink.name}
                  </button>

                  {/* Resources Section */}
                  {mediaLinks.length > 0 && (
                    <div className="mt-4">
                      <div className="px-4 pt-2 pb-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Resources
                      </div>
                      {mediaLinks.map((item) => (
                        <button
                          key={item.href}
                          onClick={() => handleNavigation(item.href)}
                          className={`flex w-full text-left px-4 py-3 text-gray-800 hover:bg-gray-50 transition-colors ${
                            pathname === item.href ? 'bg-gray-50 text-[#8B5C9E] font-medium' : ''
                          }`}
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  )}
                </nav>
              </div>
              
              {/* Drawer Footer - Booking Button */}
              <div className="border-t border-gray-100 p-4">
                <BookingButton 
                  className="w-full py-3 px-4 rounded-md font-medium transition-colors duration-300 shadow-md hover:shadow-lg flex items-center justify-center bg-[#8B5C9E] text-white hover:bg-[#7a4f8a]"
                  icon={<Calendar className="w-5 h-5 mr-2" />}
                  text="Book an Appointment"
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Header spacing element - only needed for pages without hero sections that overlay the header */}
      {!isTransparent && (
        <div className={`w-full ${isFixed ? 'h-16 md:h-16 lg:h-20' : 'h-16 md:h-16 lg:h-20'}`}></div>
      )}
    </>
  );
} 