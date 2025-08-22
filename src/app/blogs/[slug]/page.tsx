import Link from 'next/link';
import Image from 'next/image';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { ChevronLeft, Calendar, Clock, Share2, Facebook, Twitter, Linkedin, Mail, ArrowLeft } from 'lucide-react';
import type { BlogPost } from '@/lib/directus';
import { getPostBySlug, getRelatedPosts } from '@/lib/directus';
import { Button } from '@/components/ui/button';
import { Metadata } from 'next';
import SchemaMarkup from '@/components/SchemaMarkup';
import { createArticleSchema, createBreadcrumbSchema, sanitizeForSchema } from '@/lib/schema/utils';

// Define props for the dynamic page
type Props = {
  params: { slug: string };
};

// Helper function to format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Generate metadata for the page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested blog post could not be found.'
    };
  }

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.featured_image_url ? [post.featured_image_url] : [],
    },
  };
}

// Social share component (now a server component)
const SocialShare = ({ url, title }: { url: string; title: string }) => {
  const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || 'https://staged-doc.up.railway.app';
  const encodedUrl = encodeURIComponent(`${baseUrl}${url}`);
  const encodedTitle = encodeURIComponent(title);
  
  return (
    <div className="flex items-center space-x-2">
      <span className="text-gray-500 text-sm font-medium mr-2">Share:</span>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 text-gray-600 hover:text-[#1877F2] hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Share on Facebook"
      >
        <Facebook size={18} />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 text-gray-600 hover:text-[#1DA1F2] hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Share on Twitter"
      >
        <Twitter size={18} />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 text-gray-600 hover:text-[#0A66C2] hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Share on LinkedIn"
      >
        <Linkedin size={18} />
      </a>
      <a
        href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`}
        className="p-2 text-gray-600 hover:text-soi-purple-600 hover:bg-soi-purple-50 rounded-full transition-colors"
        aria-label="Share via Email"
      >
        <Mail size={18} />
      </a>
    </div>
  );
};

// Related post card component
const RelatedPostCard = ({ post }: { post: BlogPost }) => {
  return (
    <Link href={`/${post.slug}`} className="block">
              <div className="group flex items-start space-x-3 p-3 rounded-lg hover:bg-soi-purple-50 transition-colors">
        <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
          <Image
            src={post.featured_image_url}
            alt={post.title}
            fill
            sizes="64px"
            className="object-cover"
          />
        </div>
        <div className="flex-grow min-w-0">
          <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-soi-purple-600 transition-colors">
            {post.title}
          </h4>
          <div className="flex items-center mt-1 text-xs text-gray-500">
            <Calendar className="w-3 h-3 mr-1" />
            <span>{formatDate(post.date_created)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

// Main blog post page component - now server-side
export default async function PostPage({ params }: Props) {
  const { slug } = params;
  
  // Fetch post data directly from Directus on server-side
  const post = await getPostBySlug(slug);
  
  if (!post) {
    // Return not found page
    return (
      <div className="min-h-screen bg-tint-expertise">
        <SiteHeader />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-6">The blog post you're looking for could not be found.</p>
          <Link 
            href="/blogs" 
            className="inline-flex items-center text-soi-purple-600 hover:text-soi-navy-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to all posts
          </Link>
        </div>
        <SiteFooter />
      </div>
    );
  }
  
  // Fetch related posts - now we know post is not null
  const relatedPosts = await getRelatedPosts(slug, post.category);

  // Create schema markup for the blog post
  const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || 'https://sportsorthopedics.in';
  const schemas = [
    createArticleSchema({
      headline: post.title,
      description: post.excerpt || sanitizeForSchema(post.content_text),
      image: post.featured_image_url,
      datePublished: post.date_created,
      dateModified: post.date_created,
      articleBody: sanitizeForSchema(post.content_text),
      keywords: post.category ? [post.category] : undefined,
      url: `${baseUrl}/blogs/${post.slug}`,
      author: {
        name: 'Sports Orthopedics Institute',
        url: baseUrl
      }
    }),
    createBreadcrumbSchema([
      { name: 'Home', url: baseUrl },
      { name: 'Blog', url: `${baseUrl}/blogs` },
      { name: post.title }
    ])
  ];

  return (
    <div className="min-h-screen bg-tint-expertise">
      <SchemaMarkup schema={schemas} />
      <SiteHeader />
      
      {/* Hero Section */}
      <section className="relative h-[40vh] md:h-[50vh] flex items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gray-800">
          <Image
            src={post.featured_image_url}
            alt={post.title}
            fill
            sizes="100vw"
            priority
            className="object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="inline-block bg-soi-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
            {post.category}
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white max-w-4xl mx-auto leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center justify-center text-white/90 mt-4 text-sm">
            <div className="flex items-center mr-4">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{formatDate(post.date_created)}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>{post.reading_time} min read</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="lg:flex lg:gap-12 lg:items-start">
            {/* Main Content */}
            <article className="lg:w-2/3">
              {/* Navigation */}
              <div className="mb-8">
                <Link 
                  href="/blogs" 
                  className="inline-flex items-center text-soi-purple-600 hover:text-soi-navy-600 transition-colors text-sm font-medium"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to all posts
                </Link>
              </div>

              {/* Article Content */}
              <div className="prose prose-lg max-w-none prose-headings:text-soi-navy-800 prose-headings:font-bold prose-a:text-soi-purple-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-soi-navy-700 prose-blockquote:border-l-soi-purple-600 prose-blockquote:text-soi-navy-600">
                {post.content_html ? (
                  <div dangerouslySetInnerHTML={{ __html: post.content_html }} />
                ) : (
                  <div className="whitespace-pre-wrap">{post.content_text}</div>
                )}
              </div>

              {/* Social Share */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <SocialShare url={`/${post.slug}`} title={post.title} />
              </div>
            </article>

            {/* Sticky Sidebar */}
            <aside className="lg:w-1/3 mt-12 lg:mt-0">
              <div className="lg:sticky lg:top-8 space-y-8">
                {/* Call to Action */}
                <div className="bg-gradient-to-r from-soi-purple-600 to-soi-navy-600 text-white p-6 rounded-xl">
                  <h3 className="text-lg font-bold mb-3 text-white">Need Expert Care?</h3>
                  <p className="text-sm mb-4 text-white/90">
                    Get personalized treatment from our orthopedic specialists.
                  </p>
                  <Button className="w-full bg-white text-soi-purple-600 hover:bg-soi-purple-50 border-2 border-soi-pink-400">
                    Book an Appointment
                  </Button>
                </div>

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                  <div className="bg-white p-6 rounded-xl border border-soi-purple-200">
                    <h3 className="text-lg font-bold text-soi-navy-800 mb-4">Related Articles</h3>
                    <div className="space-y-1">
                      {relatedPosts.map(relatedPost => (
                        <RelatedPostCard key={relatedPost.id} post={relatedPost} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
} 