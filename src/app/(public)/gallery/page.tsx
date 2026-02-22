'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { ScrollFadeIn } from '@/components/features/ScrollFadeIn';
import { Button } from '@/components/ui/button';

interface GalleryItem {
  id: string;
  name: string;
  description: string;
  gradient: string;
  section: string;
}

const galleryItems: GalleryItem[] = [
  // Our Classrooms
  {
    id: 'infant',
    name: 'Little Stars Classroom',
    description:
      'A warm, cozy space designed for our youngest learners. Soft lighting, sensory stations, and safe sleep areas create the perfect environment for infants to explore and rest.',
    gradient: 'from-[#FF7043] to-[#FF8A65]',
    section: 'Our Classrooms',
  },
  {
    id: 'toddler',
    name: 'Busy Bees Classroom',
    description:
      'Bursting with color and activity. Low shelves filled with age-appropriate toys, a reading nook, and open floor space let toddlers move, discover, and build independence.',
    gradient: 'from-[#FFD54F] to-[#FFE082]',
    section: 'Our Classrooms',
  },
  {
    id: 'preschool',
    name: 'Bright Butterflies Classroom',
    description:
      'Learning centers for literacy, math, science, and art fill this vibrant room. A dedicated circle time area and creative workstations prepare children for kindergarten.',
    gradient: 'from-[#4CAF50] to-[#66BB6A]',
    section: 'Our Classrooms',
  },
  {
    id: 'school-age',
    name: 'Adventure Club',
    description:
      'A dynamic space for school-age kids with homework stations, STEM project tables, a game area, and plenty of room for group activities and creative play.',
    gradient: 'from-[#2196F3] to-[#42A5F5]',
    section: 'Our Classrooms',
  },
  // Outdoor Play
  {
    id: 'playground',
    name: 'Playground Area',
    description:
      'Our fenced, age-appropriate playground features climbing structures, slides, a sandbox, tricycle paths, and shaded areas. Children get outdoor play time twice daily, rain or shine.',
    gradient: 'from-[#8BC34A] to-[#AED581]',
    section: 'Outdoor Play',
  },
  {
    id: 'garden',
    name: 'Garden & Nature Area',
    description:
      'Children plant seeds, watch them grow, and learn about nature firsthand. Our garden beds, butterfly station, and outdoor sensory table bring science to life outside the classroom.',
    gradient: 'from-[#009688] to-[#4DB6AC]',
    section: 'Outdoor Play',
  },
  // Our Facility
  {
    id: 'entrance',
    name: 'Welcoming Entrance',
    description:
      'Bright murals and a secure check-in station greet families each morning. Our front desk staff know every child and family by name, setting the tone for the day.',
    gradient: 'from-[#C62828] to-[#E53935]',
    section: 'Our Facility',
  },
  {
    id: 'kitchen',
    name: 'Kitchen & Dining Area',
    description:
      'Nutritious meals and snacks are prepared fresh daily in our licensed kitchen. The family-style dining area teaches children table manners and social skills while they eat together.',
    gradient: 'from-[#FF9800] to-[#FFB74D]',
    section: 'Our Facility',
  },
  {
    id: 'arts',
    name: 'Creative Arts Space',
    description:
      'Easels, clay stations, music instruments, and a mini stage fill our dedicated arts room. This is where imagination runs free and every child gets to be an artist.',
    gradient: 'from-[#AB47BC] to-[#CE93D8]',
    section: 'Our Facility',
  },
];

const sections = ['Our Classrooms', 'Outdoor Play', 'Our Facility'];

export default function GalleryPage() {
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
              Our Gallery
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Take a peek inside Christina&apos;s Child Care Center. Each space
              is thoughtfully designed to inspire learning, creativity, and joy.
            </p>
          </div>
        </ScrollFadeIn>

        {/* Gallery Sections */}
        {sections.map((section, sectionIndex) => {
          const sectionItems = galleryItems.filter(
            (item) => item.section === section
          );
          return (
            <div key={section} className="mb-14">
              <ScrollFadeIn
                direction="up"
                duration={600}
                delay={sectionIndex * 100}
              >
                <h2 className="text-2xl md:text-3xl font-bold mb-6 border-b-2 border-christina-red/20 pb-2">
                  {section}
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
                            {item.name}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.description}
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
              Want to see it in person?
            </h2>
            <p className="text-muted-foreground mb-6">
              Schedule a tour to walk through our classrooms, meet our teachers,
              and see why families love Christina&apos;s Child Care Center.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-christina-red hover:bg-christina-red/90"
            >
              <Link href="/schedule-tour">Schedule a Tour</Link>
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
          aria-label={`Gallery: ${galleryItems[selectedIndex].name}`}
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
              aria-label="Close gallery"
            >
              <X className="h-8 w-8" />
            </button>

            {/* Navigation Arrows */}
            <button
              onClick={goPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 md:-translate-x-16 text-white/70 hover:text-white transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-10 w-10" />
            </button>
            <button
              onClick={goNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 md:translate-x-16 text-white/70 hover:text-white transition-colors"
              aria-label="Next image"
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
                  {galleryItems[selectedIndex].section}
                </span>
                <h3 className="text-xl font-bold mt-1 mb-2">
                  {galleryItems[selectedIndex].name}
                </h3>
                <p className="text-muted-foreground">
                  {galleryItems[selectedIndex].description}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-4">
                  {selectedIndex + 1} of {galleryItems.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
