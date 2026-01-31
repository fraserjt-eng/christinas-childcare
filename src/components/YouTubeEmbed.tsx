'use client';

import { useState } from 'react';
import { Play, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface YouTubeEmbedProps {
  /** YouTube video ID (e.g., "dQw4w9WgXcQ") */
  videoId: string;
  /** Video title for accessibility */
  title: string;
  /** Optional poster image URL (defaults to YouTube thumbnail) */
  poster?: string;
  /** Enable lazy loading with click-to-play thumbnail */
  lazyLoad?: boolean;
  /** Additional class name */
  className?: string;
  /** Aspect ratio class */
  aspectRatio?: 'video' | '4/3' | '1/1';
  /** Show player controls */
  controls?: boolean;
  /** Autoplay when loaded (requires muted) */
  autoplay?: boolean;
  /** Start time in seconds */
  startTime?: number;
}

/**
 * YouTubeEmbed - Responsive YouTube video embed component
 *
 * Features:
 * - Lazy loading with thumbnail preview
 * - Privacy-enhanced embed (youtube-nocookie.com)
 * - Responsive aspect ratio
 * - Accessibility attributes
 * - Error state handling
 */
export function YouTubeEmbed({
  videoId,
  title,
  poster,
  lazyLoad = true,
  className = '',
  aspectRatio = 'video',
  controls = true,
  autoplay = false,
  startTime,
}: YouTubeEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(!lazyLoad);

  // Validate video ID format
  const isValidId = /^[a-zA-Z0-9_-]{11}$/.test(videoId);

  if (!isValidId) {
    return (
      <div
        className={cn(
          'relative bg-slate-100 rounded-lg flex items-center justify-center',
          aspectRatio === 'video' && 'aspect-video',
          aspectRatio === '4/3' && 'aspect-[4/3]',
          aspectRatio === '1/1' && 'aspect-square',
          className
        )}
      >
        <div className="text-center p-4">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Video coming soon</p>
        </div>
      </div>
    );
  }

  // Build embed URL with parameters
  const params = new URLSearchParams({
    rel: '0', // Don't show related videos
    modestbranding: '1', // Minimal YouTube branding
    ...(controls ? {} : { controls: '0' }),
    ...(autoplay ? { autoplay: '1', mute: '1' } : {}),
    ...(startTime ? { start: String(startTime) } : {}),
  });

  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?${params}`;
  const thumbnailUrl = poster || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const thumbnailFallback = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  const aspectRatioClass = {
    video: 'aspect-video',
    '4/3': 'aspect-[4/3]',
    '1/1': 'aspect-square',
  }[aspectRatio];

  // Lazy load: show thumbnail with play button
  if (!isLoaded) {
    return (
      <button
        onClick={() => setIsLoaded(true)}
        className={cn(
          'relative w-full rounded-lg overflow-hidden group cursor-pointer bg-slate-900',
          aspectRatioClass,
          className
        )}
        aria-label={`Play video: ${title}`}
      >
        {/* Thumbnail */}
        <picture>
          <source srcSet={thumbnailUrl} type="image/jpeg" />
          <img
            src={thumbnailFallback}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        </picture>

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Play className="w-8 h-8 md:w-10 md:h-10 text-white ml-1" fill="white" />
          </div>
        </div>

        {/* Video title */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <p className="text-white text-sm font-medium truncate">{title}</p>
        </div>
      </button>
    );
  }

  // Loaded: show iframe
  return (
    <div
      className={cn(
        'relative w-full rounded-lg overflow-hidden bg-slate-900',
        aspectRatioClass,
        className
      )}
    >
      <iframe
        src={embedUrl}
        title={title}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}

/**
 * YouTubePlaylist - Embed a YouTube playlist
 */
export function YouTubePlaylist({
  playlistId,
  title,
  className = '',
}: {
  playlistId: string;
  title: string;
  className?: string;
}) {
  const embedUrl = `https://www.youtube-nocookie.com/embed/videoseries?list=${playlistId}&rel=0`;

  return (
    <div className={cn('relative w-full aspect-video rounded-lg overflow-hidden bg-slate-900', className)}>
      <iframe
        src={embedUrl}
        title={title}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}

/**
 * VideoPlaceholder - Placeholder for videos not yet uploaded
 */
export function VideoPlaceholder({
  title,
  description,
  className = '',
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative w-full aspect-video rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center',
        className
      )}
    >
      <div className="text-center p-6">
        <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-4">
          <Play className="w-8 h-8 text-slate-400" />
        </div>
        <h4 className="font-medium text-slate-700 mb-1">{title}</h4>
        {description && (
          <p className="text-sm text-slate-500">{description}</p>
        )}
      </div>
    </div>
  );
}
