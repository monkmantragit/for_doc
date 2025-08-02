import { promises as fs } from 'fs';
import path from 'path';
import Link from 'next/link';
import Image from 'next/image';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import Papa from 'papaparse';
import { Metadata, ResolvingMetadata } from 'next';
import { ArrowLeft, ChevronRight, Filter } from 'lucide-react';
import { PostCard, BlogPost } from '@/components/blog/PostCard';
import { processImageUrl, extractCategories } from '@/app/utils/image-utils';

// Define Category interface
interface Category {
  slug: string;
  title: string;
  featuredImageUrl: string;
  originalUrl: string;
  breadcrumbs: {
    name: string;
    url: string | null;
  }[];
}

// Define props for the dynamic page
type Props = {
  params: { slug: string };
};

// Generate metadata for the page
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug);
  
  if (!category) {
    return {
      title: 'Category Not Found',
      description: 'The requested category could not be found.'
    };
  }
  
  return {
    title: `${category.title} | Medical Articles`,
    description: `Browse expert articles on ${category.title.toLowerCase()} from leading medical professionals.`,
    openGraph: {
      title: category.title,
      description: `Expert articles on ${category.title.toLowerCase()} from leading medical professionals.`,
      images: [category.featuredImageUrl],
    },
  };
}

// Get a specific category by its slug
async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const csvFilePath = path.join(process.cwd(), 'docs', 'category_cms.csv');
  
  try {
    const fileContent = await fs.readFile(csvFilePath, 'utf-8');
    const parsedCsv = Papa.parse<any>(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    // Find the category with the matching slug
    const categoryRow = parsedCsv.data.find(row => row.Slug === slug);
    
    if (!categoryRow) {
      console.error(`Category with slug "${slug}" not found`);
      return null;
    }
    
    // Clean up title
    const title = (categoryRow.Title || slug).split('|')[0].trim();
    
    // Parse breadcrumbs
    let breadcrumbs: { name: string; url: string | null }[] = [];
    try {
      if (categoryRow.BreadcrumbJSON) {
        breadcrumbs = JSON.parse(categoryRow.BreadcrumbJSON);
      }
    } catch (e) {
      console.warn(`Failed to parse breadcrumbs for category "${slug}":`, e);
    }

    return { 
      slug,
      title,
      featuredImageUrl: categoryRow.FeaturedImageURL || '/images/default-category.webp',
      originalUrl: categoryRow.OriginalURL || '',
      breadcrumbs
    };
  } catch (error) {
    console.error(`Error getting category "${slug}":`, error);
    return null;
  }
}

// Helper to safely parse JSON
function safeJsonParse<T>(jsonString: string | undefined | null): T | null {
  if (!jsonString) return null;
  try {
    return JSON.parse(jsonString) as T;
  } catch (e) {
    console.warn("Failed to parse JSON string:", jsonString, e);
    return null;
  }
}

// Helper to strip HTML tags
function stripHtml(html: string): string {
  return html?.replace(/<[^>]*>?/gm, '') || '';
}

// Calculate estimated read time
function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

