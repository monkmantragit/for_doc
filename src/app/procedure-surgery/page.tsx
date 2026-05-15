'use server';

import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { ProcedureCard } from './components/ProcedureCard';
import { CategoryFilter } from './components/CategoryFilter';
import { InteractiveBodyMap } from './components/InteractiveBodyMap';
import { PaginationControls } from './components/PaginationControls';
import { ScrollToProceduresButton } from './components/ScrollToProceduresButton';
import { getProceduresWithFilters } from './actions';
import { getImageUrl } from '@/lib/directus';
import { Metadata } from 'next';
import HeroSection from '@/components/ui/HeroSection';
import { Calendar } from 'lucide-react';
import BookingButton from '@/components/BookingButton';

// Replace static metadata with a function
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Surgical Procedures | Orthopedic Surgery Options',
    description: 'Explore our specialized surgical procedures for joint, bone, and muscle conditions. Learn about recovery times, benefits, and treatment options.'
  };
}

// Define server props for the page
export default async function ProcedureSurgeryPage({
  searchParams
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  // Extract query parameters with defaults
  const page = typeof searchParams?.page === 'string' 
    ? parseInt(searchParams.page, 10) 
    : 1;
  
  const category = typeof searchParams?.category === 'string'
    ? searchParams.category
    : undefined;
  
  const search = typeof searchParams?.search === 'string'
    ? searchParams.search
    : undefined;
  
  // Fetch data using Directus
  const { procedures, total, totalPages, categories } = await getProceduresWithFilters({
    category,
    search,
    page,
    limit: 18 // Increased to show more items per page
  });
  
  // Get query parameters for pagination links (without page param)
  const queryParams: Record<string, string> = {};
  if (category) {
    queryParams.category = category;
  }
  if (search) {
    queryParams.search = search;
  }

  // Convert categories to the format expected by InteractiveBodyMap and CategoryFilter
  const categoryOptions = categories.map(cat => ({
    id: cat === 'All' ? '' : cat,
    name: cat,
    count: 0 // TODO: Add proper count when available from API
  }));

  return (
    <div className="min-h-screen bg-tint-authority">
      <SiteHeader theme="transparent" />
      
      <main>
        {/* Hero Section - Match homepage style */}
        <HeroSection
          className="pt-24"
          variant="color"   // Change variant to color
          height="medium"
          bgColor="#1e3a5f" 
          title={
            // Add Badge
            <div className="max-w-5xl mx-auto">
              <div className="inline-block bg-soi-purple-500/20 text-white px-4 py-1 rounded-lg text-sm font-medium mb-6 backdrop-blur-sm border border-soi-purple-500/30">
                ADVANCED SURGICAL OPTIONS
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-4">
                <span className="block">Specialized</span>
                <span className="block mt-2">Surgical Procedures</span>
              </h1>
            </div>
          }
          subtitle={
            <span className="text-white/90">
              Explore our comprehensive range of advanced surgical procedures designed to restore function and improve quality of life.
            </span>
          }
          actions={
            // Add flex container for buttons
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-8">
              {/* Primary Action: Booking Button */}
              <BookingButton 
                className="bg-soi-navy-500 hover:bg-soi-navy-600 text-white rounded-lg px-8 sm:px-10 py-3 text-base font-medium transition-all duration-300 hover:shadow-lg w-full sm:w-auto"
                icon={null}
                text="Book Consultation"
              />
              {/* Secondary Action: Scroll Button */}
              <ScrollToProceduresButton />
            </div>
          }
        >
          {/* Use default color for body map */}
          <InteractiveBodyMap categories={categoryOptions} /> 
        </HeroSection>
        
        {/* Search and Filter Section */}
        <section className="py-12 px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-soi-navy-800 mb-6">Find Your Procedure</h2>
              {search && (
                <div className="mb-4 p-3 bg-soi-purple-50 rounded-lg border border-soi-purple-200">
                  <p className="text-sm text-soi-purple-800">
                    Showing results for: <strong>"{search}"</strong>
                    {' '}
                    <a 
                      href="/procedure-surgery" 
                      className="text-soi-purple-600 hover:text-soi-purple-700 underline ml-2"
                    >
                      Clear search
                    </a>
                  </p>
                </div>
              )}
            </div>
            <h3 className="text-lg font-semibold text-soi-navy-800 mb-4">Filter by Category</h3>
            <CategoryFilter 
              categories={categoryOptions} 
              activeCategory={category || ''} 
            />
          </div>
        </section>
        
        {/* Procedures Grid */}
        <section id="procedures-section" className="py-8 px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-soi-navy-800">
                {category && category !== 'All'
                  ? `${category} Procedures`
                  : 'All Procedures'
                }
              </h2>
              <p className="text-soi-navy-500">
                Showing {procedures.length} of {total} procedures
              </p>
            </div>
            
            {procedures.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {procedures.map((procedure) => (
                  <ProcedureCard 
                    key={procedure.slug}
                    slug={procedure.slug}
                    title={procedure.title}
                    category={procedure.category || 'General'}
                    categoryId={procedure.category || ''}
                    summary={procedure.content_text || procedure.meta_description || ''}
                    imageUrl={getImageUrl(procedure.featured_image_url || null) || '/images/default-procedure.jpg'}
                    procedureTime={procedure.difficulty_level}
                    recoveryPeriod={procedure.recovery_time}
                    inpatient={false}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-soi-purple-200">
                <h3 className="text-xl font-medium text-soi-navy-800 mb-2">No procedures found</h3>
                <p className="text-soi-navy-600">
                  {category && category !== 'All'
                    ? 'No procedures found in this category. Please try another category.'
                    : 'No procedures found. Please check back later.'}
                </p>
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <PaginationControls
                currentPage={page}
                totalPages={totalPages}
                baseUrl="/procedure-surgery"
                queryParams={queryParams}
              />
            )}
          </div>
        </section>
        
        {/* Info Section */}
        <section className="py-16 px-4 md:px-8 lg:px-12 bg-white border-t border-soi-purple-200">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-soi-navy-800 mb-6 text-center">About Our Surgical Procedures</h2>
            <div className="prose lg:prose-lg mx-auto prose-headings:text-soi-navy-800 prose-p:text-soi-navy-600 prose-strong:text-soi-navy-800">
              <p>
                Our orthopedic surgical procedures are designed to address a wide range of musculoskeletal conditions,
                from sports injuries to degenerative joint diseases. Our experienced surgeons utilize the latest
                techniques and technology to provide optimal outcomes for our patients.
              </p>
              <p>
                When considering surgery, we believe in thoroughly educating our patients about their options,
                potential benefits, risks, and recovery expectations. Each procedure page provides detailed
                information to help you make informed decisions about your care.
              </p>
              <p>
                Whether you require minimally invasive arthroscopic surgery or complex joint reconstruction,
                our team is committed to delivering personalized care and supporting you throughout your
                surgical journey.
              </p>
            </div>
          </div>
        </section>
      </main>
      
      <SiteFooter />
    </div>
  );
} 