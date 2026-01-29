'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronDown, MapPin } from 'lucide-react';

const stages = [
  {
    id: 'infant',
    title: 'Infant Care',
    subtitle: '6 weeks – 16 months',
    description: 'Nurturing care with individualized schedules, sensory exploration, and developmental milestones tracking in a warm, secure environment.',
    color: '#5BA3E6',
    bgColor: 'from-blue-50 to-slate-50',
  },
  {
    id: 'toddler',
    title: 'Toddler Program',
    subtitle: '16 months – 33 months',
    description: 'Active exploration through play-based learning, early language development, and foundational social skills in a stimulating space.',
    color: '#E91E63',
    bgColor: 'from-pink-50 to-slate-50',
  },
  {
    id: 'preschool',
    title: 'Preschool',
    subtitle: '33 months – 5 years',
    description: 'Kindergarten readiness with literacy foundations, math concepts, creative arts, and collaborative projects that build confidence.',
    color: '#43A047',
    bgColor: 'from-green-50 to-slate-50',
  },
  {
    id: 'school-age',
    title: 'School Age',
    subtitle: '5 – 12 years',
    description: 'Before and after school care with homework support, enrichment activities, and engaging summer programming.',
    color: '#7B1FA2',
    bgColor: 'from-purple-50 to-slate-50',
  },
];

