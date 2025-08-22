// import { notFound } from 'next/navigation'; // Removed due to import issue
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { Metadata, ResolvingMetadata } from 'next';
import TopicImage from './components/TopicImage';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, ArrowRight, Clock, Tag, Calendar, Share2, FileText, BookOpen, User } from 'lucide-react';
import TopicContentRenderer from './components/TopicContentRenderer';
import BookingButton from './components/BookingButton';
import ShareButton from './components/ShareButton';
import HeroSection from '@/components/ui/HeroSection';
import { getBoneJointContentBySlug, getRelatedBoneJointContent, getImageUrl } from '@/lib/directus';
import SchemaMarkup from '@/components/SchemaMarkup';
import { createEducationalProgramSchema, createArticleSchema, createBreadcrumbSchema, sanitizeForSchema } from '@/lib/schema/utils';

// --- Constants ---
const DEFAULT_FALLBACK_IMAGE = '/images_bone_joint/doctor-holding-tablet-e-health-concept-business-concept.webp';

// --- Type Definitions --- 
// Structure for individual content blocks from ContentBlocksJSON
export interface ContentBlock {
  type: 'heading' | 'paragraph' | 'styled_list_item';
  level?: number; // For headings (e.g., 2 for h2, 3 for h3)
  text: string;   // HTML content
  icon?: string;  // For styled_list_item (e.g., 'arrow-right')
}

// Structure for breadcrumb items
interface BreadcrumbItem {
  name: string;
  url: string | null; // URL might be null for the current page
}

// Structure for the entire topic data
interface TopicData {
  slug: string;
  title: string;
  featuredImageUrl: string;
  breadcrumbData: BreadcrumbItem[];
  contentBlocks: ContentBlock[];
  content_html: string;
  content_text: string;
  category?: string;
  publishDate?: string;
  readingTime?: string;
  relatedSlugs?: string[];
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  keywords?: string;
  summary?: string;
}

// Define Props type
type Props = {
  params: { slug: string }
}

// --- Data Fetching ---

// Helper to safely parse JSON from CSV, returning empty array/object on error
function safeJsonParse<T>(jsonString: string | undefined | null, fallback: T): T {
  if (!jsonString) return fallback;
  try {
    return JSON.parse(jsonString) as T;
  } catch (e) {
    console.warn("Failed to parse JSON string:", jsonString, e);
    return fallback;
  }
}

// Function to get specific topic data from Directus
async function getTopicDataFromDirectus(slug: string): Promise<TopicData | null> {
  try {
    const content = await getBoneJointContentBySlug(slug);
    
    if (!content) {
      return null; // Topic not found
    }

    // Clean up title
    const title = content.title;
    const featuredImageUrl = getImageUrl(content.featured_image_url) || DEFAULT_FALLBACK_IMAGE;

    // Create breadcrumb data
    const breadcrumbData: BreadcrumbItem[] = [
      { name: 'Home', url: '/' },
      { name: 'Bone & Joint School', url: '/bone-joint-school' },
      { name: title, url: null }
    ];

    // Parse content blocks from HTML content if needed
    // For now, we'll create a simple content block structure
    const contentBlocks: ContentBlock[] = [];
    
    // Calculate reading time based on content length
    const readingTime = calculateReadingTime(content.content_text || '');
    
    // Format date
    const publishDate = content.date_created ? new Date(content.date_created).toISOString().split('T')[0] : undefined;

    return {
      slug: content.slug,
      title,
      featuredImageUrl,
      breadcrumbData,
      contentBlocks,
      content_html: content.content_html,
      content_text: content.content_text,
      category: content.category,
      publishDate,
      readingTime,
      relatedSlugs: [],
      metaTitle: content.meta_title,
      metaDescription: content.meta_description,
      ogImage: featuredImageUrl,
      canonicalUrl: content.canonical_url,
      keywords: '',
      summary: '',
    };

  } catch (error) {
    console.error(`Error fetching topic data for slug ${slug}:`, error);
    return null;
  }
}

// Helper to calculate reading time
function calculateReadingTime(content: string): string {
  if (!content) return '2 min read';
  
  // Assume average reading speed of 200 words per minute
  const textContent = stripHtml(content);
  const wordCount = textContent.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / 200);
  return `${minutes} min read`;
}

