import { promises as fs } from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { Metadata, ResolvingMetadata } from 'next';
import { ArrowLeft, ChevronRight, Share2 } from 'lucide-react';
import Papa from 'papaparse';
import BookingButton from './components/BookingButton';

// Constants
const CSV_FILE_PATH = path.join(process.cwd(), 'docs', 'page_cms.csv');
const DEFAULT_IMAGE = '/images/default-page.webp';

// Types
interface PageData {
  slug: string;
  title: string;
  featuredImageUrl: string;
  breadcrumbs: {
    name: string;
    url: string | null;
  }[];
  contentBlocks: ContentBlock[];
}

interface ContentBlock {
  type: string;
  text?: string;
  level?: number;
  icon?: string;
  src?: string;
  alt?: string;
  url?: string;
  title?: string;
  content?: string;
  image?: string;
  items?: string[];
}

interface BreadcrumbItem {
  name: string;
  url: string | null;
}

type Props = {
  params: { slug: string };
};

// Helper to safely parse JSON
function safeJsonParse<T>(jsonString: string | undefined | null, fallback: T = [] as unknown as T): T {
  if (!jsonString) return fallback;
  try {
    return JSON.parse(jsonString) as T;
  } catch (e) {
    console.warn("Failed to parse JSON string:", e);
    return fallback;
  }
}

// Generate metadata for the page
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = params;
  const page = await getPageData(slug);
  
  if (!page) {
    return {
      title: 'Page Not Found',
      description: 'The requested page could not be found.',
    };
  }

  return {
    title: page.title,
    description: `Information about ${page.title}`,
    openGraph: {
      title: page.title,
      description: `Information about ${page.title}`,
      images: [page.featuredImageUrl || DEFAULT_IMAGE],
    },
  };
}

// Fetch page data from CSV
async function getPageData(slug: string): Promise<PageData | null> {
  try {
    const fileContent = await fs.readFile(CSV_FILE_PATH, 'utf-8');
    const parsedCsv = Papa.parse<any>(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsedCsv.errors.length > 0) {
      console.error("CSV Parsing errors:", parsedCsv.errors);
    }

    // Find the page with matching slug
    const row = parsedCsv.data.find(r => r.Slug === slug && r.PageType === 'page');

    if (!row) {
      return null;
    }

    // Clean up title
    const title = (row.Title || '').split('|')[0].trim();
    
    // Parse JSON data
    const breadcrumbs = safeJsonParse<BreadcrumbItem[]>(row.BreadcrumbJSON, []);
    const contentBlocks = safeJsonParse<ContentBlock[]>(row.ContentBlocksJSON, []);

    return {
      slug,
      title,
      featuredImageUrl: row.FeaturedImageURL || DEFAULT_IMAGE,
      breadcrumbs,
      contentBlocks,
    };
  } catch (error) {
    console.error("Error reading or parsing page_cms.csv:", error);
    return null;
  }
}

