'use client';

import { type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';

interface GuideSectionProps {
  title: string;
  description: string;
  icon: LucideIcon;
  accentColor: string;
  children: ReactNode;
  id?: string;
}

export function GuideSection({
  title,
  description,
  icon: Icon,
  accentColor,
  children,
  id,
}: GuideSectionProps) {
  return (
    <section id={id} className="py-12 border-b border-gray-100 last:border-b-0">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
              style={{ backgroundColor: accentColor + '1A' }}
            >
              <Icon className="w-5 h-5" style={{ color: accentColor }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              <div
                className="h-0.5 rounded-full mt-1 w-16"
                style={{ backgroundColor: accentColor }}
              />
            </div>
          </div>
          <p className="text-sm text-gray-500 max-w-xl ml-[52px]">
            {description}
          </p>
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {children}
        </div>
      </div>
    </section>
  );
}
