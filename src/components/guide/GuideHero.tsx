'use client';

import { type ElementType } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowDown, BookOpen, Wrench, Monitor, Heart } from 'lucide-react';

export function GuideHero() {
  const handleScrollDown = () => {
    const roleSection = document.getElementById('role-filter');
    if (roleSection) {
      roleSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[580px] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-christina-red via-red-800 to-red-950">
      {/* Decorative dot grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Animated glow blobs */}
      <div
        className="absolute top-0 left-0 w-[520px] h-[520px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(255,112,67,0.18) 0%, transparent 70%)',
          transform: 'translate(-30%, -30%)',
          animation: 'pulse 6s ease-in-out infinite',
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-[420px] h-[420px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(255,213,79,0.12) 0%, transparent 70%)',
          transform: 'translate(25%, 30%)',
          animation: 'pulse 8s ease-in-out infinite 2s',
        }}
      />

      {/* Decorative arc lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid slice"
      >
        <ellipse
          cx="50%"
          cy="110%"
          rx="60%"
          ry="55%"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1.5"
        />
        <ellipse
          cx="50%"
          cy="110%"
          rx="75%"
          ry="68%"
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="1"
        />
        <ellipse
          cx="50%"
          cy="110%"
          rx="90%"
          ry="82%"
          fill="none"
          stroke="rgba(255,255,255,0.025)"
          strokeWidth="1"
        />
      </svg>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-white/90 text-sm font-medium mb-8 backdrop-blur-sm">
          <BookOpen className="w-3.5 h-3.5" />
          Interactive Platform Guide
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight max-w-4xl mx-auto">
          Your Guide to Christina&apos;s
          <span className="block text-amber-200 mt-1">Child Care Center</span>
        </h1>

        <p className="text-lg md:text-xl text-red-100 max-w-2xl mx-auto mb-10 leading-relaxed">
          Everything you need to know about managing your center, supporting
          your staff, and keeping families connected. Pick your role and explore
          the tools built specifically for you.
        </p>

        <Button
          onClick={handleScrollDown}
          size="lg"
          className="bg-white text-christina-red hover:bg-red-50 font-semibold shadow-xl shadow-black/20 px-8 py-3 text-base h-auto"
        >
          Start Exploring
          <ArrowDown className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Stats bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/25 backdrop-blur-sm border-t border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 text-center">
            <StatItem icon={BookOpen} value="96" label="Pages" />
            <div className="hidden md:block w-px h-8 bg-white/20" />
            <StatItem icon={Wrench} value="20+" label="Tools" />
            <div className="hidden md:block w-px h-8 bg-white/20" />
            <StatItem icon={Monitor} value="3" label="Portals" />
            <div className="hidden md:block w-px h-8 bg-white/20" />
            <StatItem icon={Heart} value="Built" label="For You" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: translate(-30%, -30%) scale(1); }
          50% { opacity: 0.7; transform: translate(-30%, -30%) scale(1.08); }
        }
      `}</style>
    </section>
  );
}

function StatItem({
  icon: Icon,
  value,
  label,
}: {
  icon: ElementType;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-white">
      <Icon className="w-4 h-4 text-amber-300 shrink-0" />
      <span className="font-bold text-lg leading-none">{value}</span>
      <span className="text-white/70 text-sm leading-none">{label}</span>
    </div>
  );
}
