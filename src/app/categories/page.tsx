import { promises as fs } from 'fs';
import path from 'path';
import Link from 'next/link';
import Image from 'next/image';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import Papa from 'papaparse';
import { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';

// Define Category type
interface Category {
  slug: string;
  title: string;
  featuredImageUrl: string;
  originalUrl: string;
}

// Add metadata for SEO
export const metadata: Metadata = {
  title: 'Browse Categories | Orthopedic Topics',
  description: 'Explore our collection of articles by categories covering different orthopedic conditions, treatments and procedures.',
  openGraph: {
    title: 'Browse Categories | Sports Orthopedics',
    description: 'Explore orthopedic articles by category',
    images: ['/images/category-hero.webp'],
  }
};

// Get categories from CSV
async function getCategories(): Promise<Category[]> {
  const csvFilePath = path.join(process.cwd(), 'docs', 'category_cms.csv');
  const categories: Category[] = [];

  try {
    const fileContent = await fs.readFile(csvFilePath, 'utf-8');
    const parsedCsv = Papa.parse<any>(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsedCsv.errors.length > 0) {
      console.error("CSV Parsing errors:", parsedCsv.errors);
    }

    // Convert rows to Category objects
    for (const row of parsedCsv.data) {
      if (row.Slug && row.Title) {
        // Clean up title (e.g., remove site name suffix)
        const title = (row.Title || '').split('|')[0].trim();
        
        categories.push({
          slug: row.Slug,
          title,
          featuredImageUrl: row.FeaturedImageURL || '/images/default-category.webp',
          originalUrl: row.OriginalURL || '',
        });
      }
    }
  } catch (error) {
    console.error("Error reading or parsing category_cms.csv:", error);
    return []; // Return empty array on error
  }

  return categories;
}

// Category Card Component
const CategoryCard = ({ category }: { category: Category }) => {
  return (
    <Link 
      href={`/categories/${category.slug}`}
      className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 block h-64 border border-soi-purple-200 hover:border-soi-purple-400"
    >
      <Image
        src={category.featuredImageUrl}
        alt={category.title}
        fill
        className="object-cover transition-all duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-soi-purple-900/90 via-soi-purple-800/50 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-soi-mint-100 transition-colors">
          {category.title}
        </h3>
        <div className="flex items-center mt-2 text-white/90 transition-all opacity-90 group-hover:opacity-100 group-hover:text-soi-mint-200">
          <span className="text-sm">View articles</span>
          <ArrowUpRight className="w-4 h-4 ml-1" />
        </div>
      </div>
    </Link>
  );
};

// Main Categories Page Component
export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-tint-expertise">
      <SiteHeader theme="light" />
      
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 flex items-center justify-center text-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1579684453377-1552c18c5941?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="Medical categories"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-soi-purple-900/80 via-soi-navy-900/70 to-black/60"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Browse by Category
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-6">
            Explore our collection of expert articles organized by medical topics and conditions
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-soi-navy-800 mb-2">
            Medical Categories
          </h2>
          <p className="text-soi-navy-600">
            Select a category to explore related articles and resources
          </p>
        </div>
        
        {/* Categories Grid */}
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {categories.map((category) => (
              <CategoryCard key={category.slug} category={category} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-8 text-center shadow-sm border border-soi-purple-200">
            <h3 className="text-xl font-medium text-soi-navy-800 mb-2">No categories found</h3>
            <p className="text-soi-navy-600">
              Categories will appear here once added to the database.
            </p>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
} 