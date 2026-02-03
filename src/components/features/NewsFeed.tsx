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
  // Use maxresdefault for high quality, falls back gracefully
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

interface NewsSlideProps {
  item: NewsUpdate;
  isActive: boolean;
  onClick: () => void;
}

function NewsSlide({ item, isActive, onClick }: NewsSlideProps) {
  const Icon = typeIcons[item.type];
  const youtubeId = item.video_url ? extractYouTubeId(item.video_url) : null;

  // Determine the thumbnail/background image
  let backgroundImage = '/images/community.png'; // fallback
  if (item.type === 'video' && youtubeId) {
    backgroundImage = getYouTubeThumbnail(youtubeId);
  } else if (item.image_url) {
    backgroundImage = item.image_url;
  }

  return (
    <div
      className={`absolute inset-0 transition-all duration-700 ease-in-out cursor-pointer ${
        isActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'
      }`}
      onClick={onClick}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={backgroundImage}
          alt={item.title}
          fill
          className="object-cover"
          priority={isActive}
        />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
      </div>

      {/* Play button overlay for videos */}
      {item.type === 'video' && youtubeId && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-red-600 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
            <Play className="w-10 h-10 md:w-12 md:h-12 text-white ml-1" fill="white" />
          </div>
        </div>
      )}

      {/* Content overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
        <div className="max-w-3xl">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-4">
            <Badge
              className={`text-xs ${
                item.type === 'video'
                  ? 'bg-red-600 text-white'
                  : item.type === 'article'
                  ? 'bg-blue-600 text-white'
                  : item.type === 'photo'
                  ? 'bg-green-600 text-white'
                  : 'bg-yellow-500 text-black'
              }`}
            >
              <Icon className="w-3 h-3 mr-1" />
              {getNewsTypeLabel(item.type)}
            </Badge>
            {item.is_featured && (
              <Badge className="bg-white/20 text-white text-xs backdrop-blur-sm">
                Featured
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3 className="text-2xl md:text-4xl font-light text-white mb-3 line-clamp-2">
            {item.title}
          </h3>

          {/* Description */}
          <p className="text-white/80 text-sm md:text-base leading-relaxed mb-4 line-clamp-2 max-w-2xl">
            {item.content}
          </p>

          {/* Meta info */}
          <div className="flex items-center gap-4 text-xs md:text-sm text-white/60">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 md:w-4 md:h-4" />
              {formatDate(item.published_at)}
            </span>
            {item.author && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3 md:w-4 md:h-4" />
                {item.author}
              </span>
            )}
          </div>

          {/* Click hint */}
          <p className="text-white/40 text-xs mt-4">
            {item.type === 'video' ? 'Click to watch' : 'Click to read more'}
          </p>
        </div>
      </div>
    </div>
  );
}

export function NewsFeed() {
  const [updates, setUpdates] = useState<NewsUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

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
      setCurrentIndex((prev) => (prev + 1) % updates.length);
    }, 6000); // 6 seconds per slide

    return () => clearInterval(interval);
  }, [updates.length, isPaused]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + updates.length) % updates.length);
  }, [updates.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % updates.length);
  }, [updates.length]);

  const handleSlideClick = useCallback((item: NewsUpdate) => {
    const youtubeId = item.video_url ? extractYouTubeId(item.video_url) : null;

    if (item.type === 'video' && youtubeId) {
      // Open YouTube video in new tab
      window.open(`https://www.youtube.com/watch?v=${youtubeId}`, '_blank');
    } else if (item.image_url) {
      // Open image in new tab
      window.open(item.image_url, '_blank');
    }
    // For articles/announcements, could open a modal in the future
  }, []);

  if (loading) {
    return (
      <section className="bg-[#1a1a1a] py-0">
        <div className="relative h-[400px] md:h-[500px] flex items-center justify-center">
          <div className="animate-pulse text-white/50">Loading updates...</div>
        </div>
      </section>
    );
  }

  if (updates.length === 0) {
    return null;
  }

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
        {/* Slides */}
        {updates.map((item, index) => (
          <NewsSlide
            key={item.id}
            item={item}
            isActive={index === currentIndex}
            onClick={() => handleSlideClick(item)}
          />
        ))}

        {/* Navigation arrows */}
        {updates.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full h-12 w-12 backdrop-blur-sm"
              onClick={goToPrev}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full h-12 w-12 backdrop-blur-sm"
              onClick={goToNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}

        {/* Dot indicators */}
        {updates.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {updates.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
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

        {/* Progress bar */}
        {updates.length > 1 && !isPaused && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div
              className="h-full bg-white/60 transition-all"
              style={{
                animation: 'progress 6s linear infinite',
                width: '100%',
              }}
            />
          </div>
        )}
      </div>

      {/* CSS for progress animation */}
      <style jsx>{`
        @keyframes progress {
          from {
            transform: scaleX(0);
            transform-origin: left;
          }
          to {
            transform: scaleX(1);
            transform-origin: left;
          }
        }
      `}</style>
    </section>
  );
}