// Function to get related topics from Directus
async function getRelatedTopics(currentSlug: string, category?: string): Promise<TopicData[]> {
  try {
    const relatedContent = await getRelatedBoneJointContent(currentSlug, category);
    
    return relatedContent.map(content => {
      const text = (content.content_text || content.content_html || '').replace(/<[^>]*>?/gm, '');
      const summary = content.meta_description 
        ? (content.meta_description.length > 120 ? content.meta_description.substring(0, 120) + '...' : content.meta_description)
        : (text.length > 100 ? text.substring(0, 100) + '...' : text);

      return {
        slug: content.slug,
        title: content.title,
        featuredImageUrl: getImageUrl(content.featured_image_url) || DEFAULT_FALLBACK_IMAGE,
        breadcrumbData: [],
        contentBlocks: [],
        content_html: '',
        content_text: '',
        category: content.category,
        publishDate: content.date_created ? new Date(content.date_created).toISOString().split('T')[0] : undefined,
        readingTime: '2 min read',
        summary: summary,
      };
    });
  } catch (error) {
    console.error(`Error fetching related topics for ${currentSlug}:`, error);
    return [];
  }
}

// --- Component Functions ---

// Static params generation - we'll remove this for now as it requires knowing all slugs
// export async function generateStaticParams() {
//   // Could be implemented to fetch all slugs from Directus for static generation
//   return [];
// }

// Metadata generation
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  try {
    const topicData = await getTopicDataFromDirectus(params.slug);
    
    if (!topicData) {
      return {
        title: 'Topic Not Found',
        description: 'The requested topic could not be found.',
      };
    }

    const previousImages = (await parent).openGraph?.images || [];
    const ogImage = topicData.ogImage || topicData.featuredImageUrl;

    return {
      title: topicData.metaTitle || `${topicData.title} | Sports Orthopedics`,
      description: topicData.metaDescription || `Learn about ${topicData.title.toLowerCase()} from expert orthopedic specialists.`,
      keywords: topicData.keywords || `${topicData.title}, orthopedics, sports medicine, ${topicData.category}`,
      ...(topicData.canonicalUrl && {
        alternates: {
          canonical: topicData.canonicalUrl
        }
      }),
      openGraph: {
        title: topicData.metaTitle || topicData.title,
        description: topicData.metaDescription || `Learn about ${topicData.title.toLowerCase()} from expert orthopedic specialists.`,
        images: ogImage ? [ogImage, ...previousImages] : previousImages,
        type: 'article',
        publishedTime: topicData.publishDate,
      },
      twitter: {
        card: 'summary_large_image',
        title: topicData.metaTitle || topicData.title,
        description: topicData.metaDescription || `Learn about ${topicData.title.toLowerCase()} from expert orthopedic specialists.`,
        images: ogImage ? [ogImage] : undefined,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Bone & Joint School | Sports Orthopedics',
      description: 'Educational resources about orthopedic conditions and treatments.',
    };
  }
}

// Helper to strip HTML tags
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>?/gm, '');
}

// Enhanced Breadcrumbs Component
const Breadcrumbs = ({ items, className = '' }: { items: BreadcrumbItem[], className?: string }) => {
  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-white/40 mx-2" />
          )}
          {item.url ? (
            <Link href={item.url} className="text-white/80 hover:text-white transition-colors font-medium">
              {item.name}
            </Link>
          ) : (
            <span className="text-white font-semibold">{item.name}</span>
          )}
        </div>
      ))}
    </nav>
  );
};

