'use client';

import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { HeroSection } from './components/HeroSection';
import { VideoCard } from './components/VideoCard';
import { ExternalVideoCard } from './components/ExternalVideoCard';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { ClinicalVideo } from '@/types/clinical-videos';
import { getClinicalVideosAction, getVideoCategoriesAction } from './actions';

// Hardcoded external videos (Frame.io). These cannot be embedded — clicking opens
// the source URL in a new tab. Kept here instead of Directus until the team
// decides on a permanent hosting destination.
// Each entry's thumbnailUrl points to /public/images/educational-bytes/<file>.jpg.
// If that file doesn't exist, ExternalVideoCard falls back to /images/default-procedure.jpg
// automatically, so the card always renders an image.
const externalVideos: Array<{
  url: string;
  title: string;
  doctor: string;
  category: string;
  thumbnailUrl: string;
}> = [
  // Dr. Sameer — Manipal
  { url: 'https://f.io/NIhdmV2H', title: 'Dr. Sameer — Manipal Byte 1', doctor: 'Dr. Sameer | MHSR', category: 'Manipal Bytes', thumbnailUrl: '/images/educational-bytes/dr-sameer-byte-1.jpg' },
  { url: 'https://f.io/wsbZevHh', title: 'Dr. Sameer — Manipal Byte 2', doctor: 'Dr. Sameer | MHSR', category: 'Manipal Bytes', thumbnailUrl: '/images/educational-bytes/dr-sameer-byte-2.jpg' },
  { url: 'https://f.io/vzPKZKgk', title: 'Dr. Sameer — Manipal Byte 3', doctor: 'Dr. Sameer | MHSR', category: 'Manipal Bytes', thumbnailUrl: '/images/educational-bytes/dr-sameer-byte-3.jpg' },
  { url: 'https://f.io/adn2e6_w', title: 'Dr. Sameer — Manipal Byte 4', doctor: 'Dr. Sameer | MHSR', category: 'Manipal Bytes', thumbnailUrl: '/images/educational-bytes/dr-sameer-byte-4.jpg' },
  { url: 'https://f.io/ue4N-Qzk', title: 'Dr. Sameer — Manipal Byte 5', doctor: 'Dr. Sameer | MHSR', category: 'Manipal Bytes', thumbnailUrl: '/images/educational-bytes/dr-sameer-byte-5.jpg' },
  // Dr. Karthik — Bytes
  { url: 'https://f.io/O1RBrwaa', title: 'Ankle Sprain', doctor: 'Dr. Karthik', category: 'Foot & Ankle', thumbnailUrl: '/images/educational-bytes/ankle-sprain.jpg' },
  { url: 'https://f.io/rlo3PbVE', title: 'Regenerative Therapy', doctor: 'Dr. Karthik', category: 'General', thumbnailUrl: '/images/educational-bytes/regenerative-therapy.jpg' },
  { url: 'https://f.io/PVhgZBvq', title: 'Coccyx Pain', doctor: 'Dr. Karthik', category: 'Spine', thumbnailUrl: '/images/educational-bytes/coccyx-pain.jpg' },
  { url: 'https://f.io/Mx0IpKjm', title: 'Flat Foot', doctor: 'Dr. Karthik', category: 'Foot & Ankle', thumbnailUrl: '/images/educational-bytes/flat-foot.jpg' },
  { url: 'https://f.io/-hWjEn2J', title: 'Hip Pain', doctor: 'Dr. Karthik', category: 'Hip', thumbnailUrl: '/images/educational-bytes/hip-pain.jpg' },
  // Dr. Sreejith T J — MHSR
  { url: 'https://f.io/Zvc-xk0N', title: 'Educational Byte (English)', doctor: 'Dr. Sreejith T J | MHSR', category: 'Bytes', thumbnailUrl: '/images/educational-bytes/educational-byte-english.jpg' },
  { url: 'https://f.io/p99Sx0vd', title: 'Educational Byte (Malayalam)', doctor: 'Dr. Sreejith T J | MHSR', category: 'Bytes', thumbnailUrl: '/images/educational-bytes/educational-byte-malayalam.jpg' },
];

