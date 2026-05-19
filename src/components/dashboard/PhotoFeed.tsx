'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageOff, Loader2, Camera } from 'lucide-react';

interface Photo {
  id: string;
  photo_url: string;
  caption: string;
  created_at: string;
  classroom_name: string;
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return 'Yesterday';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function PhotoFeed() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      // Scoped server-side to THIS family's children only (includes the
      // photos staff attach on the Daily Report).
      const r = await fetch('/api/parent/photos', { cache: 'no-store' });
      if (!r.ok) {
        setFailed(true);
        setPhotos([]);
        return;
      }
      const d = await r.json();
      setPhotos(d.photos || []);
    } catch {
      setFailed(true);
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-christina-red" />
          <h2 className="text-lg font-semibold">Your child&apos;s photos</h2>
        </div>
        <Badge variant="secondary" className="shrink-0">
          {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
        </Badge>
      </div>

      {photos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
          <ImageOff className="h-10 w-10" />
          <p className="text-sm text-center">
            {failed
              ? 'Could not load photos. Pull to refresh or try again shortly.'
              : 'No photos yet. Photos your child’s teachers add show up here.'}
          </p>
        </div>
      )}

      {photos.length > 0 && (
        <div className="space-y-4">
          {photos.map((photo) => (
            <Card key={photo.id} className="overflow-hidden">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.photo_url}
                  alt={photo.caption || 'Photo from your child’s day'}
                  className="w-full object-cover max-h-80"
                />
              </div>
              <CardContent className="p-4 space-y-2">
                {photo.caption && (
                  <p className="text-sm text-foreground leading-relaxed">
                    {photo.caption}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  {photo.classroom_name ? (
                    <p className="text-xs text-muted-foreground">
                      {photo.classroom_name}
                    </p>
                  ) : (
                    <span />
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeTime(photo.created_at)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
