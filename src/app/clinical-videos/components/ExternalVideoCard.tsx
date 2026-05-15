'use client';

import { Play, ExternalLink } from 'lucide-react';

interface ExternalVideoCardProps {
  url: string;
  title: string;
  doctor?: string;
  category?: string;
  thumbnailUrl?: string;
}

export function ExternalVideoCard({
  url,
  title,
  doctor,
  category,
  thumbnailUrl,
}: ExternalVideoCardProps) {
  const handleOpen = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md transition-all hover:shadow-lg border border-soi-purple-100 hover:border-soi-purple-300">
      <div className="relative aspect-video" style={{ minHeight: '200px' }}>
        <div
          className="cursor-pointer relative w-full h-full overflow-hidden"
          onClick={handleOpen}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleOpen();
            }
          }}
          aria-label={`Open ${title} in a new tab`}
        >
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-soi-navy-600 via-soi-navy-700 to-soi-purple-700" />
          )}

          <div className="absolute inset-0 flex items-center justify-center group">
            <div className="bg-black/20 absolute inset-0 group-hover:bg-black/40 transition-colors duration-300" />
            <div className="w-16 h-16 bg-soi-navy-500 rounded-full flex items-center justify-center z-10 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Play className="w-6 h-6 text-white fill-white ml-1" />
            </div>
          </div>

          {category && (
            <div className="absolute top-2 right-2 bg-soi-navy-500 text-white text-xs font-medium px-2 py-1 rounded-md shadow-md">
              {category}
            </div>
          )}

          <div className="absolute bottom-2 left-2 bg-white/90 text-soi-navy-700 text-[10px] font-medium px-2 py-1 rounded-md shadow-md flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            Opens in new tab
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-soi-navy-800 text-lg line-clamp-2">{title}</h3>
        {doctor && (
          <p className="text-sm text-soi-navy-500 mt-1">{doctor}</p>
        )}
      </div>
    </div>
  );
}
