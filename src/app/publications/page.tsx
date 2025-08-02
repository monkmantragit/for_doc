import Link from 'next/link';
import Image from 'next/image';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { Metadata } from 'next';
import { BookOpen, Calendar, User, ChevronRight, ArrowRight } from 'lucide-react';
import ClientImage from '@/app/components/ClientImage';
import HeroSection from '@/components/ui/HeroSection';
import { Button } from '@/components/ui/button';
import BookingButton from '@/components/BookingButton';
import { ScrollToContentButton } from './components/ScrollToContentButton';
import { getPublicationsAction } from '@/app/actions/publications';
import type { Publication } from '@/types/publications';

// Add metadata for SEO
export const metadata: Metadata = {
  title: 'Academic Publications | Orthopedic Research',
  description: 'Explore our collection of academic publications and research articles by our medical experts.',
  openGraph: {
    title: 'Academic Publications | Sports Orthopedics',
    description: 'Scholarly articles and research publications by our orthopedic specialists',
    images: ['/images/default-procedure.jpg'],
  }
};

// Default fallback image
const DEFAULT_IMAGE = '/images/default-procedure.jpg';

// Publication Card Component
function PublicationCard({ publication }: { publication: Publication }) {
  const { title, featured_image_url, source_url, authors, publication_date, slug, content_html, publication_type, category } = publication;
  
  // Use already processed image URL with fallback
  const imageUrl = featured_image_url || DEFAULT_IMAGE;
  
  // Always link to individual publication page - let that page handle content vs external link
  // const hasContent = Boolean(content_html && content_html.trim().length > 0);
  
  // Format the title for display (remove common suffixes)
  const displayTitle = title.replace(' | Sports Orthopedics', '').trim();
  
  // Format publication date
  const formattedDate = publication_date ? new Date(publication_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : '';
  
  return (
    <Link 
      href={`/publications/${slug}`}
      className="group block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-soi-navy-200 hover:border-soi-navy-400"
    >
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gray-200">
          <ClientImage
            src={imageUrl}
            alt={displayTitle}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            unoptimized={true}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
      </div>
      
      <div className="p-5">
        <h3 className="text-lg font-bold text-soi-navy-800 mb-2 line-clamp-2 group-hover:text-soi-navy-600 transition-colors leading-tight">
          {displayTitle}
        </h3>
        
        <div className="flex flex-col space-y-2 text-sm text-soi-navy-600 mb-4">
          {authors && (
            <div className="flex items-center min-w-0">
              <User className="w-4 h-4 mr-1 flex-shrink-0 text-soi-navy-500" />
              <span className="line-clamp-1 truncate">{authors}</span>
            </div>
          )}
          
          {publication_type && (
            <div className="flex items-center min-w-0">
              <BookOpen className="w-4 h-4 mr-1 flex-shrink-0 text-soi-navy-500" />
              <span className="line-clamp-1 truncate">{publication_type}</span>
            </div>
          )}
          
          {formattedDate && (
            <div className="flex items-center min-w-0">
              <Calendar className="w-4 h-4 mr-1 flex-shrink-0 text-soi-navy-500" />
              <span className="truncate">{formattedDate}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center mt-auto text-soi-navy-600">
          <span className="inline-flex items-center text-sm font-medium">
            Read More
            <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

// Publication Highlight Component (for the first publication)
function PublicationHighlight({ publication }: { publication: Publication }) {
  const { title, featured_image_url, source_url, authors, publication_date, slug, content_html, publication_type } = publication;
  
  // Use already processed image URL with fallback
  const imageUrl = featured_image_url || DEFAULT_IMAGE;
  
  // Always link to individual publication page - let that page handle content vs external link
  // const hasContent = Boolean(content_html && content_html.trim().length > 0);
  
  // Format the title for display
  const displayTitle = title.replace(' | Sports Orthopedics', '').trim();
  
  return (
    <div className="mb-10 w-full">
      <div className="bg-white rounded-xl overflow-hidden shadow-lg flex flex-col md:flex-row w-full border border-soi-navy-200">
        <div className="md:w-2/5 relative h-64 md:h-auto flex-shrink-0">
          <div className="absolute inset-0 bg-gray-200">
            <ClientImage
              src={imageUrl}
              alt={displayTitle}
              fill
              className="object-cover"
              unoptimized={true}
            />
          </div>
        </div>
        <div className="md:w-3/5 p-6 md:p-8 flex flex-col justify-between min-w-0">
          <div className="min-w-0">
            <div className="flex items-center mb-3">
              <div className="flex items-center text-sm text-soi-navy-700 bg-soi-navy-100 px-3 py-1 rounded-full">
                <BookOpen className="w-4 h-4 mr-1.5 flex-shrink-0 text-soi-navy-600" />
                <span className="font-medium">Featured Publication</span>
              </div>
            </div>
            
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-soi-navy-800 mb-3 leading-tight break-words">
              {displayTitle}
            </h2>
            
            <div className="flex items-center mb-4 text-soi-navy-600 min-w-0">
              <User className="w-4 h-4 mr-1.5 flex-shrink-0 text-soi-navy-500" />
              <span className="truncate text-sm md:text-base">{authors}</span>
            </div>
          </div>
          
          <Link 
            href={`/publications/${slug}`}
            className="inline-flex items-center text-soi-navy-600 font-medium hover:underline mt-4 self-start hover:text-soi-navy-700"
          >
            <span className="break-words">Read full publication</span>
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 flex-shrink-0" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// Force no caching for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Main Publications Page Component
export default async function PublicationsPage() {
  // Fetch publications from Directus
  const { publications, total } = await getPublicationsAction({
    limit: 50, // Get more publications for the main page
    page: 1
  });
  
  // Split the first publication as a highlight if there are any
  const highlightPublication = publications.length > 0 ? publications[0] : null;
  const regularPublications = publications.length > 0 ? publications.slice(1) : [];

  return (
    <div className="min-h-screen bg-tint-authority overflow-x-hidden">
      {/* Use transparent header for image background */}
      <SiteHeader theme="transparent" /> 
      
      {/* Hero Section - Styled like homepage */}
      <HeroSection
        className="pt-24 pb-16" // Add top and bottom padding for balance
        variant="color" // Change to color to remove background image 
        height="medium"
        bgColor="#1e3a5f" // SOI Navy background
        title={
          <div className="max-w-5xl mx-auto px-4">
            {/* Badge */}
            <div className="inline-block bg-soi-navy-500/30 text-white px-4 py-1 rounded-lg text-sm font-medium mb-6 backdrop-blur-sm border border-soi-navy-400/50">
              ACADEMIC RESEARCH
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-4">
              <span className="block">Publications &</span>
              <span className="block mt-2">Research Articles</span>
            </h1>
            <p className="mt-6 text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed font-light">
              Explore scholarly articles and research published by our orthopedic specialists.
            </p>
          </div>
        }
        actions={
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-6 mb-0">
            {/* Secondary Action: Use ScrollToContentButton */}
            <ScrollToContentButton 
              targetId="publications-content"
              buttonText="Browse Publications"
            />
          </div>
        }
      />

      {/* Main Content Area */}
      <main id="publications-content" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        
        {/* Publications Count */}
        <div className="mb-10 w-full">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4 w-full">
            <h2 className="text-2xl md:text-3xl font-bold text-soi-navy-800 break-words">
              Research Publications
            </h2>
            
            <div className="text-sm text-soi-navy-500 flex-shrink-0">
              {total} publication{total !== 1 ? 's' : ''}
            </div>
          </div>
          
          {/* Highlight Publication (if exists) */}
          {highlightPublication && (
            <div className="w-full overflow-hidden">
              <PublicationHighlight publication={highlightPublication} />
            </div>
          )}
        
          {/* Publications Grid */}
          {regularPublications.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {regularPublications.map((publication) => (
                <PublicationCard key={publication.slug} publication={publication} />
              ))}
            </div>
          ) : (
            !highlightPublication && (
              <div className="bg-white rounded-lg p-8 text-center shadow-sm border border-soi-navy-200">
                <h3 className="text-xl font-medium text-soi-navy-800 mb-2">No publications found</h3>
                <p className="text-soi-navy-600">
                  Publications will appear here once added to the database.
                </p>
              </div>
            )
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