// Fallback videos data for development
const fallbackVideos = [
  {
    id: 'qVDqcy8wwUg',
    title: 'Rotator Cuff Tear I Dr. Naveen Kumar L V I Manipal Hospital Sarjapur Road',
    category: 'Shoulder'
  },
  {
    id: 'hxs2YjO1Zq0',
    title: 'Arthroscopy I Dr. Naveen Kumar L V I MHSR',
    category: 'General'
  },
  {
    id: 'E-VpOLEQpcQ',
    title: 'Ganglion Cysts I Dr. Naveen Kumar LV I Manipal Hospitals Sarjapur Road',
    category: 'Hand & Wrist'
  },
  {
    id: 'TktJOoSjlPk',
    title: 'ELBOW OATS - CARTILAGE RECONSTRUCTION | Dr. Naveen Kumar LV | Sports Orthopedics Institute',
    category: 'Elbow'
  },
  {
    id: 'iW29YPvDM-4',
    title: 'Hamstring tear repair | Dr. Naveen Kumar LV | Sports Orthopedics Institute',
    category: 'Hip'
  },
  {
    id: 'yJPpSeOmW2Y',
    title: 'Carpal Tunnel Syndrome I Dr. Naveen Kumar LV I MHSR',
    category: 'Hand & Wrist'
  },
  {
    id: 'GVjXjGC4kjU',
    title: 'Tennis Elbow I Dr. Naveen Kumar LV I MHSR',
    category: 'Elbow'
  },
  {
    id: 'YOkCRz1Sgxo',
    title: 'Shoulder Impingement I Dr. Naveen Kumar LV I Manipal Hospital Sarjapur Road',
    category: 'Shoulder'
  },
  {
    id: 'U8MdByb5rGg',
    title: 'MPFL RECONSTRUCTION + RE ALIGNMENT SURGERY | Dr. Naveen Kumar LV | Sports Orthopedics Institute',
    category: 'Knee'
  },
  {
    id: 'aw4vGSYdUbE',
    title: 'Patellar Chondromalacia Surgery | Dr. Naveen Kumar LV | Sports Orthopedics Institute',
    category: 'Knee'
  },
  {
    id: 'Iaa4oyruQ8Y',
    title: 'Ankle ligament injuries Surgery | Dr. Naveen Kumar LV | Sports Orthopedics Institute',
    category: 'Foot & Ankle'
  },
  {
    id: 'yOhuYkeSbd4',
    title: 'What is Sports Orthopedics? - RadioCity Talk! | Dr. Naveen Kumar LV | Sports Orthopedics Institute',
    category: 'General'
  },
  {
    id: '1l5WYQJfAXQ',
    title: 'Pectoralis Major Repair Surgery | Dr. Naveen Kumar LV | Sports Orthopedics Institute',
    category: 'Shoulder'
  },
  {
    id: '2_RRRSKjmxY',
    title: 'All About Knee Arthritis! | Dr. Naveen Kumar LV | Sports Orthopedics Institute',
    category: 'Knee'
  },
  {
    id: 'yY1xKJeHUVs',
    title: 'All You need to know about Rotator Cuff Injury | Dr. Naveen Kumar L.V. | Manipal Hospital Sarjapur',
    category: 'Shoulder'
  },
  {
    id: 'Cq4tunXNTA4',
    title: 'MCL ligament Surgery | Dr. Naveen Kumar LV | Sports Orthopedics Institute',
    category: 'Knee'
  },
  {
    id: 'DDBD-3zz8sw',
    title: 'De Quervain\'s Tenosynovitis I Dr. Naveen Kumar LV I MHSR',
    category: 'Hand & Wrist'
  },
  {
    id: 'gMDWt5v8Rs0',
    title: 'All you need to know about ACL Ligament | Dr. Naveen Kumar L.V. | Manipal Hospitals Sarjapur Road',
    category: 'Knee'
  },
  {
    id: 'n_gbHg_luvo',
    title: 'Hallux Valgus I Dr. Naveen Kumar I Manipal Hospital Sarjapur Road',
    category: 'Foot & Ankle'
  },
  {
    id: 'aLGCgpIx9u8',
    title: 'ACL Injury I Dr. Naveen Kumar L V I Manipal Hospitals Sarjapur Road',
    category: 'Knee'
  },
  {
    id: 'EKygpau56ns',
    title: 'Ankle Ligament Injuries I Dr. Naveen Kumar I Manipal Hospital Sarjapur Road',
    category: 'Foot & Ankle'
  },
  {
    id: 'Kday79L99Ng',
    title: 'Sports Injury I Dr. Naveen Kumar L V I Manipal Hospital Sarjapur Road',
    category: 'General'
  },
  {
    id: '1QXm_wu5BL8',
    title: 'UCL Ligament Thumb Surgery | Dr. Naveen Kumar LV | Sports Orthopedics Institute',
    category: 'Hand & Wrist'
  },
  {
    id: 'rK93Md5B7ag',
    title: 'Thumb Arthritis I Dr. Naveen Kumar L V I MHSR',
    category: 'Hand & Wrist'
  },
  {
    id: 'l9QrZNcZOq4',
    title: 'Patellar Tendinopathy I Dr. Naveen Kumar LV I MHSR',
    category: 'Knee'
  },
  {
    id: 'tkRy_PZLNXo',
    title: 'Knee Replacement Surgery I Dr. Naveen Kumar L V I Manipal Hospital Sarjapur Road',
    category: 'Knee'
  }
];

