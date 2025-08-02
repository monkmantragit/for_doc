import { promises as fs } from 'fs';
import path from 'path';
import Link from 'next/link';
import Image from 'next/image';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import Papa from 'papaparse';
import { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';

// Define Page type
interface PageData {
  slug: string;
  title: string;
  featuredImageUrl: string;
  originalUrl: string;
}

// Add metadata for SEO
export const metadata: Metadata = {
  title: 'Information Pages | Orthopedic Resources',
  description: 'Access our collection of informational pages covering different orthopedic topics and conditions.',
  openGraph: {
    title: 'Information Pages | Sports Orthopedics',
    description: 'Educational resources for orthopedic conditions and related information',
    images: ['/images/page-hero.webp'],
  }
};

// Get pages from CSV
async function getPages(): Promise<PageData[]> {
  const csvFilePath = path.join(process.cwd(), 'docs', 'page_cms.csv');
  const pages: PageData[] = [];

  try {
    const fileContent = await fs.readFile(csvFilePath, 'utf-8');
    const parsedCsv = Papa.parse<any>(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsedCsv.errors.length > 0) {
      console.error("CSV Parsing errors:", parsedCsv.errors);
    }

    // Convert rows to Page objects
    for (const row of parsedCsv.data) {
      if (row.Slug && row.Title && row.PageType === 'page') {
        // Clean up title (e.g., remove site name suffix)
        const title = (row.Title || '').split('|')[0].trim();
        
        pages.push({
          slug: row.Slug,
          title,
          featuredImageUrl: row.FeaturedImageURL || '/images/default-page.webp',
          originalUrl: row.OriginalURL || '',
        });
      }
    }
  } catch (error) {
    console.error("Error reading or parsing page_cms.csv:", error);
    return []; // Return empty array on error
  }

  return pages;
}

// Page Link Component
const PageLink = ({ page }: { page: PageData }) => {
  return (
    <Link 
      href={`/pages/${page.slug}`}
      className="group flex items-center justify-between p-4 border-b border-soi-purple-200 hover:bg-soi-purple-50 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-md overflow-hidden bg-soi-purple-100 relative shrink-0">
          <Image
            src={page.featuredImageUrl || '/images/default-page.webp'}
            alt=""
            fill
            className="object-cover"
          />
        </div>
        <span className="text-soi-navy-800 font-medium line-clamp-1">{page.title}</span>
      </div>
      <ArrowUpRight className="w-4 h-4 text-soi-purple-400 group-hover:text-soi-purple-600 transition-colors" />
    </Link>
  );
};

// Main Pages Page Component
export default async function PagesPage() {
  const pages = await getPages();

  return (
    <div className="min-h-screen bg-tint-authority">
      <SiteHeader theme="light" />
      
      {/* Simple Header */}
      <section className="relative py-12 md:py-16 bg-white border-b border-soi-navy-200">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-soi-navy-800 mb-3">
            Quick Links & Information
          </h1>
          <p className="text-soi-navy-600 max-w-2xl">
            Find helpful information and resources about various orthopedic procedures, conditions, and treatments.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Pages List */}
        {pages.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-soi-purple-200">
            {pages.map((page) => (
              <PageLink key={page.slug} page={page} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-8 text-center shadow-sm border border-soi-purple-200">
            <h3 className="text-xl font-medium text-soi-navy-800 mb-2">No information pages found</h3>
            <p className="text-soi-navy-600">
              Information pages will appear here once added to the database.
            </p>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
} 