// Get posts for a specific category
async function getPostsByCategory(categorySlug: string): Promise<BlogPost[]> {
  const csvFilePath = path.join(process.cwd(), 'docs', 'post_cms.csv');
  const posts: BlogPost[] = [];
  
  try {
    const fileContent = await fs.readFile(csvFilePath, 'utf-8');
    const parsedCsv = Papa.parse<any>(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    const categoryInfo = await getCategoryBySlug(categorySlug);
    if (!categoryInfo) {
      return [];
    }
    
    // Extract category name without "| Sports Orthopedics" suffix
    const categoryName = categoryInfo.title.split('|')[0].trim();

    for (const row of parsedCsv.data) {
      // Check if the row has necessary data
      if (row.Slug && row.Title) {
        const slug = row.Slug;
        // Clean up title
        const title = (row.Title || slug).split('|')[0].trim();
        
        // Get summary and determine if post belongs to this category
        let summary = 'No summary available.';
        let contentText = '';
        let readTime = 3; // Default read time in minutes
        
        const contentBlocks = safeJsonParse<{type: string, text: string}[]>(row.ContentBlocksJSON);
        if (contentBlocks) {
          // Get first paragraph for summary
          const firstParagraph = contentBlocks.find(block => block.type === 'paragraph');
          if (firstParagraph && firstParagraph.text) {
            const plainText = stripHtml(firstParagraph.text);
            summary = plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
          }
          
          // Combine content for category detection
          contentText = contentBlocks
            .filter(block => block.type === 'paragraph' || block.type === 'heading')
            .map(block => stripHtml(block.text || ''))
            .join(' ');
            
          readTime = calculateReadTime(contentText);
        }
        
        // Extract category
        const postCategory = extractCategories(title, contentText);
        
        // Match against the current category
        // This is a heuristic approach - we check if the post category matches OR 
        // if the title/content contains the category name
        const titleLower = title.toLowerCase();
        const contentLower = contentText.toLowerCase();
        const categoryLower = categoryName.toLowerCase();
        
        const isMatchingCategory = 
          postCategory.toLowerCase().includes(categoryLower) || 
          categoryLower.includes(postCategory.toLowerCase()) ||
          titleLower.includes(categoryLower) || 
          contentLower.includes(categoryLower);
        
        if (isMatchingCategory) {
          // Process featured image URL
          const featuredImageUrl = processImageUrl(row.FeaturedImageURL, postCategory);
          
          // Use ScrapedAt as publish date or fallback to current date
          const publishedAt = row.ScrapedAt || new Date().toISOString();

          posts.push({ 
            slug, 
            pageType: row.PageType || 'post',
            title, 
            originalUrl: row.OriginalURL || '',
            featuredImageUrl, 
            summary,
            category: postCategory,
            publishedAt,
            readTime
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error getting posts for category "${categorySlug}":`, error);
    return [];
  }

  // Sort posts by date, newest first
  posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  
  return posts;
}

// Main Category Page Component
export default async function CategoryPage({ params }: Props) {
  const { slug } = params;
  const category = await getCategoryBySlug(slug);
  const posts = await getPostsByCategory(slug);
  
  if (!category) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader theme="light" />
        <main className="flex-grow container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-soi-navy-800 mb-4">Category Not Found</h1>
          <p className="text-soi-navy-600 mb-6">The category you're looking for could not be found.</p>
          <Link 
            href="/categories" 
            className="inline-flex items-center text-soi-purple-600 hover:text-soi-navy-600 hover:underline"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to all categories
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-tint-expertise">
      <SiteHeader theme="light" />
      
      {/* Hero Section */}
      <section className="relative h-[40vh] md:h-[50vh] flex items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gray-800">
          <Image
            src={category.featuredImageUrl}
            alt={category.title}
            fill
            sizes="100vw"
            priority
            className="object-cover opacity-70"
          />
          {/* Apply gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white max-w-4xl mx-auto leading-tight">
            {category.title}
          </h1>
        </div>
      </section>

      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-soi-purple-200">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex text-sm">
            <Link href="/" className="text-soi-navy-500 hover:text-soi-purple-600">Home</Link>
            <span className="mx-2 text-soi-navy-400">/</span>
            <Link href="/categories" className="text-soi-navy-500 hover:text-soi-purple-600">Categories</Link>
            <span className="mx-2 text-soi-navy-400">/</span>
            <span className="text-soi-navy-700">{category.title}</span>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-soi-navy-800">
              Articles in {category.title}
            </h2>
            
            <div className="text-sm text-soi-purple-600">
              {posts.length} article{posts.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
        
        {/* Posts Grid */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-8 text-center shadow-sm">
            <h3 className="text-xl font-medium text-soi-navy-800 mb-2">No articles found</h3>
            <p className="text-soi-navy-600">
              No articles found in the "{category.title}" category.
            </p>
            <Link href="/blogs" className="mt-4 inline-block text-soi-purple-600 hover:text-soi-navy-600 hover:underline">
              View all articles
            </Link>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
} 