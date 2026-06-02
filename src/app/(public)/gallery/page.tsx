'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { ScrollFadeIn } from '@/components/features/ScrollFadeIn';
import { Button } from '@/components/ui/button';
import { useT } from '@/contexts/LanguageContext';
import type { TranslationKey } from '@/lib/i18n/en';

interface GalleryItem {
  id: string;
  nameKey: TranslationKey;
  descKey: TranslationKey;
  gradient: string;
  sectionKey: TranslationKey;
}

const galleryItems: GalleryItem[] = [
  // Our Classrooms
  {
    id: 'infant',
    nameKey: 'gallery.infantName',
    descKey: 'gallery.infantDesc',
    gradient: 'from-[#FF7043] to-[#FF8A65]',
    sectionKey: 'gallery.sectionClassrooms',
  },
  {
    id: 'toddler',
    nameKey: 'gallery.toddlerName',
    descKey: 'gallery.toddlerDesc',
    gradient: 'from-[#FFD54F] to-[#FFE082]',
    sectionKey: 'gallery.sectionClassrooms',
  },
  {
    id: 'preschool',
    nameKey: 'gallery.preschoolName',
    descKey: 'gallery.preschoolDesc',
    gradient: 'from-[#4CAF50] to-[#66BB6A]',
    sectionKey: 'gallery.sectionClassrooms',
  },
  {
    id: 'school-age',
    nameKey: 'gallery.schoolAgeName',
    descKey: 'gallery.schoolAgeDesc',
    gradient: 'from-[#2196F3] to-[#42A5F5]',
    sectionKey: 'gallery.sectionClassrooms',
  },
  // Outdoor Play
  {
    id: 'playground',
    nameKey: 'gallery.playgroundName',
    descKey: 'gallery.playgroundDesc',
    gradient: 'from-[#8BC34A] to-[#AED581]',
    sectionKey: 'gallery.sectionOutdoor',
  },
  {
    id: 'garden',
    nameKey: 'gallery.gardenName',
    descKey: 'gallery.gardenDesc',
    gradient: 'from-[#009688] to-[#4DB6AC]',
    sectionKey: 'gallery.sectionOutdoor',
  },
  // Our Facility
  {
    id: 'entrance',
    nameKey: 'gallery.entranceName',
    descKey: 'gallery.entranceDesc',
    gradient: 'from-[#C62828] to-[#E53935]',
    sectionKey: 'gallery.sectionFacility',
  },
  {
    id: 'kitchen',
    nameKey: 'gallery.kitchenName',
    descKey: 'gallery.kitchenDesc',
    gradient: 'from-[#FF9800] to-[#FFB74D]',
    sectionKey: 'gallery.sectionFacility',
  },
  {
    id: 'arts',
    nameKey: 'gallery.artsName',
    descKey: 'gallery.artsDesc',
    gradient: 'from-[#AB47BC] to-[#CE93D8]',
    sectionKey: 'gallery.sectionFacility',
  },
];

const sectionKeys: TranslationKey[] = [
  'gallery.sectionClassrooms',
  'gallery.sectionOutdoor',
  'gallery.sectionFacility',
];

