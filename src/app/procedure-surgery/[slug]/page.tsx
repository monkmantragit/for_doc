'use server';

// import { notFound } from 'next/navigation'; // Removed due to import issue
import Image from 'next/image';
import Link from 'next/link';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { getProcedureSurgeryBySlug, getRelatedProcedures, getImageUrl } from '@/lib/directus';
import BookingSection from '../components/BookingSection';
import { Calendar, CheckCircle } from 'lucide-react';
import ContentRenderer from '@/components/shared/ContentRenderer';
// Metadata is now handled in the separate metadata.ts file

interface ProcedurePageProps {
  params: { slug: string };
}

export default async function ProcedurePage({ params }: ProcedurePageProps) {
  const procedure = await getProcedureSurgeryBySlug(params.slug);
  
  if (!procedure) {
    return (
      <div className="min-h-screen bg-tint-authority">
        <SiteHeader theme="light" />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-soi-navy-800 mb-4">Procedure Not Found</h1>
            <p className="text-soi-navy-600 mb-8">The requested procedure could not be found.</p>
            <Link 
              href="/procedure-surgery" 
              className="inline-block bg-soi-navy-500 text-white px-6 py-3 rounded-lg hover:bg-soi-navy-600 transition-colors border-2 border-soi-purple-400"
            >
              Back to Procedures
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  // Get related procedures
  const relatedProcedures = await getRelatedProcedures(
    procedure.id, 
    procedure.category, 
    3
  );

  return (
    <div className="min-h-screen bg-tint-authority">
      <SiteHeader theme="light" />
      
      <main>
        {/* Hero Section */}
        <div className="w-full bg-gradient-to-r from-soi-navy-500/10 to-soi-purple-100 pt-16">
          <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 order-2 md:order-1">
                <div className="mb-2">
                  <Link href="/procedure-surgery" className="text-sm text-soi-purple-600 hover:text-soi-navy-600 hover:underline">
                    ← Back to Procedures
                  </Link>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-soi-navy-800 mb-6">
                  {procedure.title}
                </h1>
                
                {procedure.content_text && (
                  <p className="text-lg text-soi-navy-600 mb-8">
                    {procedure.content_text.length > 200 
                      ? procedure.content_text.substring(0, 200) + '...'
                      : procedure.content_text
                    }
                  </p>
                )}
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {procedure.category && (
                    <span className="px-3 py-1 bg-soi-purple-100 text-soi-purple-700 rounded-full text-sm font-medium">
                      {procedure.category}
                    </span>
                  )}
                  {procedure.procedure_type && (
                    <span className="px-3 py-1 bg-soi-navy-100 text-soi-navy-700 rounded-full text-sm font-medium">
                      {procedure.procedure_type}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="w-full md:w-2/5 order-1 md:order-2">
                {procedure.featured_image_url ? (
                  <div className="relative h-60 md:h-80 w-full rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src={getImageUrl(procedure.featured_image_url) || '/images/default-procedure.jpg'}
                      alt={procedure.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 40vw"
                      priority
                    />
                  </div>
                ) : (
                  <div className="h-60 md:h-80 w-full bg-gray-200 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 pt-12 pb-16">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="w-full lg:w-2/3">
              {/* Main Content */}
              {procedure.content_html && (
                <ContentRenderer html={procedure.content_html} />
              )}
            </div>
            
            {/* Sidebar */}
            <div className="w-full lg:w-1/3">
              <BookingSection />
              
              {/* Related Procedures */}
              {relatedProcedures.length > 0 && (
                <div className="mt-8 bg-white p-6 rounded-lg border border-soi-purple-200">
                  <h3 className="text-lg font-semibold text-soi-navy-800 mb-4">Related Procedures</h3>
                  <div className="space-y-4">
                    {relatedProcedures.map((related) => (
                      <Link
                        key={related.slug}
                        href={`/procedure-surgery/${related.slug}`}
                        className="block p-4 bg-soi-purple-50 rounded-lg hover:bg-soi-purple-100 hover:shadow-md transition-all border border-soi-purple-200"
                      >
                        <h4 className="font-medium text-soi-navy-800 mb-2">{related.title}</h4>
                        {related.content_text && (
                          <p className="text-sm text-soi-navy-600 line-clamp-2">
                            {related.content_text.length > 100 
                              ? related.content_text.substring(0, 100) + '...'
                              : related.content_text
                            }
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-soi-purple-600">
                          {related.recovery_time && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {related.recovery_time}
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <SiteFooter />
    </div>
  );
} 