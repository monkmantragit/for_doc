import { notFound } from 'next/navigation';
import { getLandingPageBySlug, getPostBySlug } from '@/lib/directus';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { getImageUrl } from '@/lib/directus';
import Image from 'next/image';

// Revalidate every 60 seconds for fresh content
export const revalidate = 60;

interface LandingPageProps {
  params: {
    slug: string;
  };
}

export default async function LandingPage({ params }: LandingPageProps) {
  // First try to fetch as a landing page
  const landingPage = await getLandingPageBySlug(params.slug);
  
  // If no landing page found, try to fetch as a blog post
  if (!landingPage) {
    const blogPost = await getPostBySlug(params.slug);
    
    // If blog post found, render it
    if (blogPost) {
      return (
        <div className="min-h-screen bg-tint-expertise">
          <SiteHeader />
          
          {/* Blog Post Hero */}
          <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-soi-navy-800 to-soi-purple-800">
            {blogPost.featured_image_url && (
              <div className="absolute inset-0 z-0">
                <Image
                  src={blogPost.featured_image_url}
                  alt={blogPost.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/50" />
              </div>
            )}
            
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
                  {blogPost.title}
                </h1>
                <div className="flex items-center justify-center gap-4 text-white/80">
                  <time dateTime={blogPost.date_created}>
                    {new Date(blogPost.date_created).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                  {blogPost.reading_time && (
                    <>
                      <span>•</span>
                      <span>{blogPost.reading_time} min read</span>
                    </>
                  )}
                  {blogPost.category && (
                    <>
                      <span>•</span>
                      <span>{blogPost.category}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Blog Content */}
          <section className="py-16 lg:py-24 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <article className="prose prose-lg max-w-none prose-headings:text-soi-navy-800 prose-links:text-soi-purple-600 prose-strong:text-soi-navy-700">
                {blogPost.content_html ? (
                  <div dangerouslySetInnerHTML={{ __html: blogPost.content_html }} />
                ) : (
                  <p>{blogPost.content_text}</p>
                )}
              </article>
            </div>
          </section>

          <SiteFooter />
        </div>
      );
    }
    
    // If neither landing page nor blog post found, show 404
    notFound();
  }

  return (
    <div className="min-h-screen bg-tint-authority">
      <SiteHeader />
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-soi-navy-800 to-soi-purple-800">
        {landingPage.featured_image_url && (
          <div className="absolute inset-0 z-0">
            <Image
              src={getImageUrl(landingPage.featured_image_url)}
              alt={landingPage.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
          </div>
        )}
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              {landingPage.title}
            </h1>
            {landingPage.content_text && (
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                {landingPage.content_text.substring(0, 200)}...
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {landingPage.content_html ? (
            <div 
              className="prose prose-lg max-w-none prose-headings:text-soi-navy-800 prose-links:text-soi-purple-600 prose-strong:text-soi-navy-700"
              dangerouslySetInnerHTML={{ __html: landingPage.content_html }}
            />
          ) : (
            <div className="prose prose-lg max-w-none prose-headings:text-soi-navy-800 prose-links:text-soi-purple-600 prose-strong:text-soi-navy-700">
              <p>{landingPage.content_text}</p>
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

// Generate metadata for the page
export async function generateMetadata({ params }: LandingPageProps) {
  // First try landing page
  const landingPage = await getLandingPageBySlug(params.slug);

  if (landingPage) {
    return {
      title: landingPage.meta_title || landingPage.title,
      description: landingPage.meta_description || landingPage.content_text?.substring(0, 160),
      openGraph: {
        title: landingPage.meta_title || landingPage.title,
        description: landingPage.meta_description || landingPage.content_text?.substring(0, 160),
        images: landingPage.featured_image_url ? [getImageUrl(landingPage.featured_image_url)] : [],
      },
    };
  }

  // Try blog post
  const blogPost = await getPostBySlug(params.slug);
  
  if (blogPost) {
    return {
      title: blogPost.meta_title || blogPost.title,
      description: blogPost.meta_description || blogPost.excerpt || blogPost.content_text?.substring(0, 160),
      openGraph: {
        title: blogPost.meta_title || blogPost.title,
        description: blogPost.meta_description || blogPost.excerpt || blogPost.content_text?.substring(0, 160),
        images: blogPost.featured_image_url ? [blogPost.featured_image_url] : [],
      },
    };
  }

  return {
    title: 'Page Not Found',
  };
} 