'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export interface CategoryItem {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  count: number;
}

interface CategoryFilterProps {
  categories: CategoryItem[];
  activeCategory: string | null;
  onCategoryChange?: (categoryId: string | null) => void;
}

export const CategoryFilter = ({ 
  categories, 
  activeCategory, 
  onCategoryChange 
}: CategoryFilterProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Add scroll indicator logic
  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10); // 10px buffer
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      // Initial check
      checkScroll();

      // Check again after possible reflow/resize
      setTimeout(checkScroll, 100);
      
      // Cleanup
      return () => container.removeEventListener('scroll', checkScroll);
    }
  }, [categories]);

  // Handle scroll buttons
  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Handle category change with router navigation
  const handleCategoryChange = (categoryId: string | null) => {
    // Call the callback if provided
    if (onCategoryChange) {
      onCategoryChange(categoryId);
    }
    
    // Update URL with new category
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId === null) {
      params.delete('category');
    } else {
      params.set('category', categoryId);
    }
    
    // Reset page to 1 when changing category
    params.delete('page');
    
    // Navigate with new params
    router.push(`/procedure-surgery?${params.toString()}`);
  };

  // Get gradient color based on category ID
  const getCategoryColor = (category: CategoryItem) => {
    if (category.color) return category.color;

    // Use SOI purple expertise colors for consistency
    return 'from-soi-purple-500 to-soi-purple-600';
  };

  const handleMobileCategoryChange = (categoryId: string | null) => {
    handleCategoryChange(categoryId);
    setIsDropdownOpen(false);
  };

  const getActiveCategoryName = () => {
    if (activeCategory === null) return 'All Procedures';
    const category = categories.find(c => c.id === activeCategory);
    return category ? category.name : 'Select Category';
  };

  return (
    <div className="relative w-full">
      {/* Mobile Dropdown - Hidden on larger screens */}
      <div className="md:hidden relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-soi-purple-50 text-soi-navy-700 rounded-lg transition-colors duration-200 font-medium border border-soi-purple-200"
        >
          <span>{getActiveCategoryName()}</span>
          <ChevronDown 
            className={`w-5 h-5 transition-transform duration-200 text-soi-purple-500 ${isDropdownOpen ? 'rotate-180' : ''}`}
          />
        </button>
        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-20 border border-soi-purple-200 overflow-hidden"
            >
              <button
                onClick={() => handleMobileCategoryChange(null)}
                className={`block w-full text-left px-4 py-3 transition-colors duration-150 ${activeCategory === null ? 'bg-soi-purple-500 text-white font-semibold' : 'text-soi-navy-700 hover:bg-soi-purple-50'}`}
              >
                All Procedures
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleMobileCategoryChange(category.id)}
                  className={`block w-full text-left px-4 py-3 transition-colors duration-150 ${activeCategory === category.id ? 'bg-soi-purple-500 text-white font-semibold' : 'text-soi-navy-700 hover:bg-soi-purple-50'}`}
                >
                  {category.name}
                  {category.count > 0 && (
                    <span className="ml-2 text-xs opacity-70">({category.count})</span>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop Horizontal Scroll - Hidden on smaller screens */}
      <div className="hidden md:block relative">
        {/* Left scroll button */}
        {showLeftArrow && (
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2 hover:bg-soi-purple-50 transition-colors border border-soi-purple-200"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-6 w-6 text-soi-purple-600" />
          </button>
        )}

        {/* Scrollable container */}
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto py-4 px-1 space-x-3 no-scrollbar hide-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* All categories option */}
          <button
            onClick={() => handleCategoryChange(null)}
            className={`flex-shrink-0 px-5 py-2.5 rounded-full transition-all duration-200 whitespace-nowrap ${
              activeCategory === null 
                ? 'bg-gradient-to-r from-soi-purple-500 to-soi-purple-600 text-white shadow-md font-semibold'
                : 'bg-white hover:bg-soi-purple-50 text-soi-navy-700 border border-soi-purple-200'
            }`}
          >
            All Procedures
          </button>

          {/* Category buttons */}
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full transition-all duration-200 whitespace-nowrap ${
                activeCategory === category.id
                  ? `bg-gradient-to-r ${getCategoryColor(category)} text-white shadow-md font-semibold`
                  : 'bg-white hover:bg-soi-purple-50 text-soi-navy-700 border border-soi-purple-200'
              }`}
            >
              {category.name}
              {category.count > 0 && (
                <span className="ml-2 bg-white bg-opacity-30 px-2 py-0.5 rounded-full text-xs">
                  {category.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Right scroll button */}
        {showRightArrow && (
          <button 
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2 hover:bg-soi-purple-50 transition-colors border border-soi-purple-200"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-6 w-6 text-soi-purple-600" />
          </button>
        )}
      </div>
    </div>
  );
}; 