// Video grid component with filtering
function VideoGrid() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [videos, setVideos] = useState<ClinicalVideo[]>([]);
  const [categories, setCategories] = useState<string[]>(['All Videos']);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Load initial data
  useEffect(() => {
    loadVideosData();
    loadCategories();
  }, []);

  // Load data when filters change
  useEffect(() => {
    loadVideosData();
  }, [activeCategory, page]);

  const loadVideosData = async () => {
    setLoading(true);
    try {
      const result = await getClinicalVideosAction(
        page,
        activeCategory || undefined
      );
      setVideos(result.data);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch (error) {
      console.error('Error loading clinical videos:', error);
      // Fallback to static data
      setVideos(fallbackVideos as any);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await getVideoCategoriesAction();
      setCategories(cats);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleCategoryChange = (category: string | null) => {
    setActiveCategory(category);
    setPage(1);
  };
    
      return (
      <>
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-soi-purple-500" />
          </div>
        )}

        {/* Category filter buttons */}
        {!loading && (
          <div className="mb-8 flex flex-wrap gap-2">
            <button 
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors 
                ${!activeCategory 
                  ? 'bg-soi-navy-500 text-white' 
                  : 'bg-soi-navy-50 text-soi-navy-700 hover:bg-soi-navy-100 hover:text-soi-navy-600'
                }`}
              onClick={() => handleCategoryChange(null)}
            >
              All Videos
            </button>
            
            {(categories || []).filter((cat: string) => cat !== 'All Videos').map((category: string) => (
              <button 
                key={category} 
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors 
                  ${activeCategory === category 
                    ? 'bg-soi-navy-500 text-white' 
                    : 'bg-soi-navy-50 text-soi-navy-700 hover:bg-soi-navy-100 hover:text-soi-navy-600'
                  }`}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>
        )}
        
        {/* Video count */}
        {!loading && (
          <p className="text-sm text-soi-navy-500 mb-6">
            Showing {videos.length} of {total} videos
            {activeCategory ? ` in "${activeCategory}"` : ''}
          </p>
        )}
        
        {/* Video Grid */}
        {!loading && videos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {videos.map((video: ClinicalVideo) => (
              <VideoCard
                key={video.id}
                youtubeId={video.video_id || video.id}
                title={video.title}
                category={video.category}
                thumbnailUrl={(video as any).thumbnailUrl || video.thumbnail_url}
              />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && videos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-soi-navy-600 mb-4">No videos found.</p>
            <button
              onClick={() => handleCategoryChange(null)}
              className="px-4 py-2 bg-soi-navy-500 text-white rounded-full text-sm hover:bg-soi-navy-600 transition-colors"
            >
              Show All Videos
            </button>
          </div>
        )}

        {/* Pagination */}
        {!loading && videos.length > 0 && totalPages > 1 && (
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
      </>
    );
}

// Main page component
export default function ClinicalVideosPage() {
  return (
    <div className="min-h-screen bg-tint-expertise">
      <SiteHeader theme="light" />
      
      {/* Hero Section */}
      <HeroSection
        title="Clinical Videos"
        description="Watch educational videos on orthopedic conditions, treatments, and surgical procedures by Dr. Naveen Kumar L V."
        imageSrc="/images/team-hero.jpg"
      />
      
      {/* Main Content with Video Grid */}
      <main id="videos" className="container mx-auto px-4 py-12 md:py-16">
        {/* Featured Video Section */}
        <div className="mb-12">
          <div className="bg-tint-expertise rounded-2xl p-6 md:p-8 border border-soi-purple-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-soi-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                FEATURED
              </div>
              <span className="text-soi-purple-600 text-sm font-medium">Latest Video</span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 items-center">
              {/* Video Thumbnail */}
              <div className="relative group cursor-pointer" onClick={() => window.open('https://www.youtube.com/watch?v=1dg4y8kcS9s', '_blank')}>
                <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg">
                  <img 
                    src="https://img.youtube.com/vi/1dg4y8kcS9s/hqdefault.jpg"
                    alt="Featured Clinical Video"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                    <div className="w-16 h-16 bg-soi-navy-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-white fill-white ml-1" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                  
                  {/* YouTube Logo */}
                  <div className="absolute top-3 right-3 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                    YouTube
                  </div>
                </div>
              </div>
              
              {/* Video Info */}
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-soi-navy-800 mb-3 leading-tight">
                  Featured Clinical Video
                </h3>
                <p className="text-soi-navy-600 mb-4 leading-relaxed">
                  Watch this comprehensive clinical video covering important orthopedic procedures and patient care insights from our expert medical team.
                </p>
                <button 
                  onClick={() => window.open('https://www.youtube.com/watch?v=1dg4y8kcS9s', '_blank')}
                  className="inline-flex items-center gap-2 bg-soi-navy-500 hover:bg-soi-navy-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg group"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  Watch on YouTube
                  <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-soi-navy-800 mb-4">Educational Video Library</h2>
          <p className="text-soi-navy-600 max-w-3xl">
            Browse our collection of informative videos on various orthopedic procedures, conditions, and treatment options. These videos are designed to help patients understand their conditions better.
          </p>
        </div>
        
        {/* Video Grid with filtering */}
        <VideoGrid />

        {/* Educational Bytes (hardcoded external videos) */}
        <section className="mt-16">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-soi-navy-800 mb-4">Educational Bytes</h2>
            <p className="text-soi-navy-600 max-w-3xl">
              Short clinical-byte videos from our consultants at Sports Orthopedics Institute and Manipal Hospital. Click any card to watch on the original source.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {externalVideos.map((v) => (
              <ExternalVideoCard
                key={v.url}
                url={v.url}
                title={v.title}
                doctor={v.doctor}
                category={v.category}
                thumbnailUrl={v.thumbnailUrl}
              />
            ))}
          </div>
        </section>

        {/* Additional Information */}
        <div className="mt-16 bg-white p-8 rounded-lg shadow-sm border border-soi-purple-100">
          <h3 className="text-xl font-bold text-soi-navy-800 mb-4">About Our Clinical Videos</h3>
          <p className="text-soi-navy-600 mb-4">
            These educational videos are created by Dr. Naveen Kumar L V from Sports Orthopedics Institute to help patients understand various orthopedic conditions and treatments. The videos cover a wide range of topics including joint replacements, sports injuries, arthroscopic procedures, and more.
          </p>
          <p className="text-soi-navy-600">
            Please note that these videos are for informational purposes only and should not replace professional medical advice. If you have specific questions about your condition or treatment options, please schedule a consultation with our specialists.
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
} 