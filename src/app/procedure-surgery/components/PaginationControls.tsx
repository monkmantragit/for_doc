'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  queryParams?: Record<string, string>;
}

export const PaginationControls = ({ 
  currentPage, 
  totalPages,
  baseUrl,
  queryParams = {}
}: PaginationControlsProps) => {
  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;
  
  // Format query parameters for URL
  const formatQueryString = (page: number) => {
    const params = new URLSearchParams({ ...queryParams, page: page.toString() });
    return `?${params.toString()}`;
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // If 5 or fewer pages, show all
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first and last page
      pageNumbers.push(1);
      
      // Calculate range around current page
      const leftBound = Math.max(2, currentPage - 1);
      const rightBound = Math.min(totalPages - 1, currentPage + 1);
      
      // Add ellipsis if needed between 1 and leftBound
      if (leftBound > 2) {
        pageNumbers.push('ellipsis-left');
      }
      
      // Add pages around current page
      for (let i = leftBound; i <= rightBound; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis if needed between rightBound and totalPages
      if (rightBound < totalPages - 1) {
        pageNumbers.push('ellipsis-right');
      }
      
      // Add last page if there are more than one page
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  if (totalPages <= 1) {
    return null; // Don't show pagination for single page
  }

  return (
    <div className="flex justify-center items-center gap-2 my-12">
      {/* Previous Button */}
      {prevPage ? (
        <Link
          href={`${baseUrl}${formatQueryString(prevPage)}`}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md bg-white border border-soi-purple-200 text-soi-navy-700 hover:bg-soi-purple-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </Link>
      ) : (
        <button
          disabled
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md bg-soi-navy-100 border border-soi-navy-200 text-soi-navy-400 cursor-not-allowed"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>
      )}

      {/* Page Numbers */}
      <div className="hidden sm:flex items-center">
        {getPageNumbers().map((page, index) => {
          if (page === 'ellipsis-left' || page === 'ellipsis-right') {
            return (
              <span key={`ellipsis-${index}`} className="px-3 py-2 text-soi-navy-500">
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isCurrentPage = currentPage === pageNum;

          return isCurrentPage ? (
            <span
              key={pageNum}
              className="px-3 py-2 rounded-md bg-soi-purple-500 text-white font-medium"
            >
              {pageNum}
            </span>
          ) : (
            <Link
              key={pageNum}
              href={`${baseUrl}${formatQueryString(pageNum)}`}
              className="px-3 py-2 rounded-md hover:bg-soi-purple-50 text-soi-navy-700 font-medium"
            >
              {pageNum}
            </Link>
          );
        })}
      </div>

      {/* Mobile Page Indicator */}
      <div className="sm:hidden px-3 py-2 text-sm font-medium text-soi-navy-700">
        Page {currentPage} of {totalPages}
      </div>

      {/* Next Button */}
      {nextPage ? (
        <Link
          href={`${baseUrl}${formatQueryString(nextPage)}`}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md bg-white border border-soi-purple-200 text-soi-navy-700 hover:bg-soi-purple-50 transition-colors"
        >
          <span className="hidden sm:inline">Next</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : (
        <button
          disabled
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md bg-soi-navy-100 border border-soi-navy-200 text-soi-navy-400 cursor-not-allowed"
        >
          <span className="hidden sm:inline">Next</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}; 