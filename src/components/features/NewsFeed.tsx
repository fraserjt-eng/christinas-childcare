'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollFadeIn } from '@/components/features/ScrollFadeIn';
import { NewsUpdate, getNewsTypeLabel, extractYouTubeId } from '@/types/news';
import { getNewsUpdates, seedSampleNews } from '@/lib/news-storage';
import {
  Play,
  FileText,
  Image as ImageIcon,
  Megaphone,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const typeIcons = {
  video: Play,
  article: FileText,
  photo: ImageIcon,
  announcement: Megaphone,
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

function getBackgroundImage(item: NewsUpdate): string | null {
  const youtubeId = item.video_url ? extractYouTubeId(item.video_url) : null;

  if (item.type === 'video' && youtubeId) {
    return getYouTubeThumbnail(youtubeId);
  } else if (item.image_url) {
    return item.image_url;
  }
  // Return null for items without images - will use gradient background
  return null;
}

// Gradient backgrounds for items without images
const gradientBackgrounds = [
  'bg-gradient-to-br from-red-800 via-red-900 to-slate-900',
  'bg-gradient-to-br from-blue-800 via-blue-900 to-slate-900',
  'bg-gradient-to-br from-green-800 via-green-900 to-slate-900',
  'bg-gradient-to-br from-purple-800 via-purple-900 to-slate-900',
  'bg-gradient-to-br from-amber-700 via-orange-800 to-slate-900',
];

export function NewsFeed() {
  const [updates, setUpdates] = useState<NewsUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    async function loadNews() {
      await seedSampleNews();
      const news = await getNewsUpdates({ is_published: true, limit: 10 });
      setUpdates(news);
      setLoading(false);
    }
    loadNews();
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    if (updates.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      goToNext();
    }, 6000);

    return () => clearInterval(interval);
  }, [updates.length, isPaused, currentIndex]);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 700);
  }, [currentIndex, isTransitioning]);

  const goToPrev = useCallback(() => {
    if (isTransitioning || updates.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + updates.length) % updates.length);
    setTimeout(() => setIsTransitioning(false), 700);
  }, [updates.length, isTransitioning]);

  const goToNext = useCallback(() => {
    if (isTransitioning || updates.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % updates.length);
    setTimeout(() => setIsTransitioning(false), 700);
  }, [updates.length, isTransitioning]);

  const handleSlideClick = useCallback((item: NewsUpdate) => {
    // For videos, try to open YouTube
    if (item.type === 'video' && item.video_url) {
      const youtubeId = extractYouTubeId(item.video_url);
      if (youtubeId) {
        window.open(`https://www.youtube.com/watch?v=${youtubeId}`, '_blank');
      } else {
        // If it's a full URL that didn't parse, try opening it directly
        window.open(item.video_url, '_blank');
      }
    } else if (item.image_url) {
      // For photos, open the image
      window.open(item.image_url, '_blank');
    }
    // For articles/announcements without links, do nothing (could add modal later)
  }, []);

  if (loading) {
    return (
      <section className="bg-[#1a1a1a]">
        <div className="relative h-[400px] md:h-[500px] flex items-center justify-center">
          <div className="animate-pulse text-white/50">Loading updates...</div>
        </div>
      </section>
    );
  }

  if (updates.length === 0) {
    return null;
  }

  const currentItem = updates[currentIndex];
  const Icon = typeIcons[currentItem.type];
  const youtubeId = currentItem.video_url ? extractYouTubeId(currentItem.video_url) : null;
  const backgroundImage = getBackgroundImage(currentItem);
  const gradientBg = gradientBackgrounds[currentIndex % gradientBackgrounds.length];

  return (
    <section className="bg-[#1a1a1a]">
      {/* Section header */}
      <div className="bg-[#fafafa] py-12">
        <div className="container mx-auto px-6">
          <ScrollFadeIn direction="up" duration={600}>
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-[#6b6b6b] mb-4">
                Stay Connected
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-[#1a1a1a]">
                News & Updates
              </h2>
            </div>
          </ScrollFadeIn>
        </div>
      </div>

      {/* Carousel */}
      <div
        className="relative h-[400px] md:h-[500px] lg:h-[550px] overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Background - Image or Gradient */}
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${!backgroundImage ? gradientBg : ''}`}
          key={currentItem.id}
        >
          {backgroundImage ? (
            <>
              <Image
                src={backgroundImage}
                alt={currentItem.title}
                fill
                className="object-cover"
                priority
                unoptimized={backgroundImage.includes('youtube.com')}
              />
              {/* Gradient overlay for images */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
            </>
          ) : (
            /* Pattern overlay for gradient backgrounds */
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
            }} />
          )}
        </div>

        {/* Play button for videos */}
        {currentItem.type === 'video' && youtubeId && (
          <button
            onClick={() => handleSlideClick(currentItem)}
            className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-red-600 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform hover:bg-red-700">
              <Play className="w-10 h-10 md:w-12 md:h-12 text-white ml-1" fill="white" />
            </div>
          </button>
        )}

        {/* Content */}
        <div
          className="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-10 cursor-pointer"
          onClick={() => handleSlideClick(currentItem)}
        >
          <div className="max-w-3xl transition-all duration-500">
            {/* Badges */}
            <div className="flex items-center gap-2 mb-4">
              <Badge
                className={`text-xs ${
                  currentItem.type === 'video'
                    ? 'bg-red-600 text-white'
                    : currentItem.type === 'article'
                    ? 'bg-blue-600 text-white'
                    : currentItem.type === 'photo'
                    ? 'bg-green-600 text-white'
                    : 'bg-yellow-500 text-black'
                }`}
              >
                <Icon className="w-3 h-3 mr-1" />
                {getNewsTypeLabel(currentItem.type)}
              </Badge>
              {currentItem.is_featured && (
                <Badge className="bg-white/20 text-white text-xs backdrop-blur-sm">
                  Featured
                </Badge>
              )}
            </div>

            {/* Title */}
            <h3 className="text-2xl md:text-4xl font-light text-white mb-3 line-clamp-2">
              {currentItem.title}
            </h3>

            {/* Description */}
            <p className="text-white/80 text-sm md:text-base leading-relaxed mb-4 line-clamp-2 max-w-2xl">
              {currentItem.content}
            </p>

            {/* Meta */}
            <div className="flex items-center gap-4 text-xs md:text-sm text-white/60">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                {formatDate(currentItem.published_at)}
              </span>
              {currentItem.author && (
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3 md:w-4 md:h-4" />
                  {currentItem.author}
                </span>
              )}
            </div>

            <p className="text-white/40 text-xs mt-4">
              {currentItem.type === 'video' ? 'Click to watch' : 'Click to read more'}
            </p>
          </div>
        </div>

        {/* Navigation arrows */}
        {updates.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full h-12 w-12 z-20 border border-white/20"
              onClick={(e) => {
                e.stopPropagation();
                goToPrev();
              }}
              disabled={isTransitioning}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full h-12 w-12 z-20 border border-white/20"
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              disabled={isTransitioning}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}

        {/* Dot indicators */}
        {updates.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            {updates.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  goToSlide(index);
                }}
                disabled={isTransitioning}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? 'w-8 h-2 bg-white'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Slide counter */}
        <div className="absolute top-4 right-4 bg-black/50 text-white text-sm px-3 py-1 rounded-full z-20">
          {currentIndex + 1} / {updates.length}
        </div>
      </div>
    </section>
  );
}
