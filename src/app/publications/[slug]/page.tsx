import Link from 'next/link';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { Metadata, ResolvingMetadata } from 'next';
import { ArrowLeft, Calendar, User, BookOpen, Bookmark, FileText, Share2, Download, ExternalLink, ArrowRight } from 'lucide-react';
import SocialShare from './components/SocialShare';
import PublicationCitation from './components/PublicationCitation';
import ClientImage from '@/app/components/ClientImage';
import { getPublicationBySlugAction, getRelatedPublicationsAction } from '@/app/actions/publications';
import type { Publication } from '@/types/publications';

// Constants
const DEFAULT_IMAGE = '/images/default-procedure.jpg';

// Types
interface BreadcrumbItem {
  name: string;
  url: string | null;
}

type Props = {
  params: { slug: string };
};

// Generate metadata for SEO
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  try {
    const publication = await getPublicationBySlugAction(params.slug);

    if (!publication) {
      return {
        title: 'Publication Not Found',
        description: 'The requested publication could not be found.',
      };
    }

    // Clean title for display
    const cleanTitle = publication.title.replace(' | Sports Orthopedics', '').trim();
    
    return {
      title: publication.meta_title || `${cleanTitle} | Sports Orthopedics`,
      description: publication.meta_description || `Read about ${cleanTitle} - scholarly article by our orthopedic specialists.`,
      openGraph: {
        title: cleanTitle,
        description: publication.meta_description || `Scholarly article: ${cleanTitle}`,
        images: publication.featured_image_url ? [publication.featured_image_url] : [DEFAULT_IMAGE],
        type: 'article',
        publishedTime: publication.publication_date || publication.date_created,
        authors: publication.authors ? [publication.authors] : undefined,
      },
      alternates: {
        canonical: publication.canonical_url || `/publications/${publication.slug}`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Publication Not Found',
      description: 'The requested publication could not be found.',
    };
  }
}

// External Link Button Component
const ExternalLinkButton = ({ url }: { url: string }) => (
  <Link 
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center px-4 py-2 bg-soi-navy-500 text-white rounded-md hover:bg-soi-navy-600 transition-colors border-2 border-soi-purple-400"
  >
    <ExternalLink className="w-4 h-4 mr-2" />
    View Original Publication
  </Link>
);

// Related Publication Card Component
const RelatedPublicationCard = ({ publication }: { publication: Publication }) => {
  const imageUrl = publication.featured_image_url || DEFAULT_IMAGE;
  const cleanTitle = publication.title.replace(' | Sports Orthopedics', '').trim();
  
  return (
    <Link href={`/publications/${publication.slug}`} className="group block">
      <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
        <div className="relative h-32 overflow-hidden">
          <div className="absolute inset-0 bg-gray-200">
            <ClientImage
              src={imageUrl}
              alt={cleanTitle}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              unoptimized={true}
            />
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-sm font-medium text-soi-navy-800 line-clamp-2 group-hover:text-soi-purple-600 transition-colors">
            {cleanTitle}
          </h3>
          {publication.authors && (
            <p className="text-xs text-soi-navy-600 mt-1 line-clamp-1">{publication.authors}</p>
          )}
        </div>
      </div>
    </Link>
  );
};