// Table of Contents Generator and HTML Processor
const processContentForTOC = (contentHtml: string) => {
  const headings: { level: number; text: string; id: string }[] = [];
  
  if (!contentHtml) {
    return {
      processedHtml: '',
      tableOfContents: headings
    };
  }

  const processedHtml = contentHtml.replace(
    /<h([2-6])(.*?)>(.*?)<\/h[2-6]>/gi,
    (match, levelStr, attrs, innerHTML) => {
      const level = parseInt(levelStr);
      const text = stripHtml(innerHTML);
      
      if (!text) return match; // Skip empty headings
      
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      // Avoid duplicate IDs by appending a number if needed
      let uniqueId = id;
      let counter = 1;
      while (headings.some(h => h.id === uniqueId)) {
        uniqueId = `${id}-${counter}`;
        counter++;
      }

      headings.push({ level, text, id: uniqueId });
      
      // Check if the tag already has an ID
      if (/id\s*=\s*["']/.test(attrs)) {
        // If it has an ID, don't change it, but use it for the TOC
        const existingId = attrs.match(/id\s*=\s*["'](.*?)["']/)[1];
        headings[headings.length - 1].id = existingId;
        return match;
      }

      return `<h${level} id="${uniqueId}"${attrs}>${innerHTML}</h${level}>`;
    }
  );

  return { processedHtml, tableOfContents: headings };
};

// Enhanced Related Topic Card Component
const RelatedTopicCard = ({ title, slug, imageUrl, summary }: { title: string, slug: string, imageUrl: string, summary?: string }) => (
  <Link href={`/bone-joint-school/${slug}`} className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border border-soi-purple-200/80 hover:border-soi-purple-500/30">
    <div className="relative h-48 w-full">
      {/* Image */}
      <Image 
        src={imageUrl} 
        alt={title}
        fill={true}
        className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      
      {/* Icon that appears on hover */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <BookOpen className="h-10 w-10 text-white/90" />
      </div>

      {/* Category Tag */}
      <div className="absolute bottom-4 left-4">
        <div className="bg-black/50 backdrop-blur-sm rounded-md px-3 py-1 border border-white/20">
          <span className="text-white text-xs font-medium tracking-wide">Educational Topic</span>
        </div>
      </div>
    </div>

    {/* Content */}
    <div className="flex flex-1 flex-col p-6 transition-colors duration-300 group-hover:bg-gray-50/50">
      <h4 className="font-bold text-lg text-soi-navy-800 group-hover:text-soi-purple-600 transition-colors duration-300 line-clamp-2 mb-2 leading-tight">
        {title}
      </h4>
      {summary && (
        <p className="text-gray-600 text-sm mt-1 line-clamp-2">
          {summary}
        </p>
      )}
      <div className="flex items-center text-sm font-semibold text-soi-purple-600 mt-auto pt-4">
        <span className="group-hover:underline decoration-2 underline-offset-4">View Topic</span>
        <ArrowRight className="w-4 h-4 ml-1.5 transition-transform duration-300 group-hover:translate-x-1" />
      </div>
    </div>
  </Link>
);

// Main Component
export default async function BoneJointTopicPage({ params }: Props) {
  const topicData = await getTopicDataFromDirectus(params.slug);

  if (!topicData) {
    return (
      <div className="min-h-screen bg-tint-expertise flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-soi-navy-800 mb-4">Topic Not Found</h1>
          <p className="text-soi-navy-600 mb-4">The requested topic could not be found.</p>
          <Link href="/bone-joint-school" className="text-soi-purple-600 hover:text-soi-navy-600 hover:underline">
            ← Back to Bone & Joint School
          </Link>
        </div>
      </div>
    );
  }

  const relatedTopics = await getRelatedTopics(params.slug, topicData.category);
  const { processedHtml, tableOfContents } = processContentForTOC(topicData.content_html);

  // Create schema markup for the educational content
  const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || 'https://sportsorthopedics.in';
  const schemas = [
    createEducationalProgramSchema({
      name: topicData.title,
      description: sanitizeForSchema(topicData.content_text),
      url: `${baseUrl}/bone-joint-school/${params.slug}`,
      programType: 'Educational Content'
    }),
    createArticleSchema({
      headline: topicData.title,
      description: topicData.metaDescription || sanitizeForSchema(topicData.content_text),
      image: topicData.featuredImageUrl,
      datePublished: topicData.publishDate || new Date().toISOString(),
      articleBody: sanitizeForSchema(topicData.content_text),
      keywords: topicData.keywords?.split(',').map(k => k.trim()),
      url: `${baseUrl}/bone-joint-school/${params.slug}`
    }),
    createBreadcrumbSchema(
      topicData.breadcrumbData.map(item => ({
        name: item.name,
        url: item.url ? (item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`) : undefined
      }))
    )
  ];

  return (
    <div className="min-h-screen bg-tint-expertise">
      <SchemaMarkup schema={schemas} />
      <SiteHeader />
      
      {/* Enhanced Hero Section */}
      <div className="relative h-[70vh] min-h-[500px] bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
        <TopicImage 
          src={topicData.featuredImageUrl}
          alt={topicData.title}
          fallbackSrc={DEFAULT_FALLBACK_IMAGE}
          fill={true}
          className="object-cover opacity-50"
          priority={true}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        
        <div className="absolute inset-0 flex items-end sm:items-center justify-start pb-8 sm:pb-0">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl">
              <Breadcrumbs items={topicData.breadcrumbData} className="mb-6" />
              
              <div className="inline-block bg-soi-purple-500/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-soi-purple-500/30">
                EDUCATIONAL TOPIC
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                {topicData.title}
              </h1>
              
              {/* Compact Meta Information */}
              <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm mb-8">
                {topicData.category && (
                  <span className="flex items-center">
                    <Tag className="w-4 h-4 mr-1" />
                    {topicData.category}
                  </span>
                )}
                {topicData.readingTime && (
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {topicData.readingTime}
                  </span>
                )}
                {topicData.publishDate && (
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(topicData.publishDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="container mx-auto px-4 -mt-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="font-medium text-gray-900">{topicData.title}</span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {topicData.readingTime}
                </span>
              </div>
              {/* Mobile: Stack buttons vertically, Desktop: Side by side */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <ShareButton 
                  url={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://sportsorthopedics.in'}/bone-joint-school/${params.slug}`}
                  title={topicData.title}
                />
                <BookingButton 
                  size="sm" 
                  variant="rounded"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            
            {/* Table of Contents - Desktop Sidebar */}
            {tableOfContents.length > 0 && (
              <div className="lg:col-span-1 order-2 lg:order-1">
                <div className="sticky top-24">
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <h3 className="font-bold text-soi-navy-800 mb-6 flex items-center text-lg">
                      <div className="w-8 h-8 bg-soi-purple-100 rounded-lg flex items-center justify-center mr-3">
                        <FileText className="w-4 h-4 text-soi-purple-600" />
                      </div>
                      Contents
                    </h3>
                    <nav className="space-y-3">
                      {tableOfContents.map((heading, index) => (
                        <a
                          key={index}
                          href={`#${heading.id}`}
                          className={`block text-sm hover:text-soi-purple-600 transition-colors py-2 px-3 rounded-lg hover:bg-soi-purple-50 ${
                            heading.level === 2 ? 'font-semibold text-soi-navy-800 border-l-2 border-soi-purple-600' : 'text-soi-navy-600 pl-6 border-l-2 border-soi-purple-200'
                          }`}
                        >
                          {heading.text}
                        </a>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className={`${tableOfContents.length > 0 ? 'lg:col-span-3' : 'lg:col-span-4'} order-1 lg:order-2`}>
              
              {/* Content Card */}
              <article className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-gray-100 mb-8">
                {/* Content Renderer */}
                <div 
                  className="prose prose-lg max-w-none prose-headings:text-soi-navy-800 prose-headings:font-bold prose-headings:leading-tight prose-headings:scroll-mt-32 prose-p:text-soi-navy-600 prose-p:leading-relaxed prose-p:mb-6 prose-a:text-soi-purple-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-soi-navy-700 prose-strong:font-semibold prose-ul:text-soi-navy-600 prose-ol:text-soi-navy-600 prose-li:mb-2 prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4 prose-blockquote:border-l-4 prose-blockquote:border-soi-purple-600 prose-blockquote:bg-soi-purple-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg"
                  dangerouslySetInnerHTML={{ __html: processedHtml }} 
                />
              </article>

              {/* Expert Care CTA */}
              <div className="bg-gradient-to-br from-soi-purple-600 via-soi-navy-600 to-soi-navy-700 rounded-2xl p-8 md:p-12 text-center shadow-2xl">
                <div className="max-w-3xl mx-auto">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold mb-4 text-white">Need Expert Care?</h3>
                  <p className="text-xl text-white mb-8 leading-relaxed">
                    Our orthopedic specialists are here to help you with personalized treatment plans and expert guidance for your specific condition.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <BookingButton 
                      size="lg"
                      variant="rounded"
                    />
                    <Link 
                      href="/surgeons-staff" 
                      className="inline-flex items-center justify-center bg-transparent border-2 border-white text-white hover:bg-white hover:text-soi-purple-600 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 min-w-[240px] shadow-lg hover:shadow-xl"
                    >
                      Meet Our Specialists
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Related Topics Section */}
      {relatedTopics.length > 0 && (
        <div className="bg-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-block bg-soi-purple-100 text-soi-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                  CONTINUE LEARNING
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-soi-navy-800 mb-4">
                  Related Topics
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Explore more educational content about orthopedic conditions and treatments
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedTopics.slice(0, 3).map((topic) => (
                  <RelatedTopicCard
                    key={topic.slug}
                    title={topic.title}
                    slug={topic.slug}
                    imageUrl={topic.featuredImageUrl}
                    summary={topic.summary}
                  />
                ))}
              </div>
              <div className="text-center mt-12">
                <Link 
                  href="/bone-joint-school" 
                  className="inline-flex items-center bg-soi-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-soi-navy-600 transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  View All Topics
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  );
} 