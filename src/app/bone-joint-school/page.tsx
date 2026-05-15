import Link from 'next/link';
import Image from 'next/image';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { BoneJointSchoolCard } from './components/BoneJointSchoolCard';
import { ChevronLeft, ChevronRight, BookOpen, ArrowRight } from 'lucide-react';
import HeroSection from '@/components/ui/HeroSection';
import { Button } from '@/components/ui/button';
import { getBoneJointContent, getBoneJointCategories, getImageUrl } from '@/lib/directus';
import BookingModalWrapper from './components/BookingModalWrapper';

// Convert EducationalContent to BoneJointTopic format
function convertToBoneJointTopic(content: any) {
  return {
    slug: content.slug,
    title: content.title,
    imageUrl: getImageUrl(content.featured_image_url),
    summary: content.content_text ? 
      (content.content_text.length > 150 ? 
        content.content_text.substring(0, 150) + '...' : 
        content.content_text) : 
      'No summary available.',
    category: content.category || 'General'
  };
}

// Helper to strip HTML tags for a plain text summary
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>?/gm, '');
}

// Get summary from content_html or content_text
function getSummary(content: any): string {
  if (content.content_text) {
    const plainText = stripHtml(content.content_text);
    return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
  }
  if (content.content_html) {
    const plainText = stripHtml(content.content_html);
    return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
  }
  return 'No summary available.';
}

// Improved Pagination Component
const PaginationControls = ({ 
  currentPage, 
  totalPages, 
  baseUrl,
  queryParams = {} 
}: { 
  currentPage: number, 
  totalPages: number, 
  baseUrl: string,
  queryParams?: Record<string, string>
}) => {
  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;
  
  const buildQueryString = (page: number) => {
    const params = new URLSearchParams();
    
    for (const [key, value] of Object.entries(queryParams)) {
      if (key !== 'page' && value) {
        params.append(key, value);
      }
    }
    
    params.append('page', page.toString());
    
    return params.toString();
  };

  return (
    <div className="flex justify-center items-center space-x-2 mt-12">
      {prevPage ? (
        <Link 
          href={`${baseUrl}?${buildQueryString(prevPage)}`} 
          className="flex items-center px-4 py-2 rounded-md bg-soi-purple-100 text-soi-purple-600 hover:bg-soi-purple-200 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          <span>Previous</span>
        </Link>
      ) : (
        <span className="flex items-center px-4 py-2 rounded-md bg-soi-navy-100 text-soi-navy-400 cursor-not-allowed">
          <ChevronLeft className="w-4 h-4 mr-1" />
          <span>Previous</span>
        </span>
      )}
      
      <div className="hidden sm:flex space-x-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <Link
            key={page}
            href={`${baseUrl}?${buildQueryString(page)}`}
            className={`
              w-8 h-8 flex items-center justify-center rounded-md text-sm
              ${currentPage === page 
                ? 'bg-soi-purple-500 text-white font-medium' 
                : 'bg-white text-soi-navy-700 hover:bg-soi-purple-50 hover:text-soi-purple-600 border border-soi-purple-200'
              }
            `}
          >
            {page}
          </Link>
        ))}
      </div>
      
      <span className="text-soi-navy-600 text-sm sm:hidden">
        Page {currentPage} of {totalPages}
      </span>

      {nextPage ? (
        <Link 
          href={`${baseUrl}?${buildQueryString(nextPage)}`} 
          className="flex items-center px-4 py-2 rounded-md bg-soi-purple-100 text-soi-purple-600 hover:bg-soi-purple-200 transition-colors"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      ) : (
        <span className="flex items-center px-4 py-2 rounded-md bg-soi-navy-100 text-soi-navy-400 cursor-not-allowed">
          <span>Next</span>
          <ChevronRight className="w-4 h-4 ml-1" />
        </span>
      )}
    </div>
  );
};

// Category filter component
const CategoryFilter = ({ 
  categories, 
  activeCategory,
  baseUrl 
}: { 
  categories: string[],
  activeCategory: string | null,
  baseUrl: string
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {categories.map(category => (
        <Link
          key={category}
          href={`${baseUrl}?category=${category === 'All' ? '' : category}`}
          className={`
            px-4 py-2 rounded-full text-sm font-medium transition-colors
            ${category === activeCategory || (category === 'All' && !activeCategory)
              ? 'bg-soi-purple-500 text-white'
              : 'bg-white text-soi-navy-700 hover:bg-soi-purple-50 hover:text-soi-purple-600 border border-soi-purple-200'
            }
          `}
        >
          {category}
        </Link>
      ))}
    </div>
  );
};

