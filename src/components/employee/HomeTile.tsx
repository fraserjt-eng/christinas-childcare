'use client';

import Link from 'next/link';
import { type LucideIcon } from 'lucide-react';

interface HomeTileProps {
  href: string;
  icon: LucideIcon;
  label: string;
  bgColor: string;
  badge?: string | number;
  subtitle?: string;
  onClick?: () => void;
}

export function HomeTile({
  href,
  icon: Icon,
  label,
  bgColor,
  badge,
  subtitle,
  onClick,
}: HomeTileProps) {
  const content = (
    <>
      {/* Badge */}
      {badge !== undefined && badge !== 0 && (
        <span className="absolute top-2 right-2 flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold shadow-md">
          {badge}
        </span>
      )}

      {/* Icon */}
      <Icon className="h-10 w-10 text-white mb-2" />

      {/* Label */}
      <span className="text-lg font-semibold text-white text-center leading-tight">
        {label}
      </span>

      {/* Subtitle */}
      {subtitle && (
        <span className="text-sm text-white/80 text-center mt-0.5">
          {subtitle}
        </span>
      )}
    </>
  );

  const sharedClasses = `
    relative flex flex-col items-center justify-center
    min-h-[130px] sm:min-h-[150px]
    rounded-2xl ${bgColor} p-4
    transition-all duration-200
    hover:scale-[1.03] hover:shadow-lg
    active:scale-[0.98]
  `;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={sharedClasses}
      >
        {content}
      </button>
    );
  }

  return (
    <Link href={href} className={sharedClasses}>
      {content}
    </Link>
  );
}
