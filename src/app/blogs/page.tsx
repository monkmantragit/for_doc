import { getBlogPostsAction } from '@/app/actions/blog';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, ArrowRight, BookOpen } from 'lucide-react';

// Helper function to format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Helper function to generate SOI medical category colors
function getCategoryColor(category: string) {
  const colors = [
    'bg-soi-navy-100 text-soi-navy-800',
    'bg-soi-purple-100 text-soi-purple-800',
    'bg-soi-pink-100 text-soi-pink-800',
    'bg-soi-mint-100 text-soi-mint-800',
    'bg-soi-navy-50 text-soi-navy-700',
    'bg-soi-purple-50 text-soi-purple-700',
    'bg-soi-pink-50 text-soi-pink-700',
    'bg-soi-mint-50 text-soi-mint-700'
  ];
  
  const hash = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

// Blog Card Component
function BlogCard({ post, featured = false }: { post: any; featured?: boolean }) {
  const categoryColor = getCategoryColor(post.category);
  
  if (featured) {
    return (
                    <Link href={`/${post.slug}`} className="block">
        <div className="group relative overflow-hidden bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-2">
          <div className="flex flex-col lg:flex-row">
            {/* Featured Image */}
            <div className="relative h-80 lg:h-96 lg:w-1/2 overflow-hidden">
                             <Image
                 src={post.featured_image_url}
                 alt={post.title}
                 fill
                 sizes="(max-width: 768px) 100vw, 50vw"
                 className="object-cover transition-transform duration-700 group-hover:scale-110"
                 priority
               />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className={`absolute top-6 left-6 px-4 py-2 rounded-full text-sm font-semibold ${categoryColor}`}>
                {post.category}
              </div>
              <div className="absolute bottom-6 left-6 text-white">
                <span className="inline-flex items-center text-sm font-medium bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Featured Article
                </span>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-8 lg:w-1/2 lg:p-12 flex flex-col">
              <div className="flex items-center text-sm text-soi-navy-500 mb-4">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="mr-6">{formatDate(post.date_created)}</span>
                <Clock className="w-4 h-4 mr-2" />
                <span>{post.reading_time} min read</span>
              </div>
              
              <h2 className="text-3xl lg:text-4xl font-bold text-soi-navy-800 mb-4 group-hover:text-soi-purple-600 transition-colors leading-tight">
                {post.title}
              </h2>
              
              <p className="text-lg text-soi-navy-600 mb-6 flex-grow leading-relaxed">
                {post.excerpt}
              </p>
              
              <div className="inline-flex items-center font-semibold text-soi-purple-500 group-hover:text-soi-purple-600 transition-colors">
                Read Full Article 
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
              <Link href={`/${post.slug}`} className="block h-full">
      <div className="group bg-white rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
                     <Image
             src={post.featured_image_url}
             alt={post.title}
             fill
             sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
             className="object-cover transition-transform duration-500 group-hover:scale-105"
           />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />
          <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold ${categoryColor}`}>
            {post.category}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 flex flex-col flex-grow">
          <div className="flex items-center text-xs text-soi-navy-500 mb-3">
            <Calendar className="w-3 h-3 mr-1" />
            <span className="mr-4">{formatDate(post.date_created)}</span>
            <Clock className="w-3 h-3 mr-1" />
            <span>{post.reading_time} min read</span>
          </div>
          
          <h3 className="text-xl font-bold text-soi-navy-800 mb-3 group-hover:text-soi-purple-600 transition-colors leading-tight line-clamp-2">
            {post.title}
          </h3>
          
          <p className="text-soi-navy-600 text-sm mb-4 flex-grow line-clamp-3 leading-relaxed">
            {post.excerpt}
          </p>
          
          <div className="inline-flex items-center text-sm font-semibold text-soi-purple-500 group-hover:text-soi-purple-600 transition-colors mt-auto">
            Read More 
            <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
}

// Force no caching for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function BlogPage() {
  const { posts: blogPosts, total } = await getBlogPostsAction();

  // Add physiotherapy blog post manually since it's not in Directus yet
  const physiotherapyPost = {
    id: "physiotherapy-recovery",
    title: "Beyond the Knife: Empowering Your Recovery and Performance with Physiotherapy",
    author: "Dr. Atharva Mishra PT",
    date_created: "2023-09-15",
    reading_time: 8,
    category: "Rehabilitation",
    featured_image_url: "/images_bone_joint/sportsman-having-knee-injury-problem.webp",
    excerpt: "Discover how physiotherapy serves as the crucial bridge between healing and thriving after injury or surgery. Learn about our multifaceted approach to rehabilitation at Sports Orthopedic Institute.",
    slug: "blogs/physiotherapy-recovery"
  };
  
  // Add the physiotherapy post to the blog posts array
  const allBlogPosts = [physiotherapyPost, ...blogPosts];
  
  const featuredPost = allBlogPosts[0]; // First post as featured
  const regularPosts = allBlogPosts.slice(1); // Rest as regular cards

  return (
    <div className="bg-tint-expertise">
      <SiteHeader />
      
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-32 pb-20 mb-16">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/default-hero.jpg"
              alt=""
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-soi-navy-700/85 via-soi-navy-800/85 to-soi-purple-700/80" />
          </div>
          <div className="relative z-10 text-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6">
              Our Medical <span className="text-soi-purple-300">Blog</span>
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Expert insights, research, and guidance from our team of orthopedic specialists.
              Stay informed about the latest advances in sports medicine and orthopedic care.
            </p>
          </div>
        </section>

        <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

        {blogPosts.length > 0 ? (
          <>
            {/* Featured Post */}
            {featuredPost && (
              <div className="mb-16">
                <BlogCard post={featuredPost} featured />
              </div>
            )}

            {/* Regular Posts Grid */}
            {regularPosts.length > 0 && (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-soi-navy-800 mb-2">Latest Articles</h2>
                  <div className="w-24 h-1 bg-soi-purple-500 rounded-full"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {regularPosts.map(post => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              </>
            )}

            {/* Show only featured if no other posts */}
            {blogPosts.length === 1 && (
              <div className="text-center py-12">
                <p className="text-soi-navy-500">More articles coming soon...</p>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-6 bg-soi-purple-100 rounded-full flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-soi-purple-500" />
              </div>
              <h3 className="text-xl font-semibold text-soi-navy-800 mb-2">No Articles Yet</h3>
              <p className="text-soi-navy-600">
                We're working on bringing you the latest insights in orthopedic care. Check back soon!
              </p>
            </div>
          </div>
        )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
} 