export default function GalleryPage() {
  const t = useT();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);

  const goNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % galleryItems.length);
  };

  const goPrev = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(
      (selectedIndex - 1 + galleryItems.length) % galleryItems.length
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') goNext();
    if (e.key === 'ArrowLeft') goPrev();
  };

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <ScrollFadeIn direction="up" duration={600}>
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-playful mb-4 text-christina-red">
              {t('gallery.heroTitle')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('gallery.heroSubtitle')}
            </p>
          </div>
        </ScrollFadeIn>

        {/* Gallery Sections */}
        {sectionKeys.map((section, sectionIndex) => {
          const sectionItems = galleryItems.filter(
            (item) => item.sectionKey === section
          );
          return (
            <div key={section} className="mb-14">
              <ScrollFadeIn
                direction="up"
                duration={600}
                delay={sectionIndex * 100}
              >
                <h2 className="text-2xl md:text-3xl font-bold mb-6 border-b-2 border-christina-red/20 pb-2">
                  {t(section)}
                </h2>
              </ScrollFadeIn>

              <div
                className={`grid gap-6 ${
                  sectionItems.length === 2
                    ? 'grid-cols-1 md:grid-cols-2'
                    : sectionItems.length === 3
                      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                }`}
              >
                {sectionItems.map((item, itemIndex) => {
                  const globalIndex = galleryItems.findIndex(
                    (g) => g.id === item.id
                  );
                  return (
                    <ScrollFadeIn
                      key={item.id}
                      direction="up"
                      duration={600}
                      delay={itemIndex * 120}
                    >
                      <button
                        onClick={() => openLightbox(globalIndex)}
                        className="group relative w-full rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 focus:outline-none focus:ring-2 focus:ring-christina-red focus:ring-offset-2 text-left"
                      >
                        {/* Gradient Background */}
                        <div
                          className={`aspect-[4/3] bg-gradient-to-br ${item.gradient} relative`}
                        >
                          {/* Camera Icon Overlay */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 group-hover:bg-white/30 transition-colors duration-300">
                              <Camera className="h-8 w-8 text-white" />
                            </div>
                          </div>
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                        </div>

                        {/* Card Info */}
                        <div className="p-4 bg-white">
                          <h3 className="font-bold text-base mb-1">
                            {t(item.nameKey)}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {t(item.descKey)}
                          </p>
                        </div>
                      </button>
                    </ScrollFadeIn>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* CTA Section */}
        <ScrollFadeIn direction="up" duration={600} delay={200}>
          <div className="text-center mt-8 p-8 bg-muted/30 rounded-2xl">
            <h2 className="text-2xl font-bold mb-3">
              {t('gallery.ctaTitle')}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t('gallery.ctaText')}
            </p>
            <Button
              asChild
              size="lg"
              className="bg-christina-red hover:bg-christina-red/90"
            >
              <Link href="/schedule-tour">{t('gallery.ctaButton')}</Link>
            </Button>
          </div>
        </ScrollFadeIn>
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          aria-label={`${t('gallery.lightboxAriaPrefix')}: ${t(galleryItems[selectedIndex].nameKey)}`}
          tabIndex={0}
        >
          <div
            className="relative max-w-3xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors z-10"
              aria-label={t('gallery.closeAria')}
            >
              <X className="h-8 w-8" />
            </button>

            {/* Navigation Arrows */}
            <button
              onClick={goPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 md:-translate-x-16 text-white/70 hover:text-white transition-colors"
              aria-label={t('gallery.prevAria')}
            >
              <ChevronLeft className="h-10 w-10" />
            </button>
            <button
              onClick={goNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 md:translate-x-16 text-white/70 hover:text-white transition-colors"
              aria-label={t('gallery.nextAria')}
            >
              <ChevronRight className="h-10 w-10" />
            </button>

            {/* Content */}
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              {/* Gradient Preview */}
              <div
                className={`aspect-[16/9] bg-gradient-to-br ${galleryItems[selectedIndex].gradient} relative`}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-6">
                    <Camera className="h-12 w-12 text-white" />
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="bg-white p-6">
                <span className="text-xs font-medium uppercase tracking-wider text-christina-red">
                  {t(galleryItems[selectedIndex].sectionKey)}
                </span>
                <h3 className="text-xl font-bold mt-1 mb-2">
                  {t(galleryItems[selectedIndex].nameKey)}
                </h3>
                <p className="text-muted-foreground">
                  {t(galleryItems[selectedIndex].descKey)}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-4">
                  {t('gallery.counter')
                    .replace('{current}', String(selectedIndex + 1))
                    .replace('{total}', String(galleryItems.length))}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