export function ParallaxHero() {
  const [scrollY, setScrollY] = useState(0);
  const [activeStage, setActiveStage] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);

      // Determine active stage based on scroll position
      const heroHeight = heroRef.current?.offsetHeight || 0;
      const scrollPosition = window.scrollY - heroHeight;

      if (scrollPosition < 0) {
        setActiveStage(0);
      } else {
        const sectionHeight = window.innerHeight * 0.8;
        const newStage = Math.min(
          Math.floor(scrollPosition / sectionHeight),
          stages.length - 1
        );
        setActiveStage(newStage);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToContent = () => {
    const heroHeight = heroRef.current?.offsetHeight || 0;
    window.scrollTo({
      top: heroHeight,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#fafafa] to-[#f5f0e8]"
      >
        {/* Subtle animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute w-[600px] h-[600px] rounded-full opacity-[0.03]"
            style={{
              background: 'radial-gradient(circle, #1a1a1a 0%, transparent 70%)',
              left: '10%',
              top: '10%',
              transform: `translateY(${scrollY * 0.1}px)`,
            }}
          />
          <div
            className="absolute w-[500px] h-[500px] rounded-full opacity-[0.02]"
            style={{
              background: 'radial-gradient(circle, #c44536 0%, transparent 70%)',
              right: '5%',
              bottom: '20%',
              transform: `translateY(${scrollY * -0.05}px)`,
            }}
          />
        </div>

        {/* Main content */}
        <div className="relative z-10 container mx-auto px-6 text-center">
          {/* Eyebrow text */}
          <p
            className="text-xs uppercase tracking-[0.3em] text-[#6b6b6b] mb-6"
            style={{
              opacity: Math.max(0, 1 - scrollY / 300),
              transform: `translateY(${scrollY * 0.3}px)`,
            }}
          >
            Crystal & Brooklyn Park, Minnesota
          </p>

          {/* Main headline */}
          <h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-[#1a1a1a] tracking-tight leading-[1.1] mb-6"
            style={{
              opacity: Math.max(0, 1 - scrollY / 400),
              transform: `translateY(${scrollY * 0.4}px)`,
            }}
          >
            Christina&apos;s
            <br />
            <span className="font-normal">Child Care</span>
          </h1>

          {/* Tagline */}
          <p
            className="text-lg sm:text-xl md:text-2xl text-[#6b6b6b] font-light max-w-2xl mx-auto mb-12 leading-relaxed"
            style={{
              opacity: Math.max(0, 1 - scrollY / 350),
              transform: `translateY(${scrollY * 0.35}px)`,
            }}
          >
            Where learning and growth become one.
          </p>

          {/* CTA buttons */}
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            style={{
              opacity: Math.max(0, 1 - scrollY / 300),
              transform: `translateY(${scrollY * 0.3}px)`,
            }}
          >
            <Button
              size="lg"
              className="bg-[#1a1a1a] hover:bg-[#333] text-white px-8 py-6 text-base font-normal tracking-wide rounded-none"
              asChild
            >
              <Link href="/enroll">Schedule a Tour</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white px-8 py-6 text-base font-normal tracking-wide rounded-none"
              asChild
            >
              <Link href="/programs">Our Programs</Link>
            </Button>
          </div>

          {/* Scroll indicator */}
          <button
            onClick={scrollToContent}
            className="animate-bounce cursor-pointer"
            style={{
              opacity: Math.max(0, 1 - scrollY / 200),
            }}
            aria-label="Scroll to explore programs"
          >
            <ChevronDown className="w-8 h-8 text-[#6b6b6b]" />
          </button>
        </div>

        {/* Licensed badge */}
        <div
          className="absolute bottom-8 left-0 right-0 flex justify-center"
          style={{
            opacity: Math.max(0, 1 - scrollY / 200),
          }}
        >
          <span className="flex items-center gap-2 text-xs text-[#6b6b6b] tracking-wide">
            <MapPin className="w-3 h-3" />
            Licensed by Minnesota DCYF
          </span>
        </div>
      </section>

      {/* Stage Sections with Parallax */}
      {stages.map((stage, index) => (
        <section
          key={stage.id}
          ref={(el) => { sectionRefs.current[index] = el; }}
          className={`relative min-h-[80vh] flex items-center bg-gradient-to-b ${stage.bgColor}`}
        >
          <div className="container mx-auto px-6 py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
              {/* Text content */}
              <div className={index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'}>
                {/* Stage indicator */}
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="w-12 h-[2px]"
                    style={{ backgroundColor: stage.color }}
                  />
                  <span
                    className="text-xs uppercase tracking-[0.2em] font-medium"
                    style={{ color: stage.color }}
                  >
                    {stage.subtitle}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-light text-[#1a1a1a] tracking-tight mb-6">
                  {stage.title}
                </h2>

                {/* Description */}
                <p className="text-lg text-[#6b6b6b] font-light leading-relaxed mb-8 max-w-lg">
                  {stage.description}
                </p>

                {/* Learn more link */}
                <Link
                  href="/programs"
                  className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.15em] font-medium text-[#1a1a1a] hover:opacity-70 transition-opacity"
                >
                  Learn More
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {/* Visual element placeholder - elegant geometric shape */}
              <div className={index % 2 === 0 ? 'lg:order-2' : 'lg:order-1'}>
                <div className="relative aspect-square max-w-md mx-auto">
                  {/* Abstract shape representing the stage */}
                  <svg
                    viewBox="0 0 400 400"
                    className="w-full h-full"
                    style={{
                      transform: `translateY(${(scrollY - (index + 1) * 600) * 0.05}px)`,
                    }}
                  >
                    <defs>
                      <linearGradient id={`grad-${stage.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={stage.color} stopOpacity="0.1" />
                        <stop offset="100%" stopColor={stage.color} stopOpacity="0.3" />
                      </linearGradient>
                    </defs>

                    {/* Background circle */}
                    <circle
                      cx="200"
                      cy="200"
                      r="180"
                      fill={`url(#grad-${stage.id})`}
                    />

                    {/* Inner decorative elements */}
                    <circle
                      cx="200"
                      cy="200"
                      r="140"
                      fill="none"
                      stroke={stage.color}
                      strokeWidth="1"
                      strokeOpacity="0.2"
                    />
                    <circle
                      cx="200"
                      cy="200"
                      r="100"
                      fill="none"
                      stroke={stage.color}
                      strokeWidth="1"
                      strokeOpacity="0.15"
                    />

                    {/* Stage number */}
                    <text
                      x="200"
                      y="220"
                      textAnchor="middle"
                      fontSize="120"
                      fontWeight="200"
                      fill={stage.color}
                      opacity="0.15"
                    >
                      {index + 1}
                    </text>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Progress indicator - fixed on side */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-3">
        {stages.map((stage, index) => (
          <button
            key={stage.id}
            onClick={() => {
              const heroHeight = heroRef.current?.offsetHeight || 0;
              window.scrollTo({
                top: heroHeight + index * window.innerHeight * 0.8,
                behavior: 'smooth',
              });
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              activeStage === index
                ? 'scale-150'
                : 'bg-[#1a1a1a]/20 hover:bg-[#1a1a1a]/40'
            }`}
            style={{
              backgroundColor: activeStage === index ? stage.color : undefined,
            }}
            aria-label={`Go to ${stage.title}`}
          />
        ))}
      </div>
    </>
  );
}