// Content renderer
const ContentRenderer = ({ contentBlocks }: { contentBlocks: ContentBlock[] }) => {
  return (
    <div className="page-content">
      {contentBlocks.map((block, index) => {
        switch (block.type) {
          case 'heading':
            const HeadingTag = `h${block.level || 2}` as keyof JSX.IntrinsicElements;
            return (
              <HeadingTag 
                key={index} 
                className={`font-bold ${
                  block.level === 1 ? 'text-3xl mb-6' : 
                  block.level === 2 ? 'text-2xl mb-4 mt-8' : 
                  'text-xl mb-3 mt-6'
                } text-soi-navy-800`}
                dangerouslySetInnerHTML={{ __html: block.text || '' }}
              />
            );
          
          case 'paragraph':
            return (
              <p 
                key={index} 
                className="mb-4 text-soi-navy-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: block.text || '' }}
              />
            );
          
          case 'image':
            return (
              <div key={index} className="my-6 rounded-lg overflow-hidden">
                <Image
                  src={block.src || DEFAULT_IMAGE}
                  alt={block.alt || 'Image'}
                  width={800}
                  height={500}
                  className="w-full h-auto"
                />
              </div>
            );
          
          case 'button':
            return (
              <Link key={index} href={block.url || '#'}>
                <button className="px-6 py-2 my-4 rounded-md bg-soi-navy-500 text-white hover:bg-soi-navy-600 transition-colors border-2 border-soi-purple-400">
                  {block.text}
                </button>
              </Link>
            );
          
          case 'styled_list_item':
            return (
              <div key={index} className="flex mb-3">
                <div className="mr-3 text-soi-purple-600">
                  {/* Simplified icon handling - could be expanded with more icons */}
                  {block.icon === 'heartbeat' && '❤️'}
                  {block.icon === 'star-half-stroke' && '⭐'}
                  {block.icon === 'file-medical-alt' && '📋'}
                  {block.icon === 'people-arrows' && '👥'}
                  {block.icon === 'phone-alt' && '📞'}
                  {block.icon === 'location-dot' && '📍'}
                  {!block.icon && '•'}
                </div>
                <div className="flex-1" dangerouslySetInnerHTML={{ __html: block.text || '' }} />
              </div>
            );
          
          case 'feature_box':
            return (
              <div key={index} className="bg-soi-navy-50 p-6 rounded-lg my-6 shadow-sm border border-soi-navy-200">
                <h3 className="text-xl font-semibold mb-3 text-soi-navy-800">{block.title}</h3>
                <div dangerouslySetInnerHTML={{ __html: block.content || '' }} />
                {block.image && (
                  <Image
                    src={block.image}
                    alt={block.title || 'Feature image'}
                    width={400}
                    height={300}
                    className="mt-4 rounded-md"
                  />
                )}
              </div>
            );
          
          case 'unordered-list':
            return (
              <ul key={index} className="list-disc pl-5 mb-5 space-y-2">
                {block.items?.map((item, i) => (
                  <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                ))}
              </ul>
            );
            
          default:
            return null;
        }
      })}
    </div>
  );
};

// Page component
export default async function PageDetail({ params }: Props) {
  const { slug } = params;
  const page = await getPageData(slug);
  
  if (!page) {
    notFound();
  }
  
  // First content block with type 'image' for hero, if any
  const heroImage = page.contentBlocks.find(block => block.type === 'image')?.src || page.featuredImageUrl || DEFAULT_IMAGE;
  
  return (
    <div className="min-h-screen bg-tint-authority">
      <SiteHeader theme="light" />
      
      {/* Hero Section */}
      <section className="relative h-[30vh] md:h-[40vh] flex items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gray-800">
          <Image
            src={heroImage}
            alt={page.title}
            fill
            sizes="100vw"
            priority
            className="object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white max-w-4xl mx-auto leading-tight">
            {page.title}
          </h1>
        </div>
      </section>

      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-soi-navy-200">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex text-sm">
            <Link href="/" className="text-soi-navy-500 hover:text-soi-purple-600">Home</Link>
            <span className="mx-2 text-soi-navy-400">/</span>
            <Link href="/pages" className="text-soi-navy-500 hover:text-soi-purple-600">Pages</Link>
            <span className="mx-2 text-soi-navy-400">/</span>
            <span className="text-soi-navy-700">{page.title}</span>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-2/3">
            <article className="bg-white rounded-xl shadow-sm p-6 md:p-8">
              <ContentRenderer contentBlocks={page.contentBlocks} />
            </article>
            
            {/* Back to Pages Link */}
            <div className="mt-8">
              <Link 
                href="/pages" 
                className="inline-flex items-center text-soi-purple-600 hover:text-soi-navy-600 hover:underline"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to all pages
              </Link>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <h3 className="text-xl font-bold mb-4 text-soi-navy-800">Need Assistance?</h3>
              <p className="mb-6 text-soi-navy-600">
                If you'd like to learn more about {page.title} or schedule a consultation with our specialists, we're here to help.
              </p>
              
              <BookingButton />
              
              <hr className="my-6 border-soi-navy-200" />
              
              <h4 className="font-semibold mb-2 text-soi-navy-800">More Resources</h4>
              <ul className="space-y-2">
                <li>
                  <Link 
                    href="/bone-joint-school" 
                    className="inline-flex items-center text-soi-navy-600 hover:text-soi-purple-600"
                  >
                    <ChevronRight className="w-4 h-4 mr-1" />
                    Bone & Joint School
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/procedure-surgery" 
                    className="inline-flex items-center text-soi-navy-600 hover:text-soi-purple-600"
                  >
                    <ChevronRight className="w-4 h-4 mr-1" />
                    Procedures & Surgeries
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/blogs" 
                    className="inline-flex items-center text-soi-navy-600 hover:text-soi-purple-600"
                  >
                    <ChevronRight className="w-4 h-4 mr-1" />
                    Blog Articles
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
} 