// Main Publication Detail Component
export default async function PublicationDetail({ params }: Props) {
  const publication = await getPublicationBySlugAction(params.slug);

  if (!publication) {
    return (
      <div className="min-h-screen bg-tint-authority">
        <SiteHeader />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-soi-navy-800 mb-4">Publication Not Found</h1>
          <p className="text-soi-navy-600 mb-6">The requested publication could not be found.</p>
          <Link href="/publications" className="text-soi-purple-600 hover:text-soi-navy-600 hover:underline">
            Back to Publications
          </Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  // Get related publications
  const relatedPublications = await getRelatedPublicationsAction(
    publication.id,
    publication.category,
    3
  );

  // Clean title for display
  const cleanTitle = publication.title.replace(' | Sports Orthopedics', '').trim();
  
  // Breadcrumbs
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Home', url: '/' },
    { name: 'Publications', url: '/publications' },
    { name: cleanTitle, url: null },
  ];

  // Format publication date
  const formattedDate = publication.publication_date 
    ? new Date(publication.publication_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : '';

  // Check if publication has content
  const hasContent = Boolean(publication.content_html && publication.content_html.trim().length > 0);
  const imageUrl = publication.featured_image_url || DEFAULT_IMAGE;

  return (
    <div className="min-h-screen bg-tint-authority">
      <SiteHeader />
      
      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            {breadcrumbs.map((item, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && <span className="mx-2 text-gray-400">/</span>}
                {item.url ? (
                  <Link href={item.url} className="text-soi-purple-600 hover:text-soi-navy-600 hover:underline">
                    {item.name}
                  </Link>
                ) : (
                  <span className="text-soi-navy-600 font-medium">{item.name}</span>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-12 overflow-hidden">
        <div className="max-w-4xl mx-auto w-full">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 mb-8">
            {/* Publication Category Badge */}
            {publication.publication_type && (
              <div className="flex items-center mb-4">
                <div className="flex items-center text-sm text-soi-navy-700 bg-soi-navy-100 px-3 py-1 rounded-full">
                  <BookOpen className="w-4 h-4 mr-1.5" />
                  <span className="font-medium">{publication.publication_type}</span>
                </div>
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-soi-navy-800 mb-6 break-words">
              {cleanTitle}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-soi-navy-600 mb-6">
              {publication.authors && (
                <div className="flex items-center min-w-0">
                  <User className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span className="break-words text-soi-navy-700">{publication.authors}</span>
                </div>
              )}
              
              {formattedDate && (
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span className="text-soi-navy-700">{formattedDate}</span>
                </div>
              )}

              {publication.category && (
                <div className="flex items-center">
                  <Bookmark className="w-5 h-5 mr-2" />
                  <span className="text-soi-navy-700">{publication.category}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-4">
              <SocialShare 
                title={cleanTitle}
                url={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://sportsorthopedics.com.sg'}/publications/${publication.slug}`}
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Featured Image */}
              {imageUrl !== DEFAULT_IMAGE && (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
                  <div className="relative h-64 md:h-80">
                    <ClientImage
                      src={imageUrl}
                      alt={cleanTitle}
                      fill
                      className="object-cover"
                      unoptimized={true}
                    />
                  </div>
                </div>
              )}

              {/* Content */}
              {hasContent ? (
                <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 overflow-hidden">
                  <div 
                    className="prose prose-lg max-w-none prose-headings:text-soi-navy-800 prose-p:text-soi-navy-600 prose-a:text-soi-purple-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-soi-navy-700 prose-ul:text-soi-navy-600 prose-ol:text-soi-navy-600 [&_a]:break-all [&_a]:hyphens-auto [&_*]:break-words [&_*]:overflow-wrap-anywhere"
                    style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                    dangerouslySetInnerHTML={{ __html: publication.content_html || '' }}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-soi-navy-800 mb-2">Full Content Available</h3>
                    <p className="text-soi-navy-600 mb-6">
                      The complete article is available through the original publication source.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Citation */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h3 className="text-lg font-semibold text-soi-navy-800 mb-4">Citation</h3>
                <PublicationCitation
                  title={cleanTitle}
                  authors={publication.authors || 'Unknown Author'}
                  journal={publication.publication_type || 'Publication'}
                  date={formattedDate}
                  url={publication.source_url || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sportsorthopedics.com.sg'}/publications/${publication.slug}`}
                />
              </div>

              {/* Related Publications */}
              {relatedPublications.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-soi-navy-800 mb-4">Related Publications</h3>
                  <div className="space-y-4">
                    {relatedPublications.map((relatedPub) => (
                      <RelatedPublicationCard key={relatedPub.id} publication={relatedPub} />
                    ))}
                  </div>
                  <div className="mt-6">
                    <Link 
                      href="/publications"
                      className="inline-flex items-center text-soi-purple-600 hover:text-soi-navy-600 hover:underline"
                    >
                      View all publications
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
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