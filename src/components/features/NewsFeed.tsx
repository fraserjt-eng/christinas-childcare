'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollFadeIn, ScrollFadeInStagger } from '@/components/features/ScrollFadeIn';
import { NewsUpdate, getNewsTypeLabel, extractYouTubeId } from '@/types/news';
import { getNewsUpdates, seedSampleNews } from '@/lib/news-storage';
import {
  Play,
  FileText,
  Image as ImageIcon,
  Megaphone,
  Calendar,
  User,
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

function NewsCard({ item }: { item: NewsUpdate }) {
  const Icon = typeIcons[item.type];
  const youtubeId = item.video_url ? extractYouTubeId(item.video_url) : null;

  return (
    <Card className="bg-white border-0 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Video embed */}
      {item.type === 'video' && youtubeId && (
        <div className="aspect-video bg-slate-900 relative">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1`}
            title={item.title}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      )}

      {/* Image */}
      {item.type === 'photo' && item.image_url && (
        <div className="aspect-video relative bg-slate-100">
          <Image
            src={item.image_url}
            alt={item.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <Badge
            variant="secondary"
            className={`text-xs ${
              item.type === 'video'
                ? 'bg-red-100 text-red-800'
                : item.type === 'article'
                ? 'bg-blue-100 text-blue-800'
                : item.type === 'photo'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            <Icon className="w-3 h-3 mr-1" />
            {getNewsTypeLabel(item.type)}
          </Badge>
          {item.is_featured && (
            <Badge className="bg-[#c44536] text-white text-xs">Featured</Badge>
          )}
        </div>

        <h3 className="text-lg font-medium text-[#1a1a1a] mb-2 line-clamp-2">
          {item.title}
        </h3>

        <p className="text-[#6b6b6b] text-sm leading-relaxed mb-4 line-clamp-3">
          {item.content}
        </p>

        <div className="flex items-center gap-4 text-xs text-[#6b6b6b]">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(item.published_at)}
          </span>
          {item.author && (
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {item.author}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function NewsFeed() {
  const [updates, setUpdates] = useState<NewsUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNews() {
      // Seed sample data if none exists
      await seedSampleNews();
      const news = await getNewsUpdates({ is_published: true, limit: 6 });
      setUpdates(news);
      setLoading(false);
    }
    loadNews();
  }, []);

  if (loading) {
    return (
      <section className="bg-[#fafafa] py-24">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-slate-200 rounded w-48 mx-auto mb-4" />
              <div className="h-4 bg-slate-200 rounded w-64 mx-auto" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (updates.length === 0) {
    return null; // Don't render section if no published updates
  }

  return (
    <section className="bg-[#fafafa] py-24">
      <div className="container mx-auto px-6">
        <ScrollFadeIn direction="up" duration={600}>
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-[#6b6b6b] mb-4">
              Stay Connected
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-[#1a1a1a] mb-4">
              News & Updates
            </h2>
            <p className="text-lg text-[#6b6b6b] max-w-2xl mx-auto font-light">
              The latest happenings at Christina&apos;s Child Care Center
            </p>
          </div>
        </ScrollFadeIn>

        <ScrollFadeInStagger
          staggerDelay={150}
          baseDelay={100}
          duration={700}
          direction="up"
          distance={40}
          className="max-w-4xl mx-auto space-y-6"
        >
          {updates.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </ScrollFadeInStagger>
      </div>
    </section>
  );
}
