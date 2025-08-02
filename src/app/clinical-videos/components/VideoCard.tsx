'use client';

import { Play } from 'lucide-react';

interface VideoCardProps {
  youtubeId: string;
  title: string;
  category?: string;
  thumbnailUrl?: string;
}

export function VideoCard({ youtubeId, title, category, thumbnailUrl }: VideoCardProps) {
  // Debug log to see what thumbnail URL we're getting
  console.log('VideoCard props:', { youtubeId, title, thumbnailUrl });
  
  // Clean and extract proper YouTube video ID
  const getCleanVideoId = (id: string): string => {
    if (!id) return '';
    
    // If it's already a clean video ID (11 characters, alphanumeric + underscore + dash)
    if (/^[a-zA-Z0-9_-]{11}$/.test(id)) {
      return id;
    }
    
    // Extract from various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
      /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
    ];
    
    for (const pattern of patterns) {
      const match = id.match(pattern);
      if (match && match[1]) return match[1];
    }
    
    return id; // Return as-is if no pattern matches
  };

  // Get the best available thumbnail URL
  const getBestThumbnailUrl = (): string => {
    // Strategy 1: Use the optimized thumbnail URL from server-side processing if available
    if (thumbnailUrl && !thumbnailUrl.includes('undefined')) {
      return thumbnailUrl;
    }
    
    // Strategy 2: Fallback to constructing our own URL
    const videoId = getCleanVideoId(youtubeId);
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  };

  // Create fallback URLs for error handling
  const getFallbackThumbnailUrls = (videoId: string): string[] => {
    return [
      `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,    // Standard def (640x480)
      `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,    // Medium quality (320x180)
      `https://img.youtube.com/vi/${videoId}/default.jpg`,      // Default (120x90) - always exists
      `https://i3.ytimg.com/vi/${videoId}/hqdefault.jpg`,       // Alternative CDN
      // SVG placeholder as final fallback
      `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgwIiBoZWlnaHQ9IjM2MCIgdmlld0JveD0iMCAwIDQ4MCAzNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0ODAiIGhlaWdodD0iMzYwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjI0MCIgY3k9IjE4MCIgcj0iNDAiIGZpbGw9IiM4QjVDOUUiLz4KPGF0aCBkPSJNMjMwIDE2NUwyNTUgMTgwTDIzMCAxOTVWMTY1WiIgZmlsbD0id2hpdGUiLz4KPHRleHQgeD0iMjQwIiB5PSIyNjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NzcyOEEiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0Ij5WaWRlbyBUaHVtYm5haWw8L3RleHQ+Cjwvc3ZnPgo=`
    ];
  };

  // Handle thumbnail load errors with intelligent fallback
  const handleThumbnailError = (e: any) => {
    const img = e.currentTarget;
    const videoId = getCleanVideoId(youtubeId);
    const fallbacks = getFallbackThumbnailUrls(videoId);
    
    // Find current URL in fallback list and try next one
    const currentIndex = fallbacks.findIndex(url => img.src.includes(url.substring(0, 50)));
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < fallbacks.length) {
      console.log(`Thumbnail failed for "${title}". Trying fallback ${nextIndex + 1}/${fallbacks.length}`);
      img.src = fallbacks[nextIndex];
    } else {
      console.log(`All thumbnail strategies failed for "${title}". Using final placeholder.`);
      img.src = fallbacks[fallbacks.length - 1]; // Final SVG placeholder
    }
  };

  const initialThumbnailUrl = getBestThumbnailUrl();

  // Diagnostic log to help debug data issues
  console.log(
    `[VideoCard Debug]\n    - Title: "${title}"\n    - Received youtubeId: "${youtubeId}"\n    - Received thumbnailUrl: "${thumbnailUrl}"\n    - Attempting to load initial thumbnail: ${initialThumbnailUrl}`
  );

  // Modal creation and management functions
  const createModal = () => {
    const videoId = getCleanVideoId(youtubeId);
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm';
    modal.onclick = closeModal;
    
    modal.innerHTML = `
      <div class="relative mx-4 my-8" onclick="event.stopPropagation()">
        <!-- Close button -->
        <button id="close-video-modal" class="absolute -top-12 right-0 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:text-white transition-all duration-200 z-10" aria-label="Close video">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <!-- Video container with proper aspect ratio -->
        <div class="relative bg-black rounded-xl overflow-hidden shadow-2xl" style="width: min(90vw, 1200px); aspect-ratio: 16/9;">
          <iframe
            src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&color=white"
            title="${title.replace(/"/g, '&quot;')}"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            class="w-full h-full"
          ></iframe>
          
          <!-- Title overlay positioned absolutely over the video -->
          <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pointer-events-none">
            <h3 class="text-white text-base font-medium leading-tight truncate">${title}</h3>
          </div>
        </div>
      </div>
    `;
    
    // Add close button event listener
    modal.querySelector('#close-video-modal')?.addEventListener('click', closeModal);
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  };

  const closeModal = () => {
    const modal = document.querySelector('.fixed.inset-0.z-50');
    if (modal) {
      document.body.removeChild(modal);
      document.body.style.overflow = ''; // Restore scrolling
    }
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md transition-all hover:shadow-lg border border-soi-purple-100 hover:border-soi-purple-300">
      <div className="relative aspect-video" style={{ minHeight: "200px" }}>
        {/* Thumbnail with play button */}
        <div 
          className="cursor-pointer relative w-full h-full overflow-hidden"
          onClick={createModal}
        >
          <img 
            src={initialThumbnailUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
            loading="lazy"
            onError={handleThumbnailError}
          />
          <div className="absolute inset-0 flex items-center justify-center group">
            <div className="bg-black/20 absolute inset-0 group-hover:bg-black/40 transition-colors duration-300"></div>
            <div className="w-16 h-16 bg-soi-navy-500 rounded-full flex items-center justify-center z-10 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Play className="w-6 h-6 text-white fill-white ml-1" />
            </div>
          </div>
          
          {/* Category label */}
          {category && (
            <div className="absolute top-2 right-2 bg-soi-navy-500 text-white text-xs font-medium px-2 py-1 rounded-md shadow-md">
              {category}
            </div>
          )}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-soi-navy-800 text-lg line-clamp-2">{title}</h3>
      </div>
    </div>
  );
} 