export default async function BoneJointSchoolPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // Fetch data from Directus
  const [content, categories] = await Promise.all([
    getBoneJointContent(),
    getBoneJointCategories()
  ]);

  // Convert to BoneJointTopic format
  const topics = content.map(item => ({
    slug: item.slug,
    title: item.title,
    imageUrl: getImageUrl(item.featured_image_url),
    summary: getSummary(item),
    category: item.category || 'General'
  }));

  const categoryParam = typeof searchParams?.category === 'string' ? searchParams.category : null;
  const filteredTopics = categoryParam 
    ? topics.filter(topic => topic.category === categoryParam)
    : topics;
  
  const page = typeof searchParams?.page === 'string' ? parseInt(searchParams.page, 10) : 1;
  const pageSize = 12;
  const totalPages = Math.ceil(filteredTopics.length / pageSize);
  const currentPage = Math.max(1, Math.min(page, totalPages || 1));
  
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTopics = filteredTopics.slice(startIndex, endIndex);
  
  const queryParams: Record<string, string> = {};
  if (categoryParam) {
    queryParams.category = categoryParam;
  }
  
  return (
    <div className="min-h-screen bg-tint-expertise"> 
      <SiteHeader theme="transparent" />
      
      <HeroSection
        variant="image"
        height="large"
        bgColor="#1a1a1a"
        bgImage="https://images.unsplash.com/photo-1588776814546-daab30f310ce?q=80&w=2070&auto=format&fit=crop"
        title={
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-block bg-soi-purple-500/20 text-white px-4 py-1 rounded-lg text-sm font-medium mb-6 backdrop-blur-sm border border-soi-purple-500/30">
              BONE & JOINT SCHOOL
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-4">
              <span className="block">Your Orthopedic</span>
              <span className="block mt-2">Knowledge Center</span>
            </h1>
            <p className="mt-6 text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed font-light">
              Explore comprehensive information on various orthopedic conditions, treatments, and recovery strategies.
            </p>
          </div>
        }
        actions={
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-8">
            <BookingModalWrapper>
              <Button
                size="lg"
                className="bg-soi-navy-500 hover:bg-soi-navy-600 text-white rounded-md px-8 sm:px-10 py-6 sm:py-6 text-lg font-medium transition-all duration-300 hover:shadow-lg w-full sm:w-auto"
                aria-label="Book an appointment with our specialists"
              >
                <span className="flex items-center justify-center">
                  Book Consultation
                  <ArrowRight className="ml-2 w-5 h-5" />
                </span>
              </Button>
            </BookingModalWrapper>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white bg-transparent hover:bg-white/10 rounded-md px-8 sm:px-10 py-6 sm:py-6 text-lg font-medium transition-all duration-300 w-full sm:w-auto"
              aria-label="Browse educational topics"
            >
              <Link href="#topics" className="flex items-center">
                Browse Topics 
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        }
      >
      </HeroSection>

      <main id="topics" className="container mx-auto px-4 py-12 md:py-16">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-soi-navy-800 mb-4">Orthopedic Education Library</h2>
          <p className="text-soi-navy-600 max-w-3xl">
            Learn about orthopedic conditions, treatments, recovery, and prevention strategies through our comprehensive educational resources.
          </p>
        </div>
        
        <CategoryFilter 
          categories={categories}
          activeCategory={categoryParam}
          baseUrl="/bone-joint-school"
        />
        
        <p className="text-sm text-soi-navy-500 mb-6">
          Showing {paginatedTopics.length} of {filteredTopics.length} topics
          {categoryParam ? ` in "${categoryParam}"` : ''}
        </p>
        
        {paginatedTopics.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {paginatedTopics.map((topic) => (
              <BoneJointSchoolCard
                key={topic.slug}
                slug={topic.slug}
                title={topic.title}
                summary={topic.summary}
                imageUrl={topic.imageUrl}
                category={topic.category}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-8 text-center shadow-sm border border-soi-mint-200">
            <h3 className="text-xl font-medium text-soi-navy-800 mb-2">No topics found</h3>
            <p className="text-soi-navy-600">
              {categoryParam 
                ? `No topics found in the "${categoryParam}" category.`
                : 'No topics found in the database.'}
            </p>
            {categoryParam && (
              <Link href="/bone-joint-school" className="mt-4 inline-block text-soi-purple-600 hover:text-soi-purple-700 hover:underline">
                View all topics
              </Link>
            )}
          </div>
        )}

        {filteredTopics.length > pageSize && (
          <PaginationControls 
            currentPage={currentPage} 
            totalPages={totalPages} 
            baseUrl="/bone-joint-school"
            queryParams={queryParams}
          />
        )}
      </main>

      <SiteFooter />
    </div>
  );
} 