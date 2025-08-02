'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { Search, Filter, X, Loader2 } from 'lucide-react';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { GalleryImage } from '@/types/gallery';
import { getGalleryImagesAction, getGalleryCategoriesAction } from './actions';

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  
  // Load initial data
  useEffect(() => {
    loadGalleryData();
    loadCategories();
  }, []);

  // Load data when filters change
  useEffect(() => {
    loadGalleryData();
  }, [selectedCategory, searchQuery, page]);

  const loadGalleryData = async () => {
    setLoading(true);
    try {
      const result = await getGalleryImagesAction(
        page,
        selectedCategory === 'All' ? undefined : selectedCategory,
        searchQuery || undefined
      );
      setImages(result.data);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch (error) {
      console.error('Error loading gallery images:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await getGalleryCategoriesAction();
      setCategories(cats);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-tint-expertise">
      <SiteHeader theme="light" />
      
      {/* Hero Section */}
      <section className="relative min-h-[60vh] md:min-h-[70vh] flex flex-col justify-center overflow-hidden">
        <motion.div
          style={{ y: backgroundY }}
          className="absolute inset-0 z-0"
        >
          <Image
            src="/images/team-hero.jpg"
            alt="Gallery hero image"
            fill
            className="object-cover scale-110"
            priority
            quality={90}
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-30 mix-blend-soft-light" />
        </motion.div>

        <div className="relative z-10 container mx-auto px-4 pt-24 md:pt-32">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
            >
              Our Gallery
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto"
            >
              Explore images of our facilities, team, events, and procedures
            </motion.p>
          </div>
        </div>
      </section>
      
      {/* Content Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          {/* Filters and Search */}
          <div className="max-w-6xl mx-auto mb-12">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Category Filters */}
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {categories.map((category: string) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`
                      px-4 py-2 rounded-full text-sm font-medium transition-all
                      ${selectedCategory === category
                        ? 'bg-soi-navy-500 text-white shadow-md'
                        : 'bg-white text-soi-navy-700 hover:bg-soi-purple-50 border border-soi-purple-200'
                      }
                    `}
                  >
                    {category}
                  </button>
                ))}
              </div>
              
              {/* Search */}
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-soi-navy-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search gallery..."
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-soi-purple-200 bg-white focus:border-soi-purple-500 focus:ring-2 focus:ring-soi-purple-200/50 transition-all text-soi-navy-800 placeholder:text-soi-navy-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-soi-navy-400 hover:text-soi-navy-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-soi-purple-500" />
            </div>
          )}

          {/* Results Info */}
          {!loading && (
            <div className="max-w-7xl mx-auto mb-6">
              <p className="text-sm text-soi-navy-500">
                Showing {images.length} of {total} images
                {selectedCategory !== 'All' && ` in "${selectedCategory}"`}
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
            </div>
          )}
          
          {/* Gallery Grid */}
          <div className="max-w-7xl mx-auto">
            {!loading && images.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {images.map((image: GalleryImage) => (
                  <motion.div
                    key={image.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="group relative aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-soi-purple-100 hover:border-soi-purple-300 bg-white"
                    onClick={() => setSelectedImage(image.id)}
                    style={{ minHeight: '200px' }}
                  >
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                      <Image
                        src={(image as any).imageUrl || `/images/gallery/${image.image}`}
                        alt={image.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <p className="text-white font-medium text-sm md:text-base">{image.title}</p>
                      <p className="text-white/80 text-xs md:text-sm">{image.category}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : !loading ? (
              <div className="text-center py-12">
                <p className="text-soi-navy-600 mb-4">No images found matching your search criteria.</p>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-soi-navy-500 text-white rounded-full text-sm hover:bg-soi-navy-600 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : null}

            {/* Pagination */}
            {!loading && images.length > 0 && totalPages > 1 && (
              <div className="flex justify-center mt-12 gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg border border-soi-navy-200 text-soi-navy-600 hover:bg-soi-navy-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-4 py-2 rounded-lg border ${
                        page === pageNum
                          ? 'bg-soi-navy-500 text-white border-soi-navy-500'
                          : 'border-soi-navy-200 text-soi-navy-600 hover:bg-soi-navy-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg border border-soi-navy-200 text-soi-navy-600 hover:bg-soi-navy-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Lightbox Modal */}
      {selectedImage !== null && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-4 right-4 text-white p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-6 h-6" />
          </button>
          
          <div 
            className="relative max-w-4xl w-full h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
                             const selectedImageData = images.find((img: GalleryImage) => img.id === selectedImage);
              if (selectedImageData) {
                return (
                  <>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                      <Image
                        src={(selectedImageData as any).imageUrl || `/images/gallery/${selectedImageData.image}`}
                        alt={selectedImageData.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 80vw"
                        className="object-contain"
                      />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/40 backdrop-blur-sm">
                      <p className="text-white font-medium">
                        {selectedImageData.title}
                      </p>
                      <p className="text-white/80 text-sm">
                        {selectedImageData.category}
                      </p>
                    </div>
                  </>
                );
              }
              return null;
            })()}
          </div>
        </div>
      )}
      
      <SiteFooter />
    </div>
  );
} 