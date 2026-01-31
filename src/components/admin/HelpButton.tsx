'use client';

import { useState, useRef, useEffect } from 'react';
import { HelpCircle, ExternalLink, Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

interface HelpButtonProps {
  /** The help text to display */
  helpText: string;
  /** Optional title for the popover */
  title?: string;
  /** Optional link to documentation */
  docsLink?: string;
  /** Optional element selector to highlight */
  highlightSelector?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Position relative to parent */
  position?: 'inline' | 'floating';
  /** Custom class name */
  className?: string;
}

/**
 * HelpButton - Contextual help button with popover
 *
 * Features:
 * - Shows tooltip on hover/click
 * - Can link to documentation
 * - Can highlight a specific element
 */
export function HelpButton({
  helpText,
  title,
  docsLink,
  highlightSelector,
  size = 'sm',
  position = 'inline',
  className = '',
}: HelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleHighlight = () => {
    if (highlightSelector) {
      const driverObj = driver({
        popoverClass: 'christina-tour-popover',
        steps: [
          {
            element: highlightSelector,
            popover: {
              title: title || 'Here!',
              description: helpText,
              side: 'bottom',
              align: 'start',
            },
          },
        ],
      });
      driverObj.drive();
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative inline-block ${position === 'floating' ? 'absolute -top-1 -right-1' : ''}`}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          ${sizeClasses[size]}
          rounded-full
          text-muted-foreground
          hover:text-primary
          hover:bg-primary/10
          flex items-center justify-center
          transition-colors
          ${className}
        `}
        title="Help"
        type="button"
      >
        <HelpCircle className={iconSizeClasses[size]} />
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute z-50 top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-lg border p-4 animate-in fade-in-0 zoom-in-95"
        >
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="space-y-3">
            {title && (
              <h4 className="font-semibold text-sm text-foreground pr-6">{title}</h4>
            )}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {helpText}
            </p>
            <div className="flex items-center gap-2 pt-1">
              {highlightSelector && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-xs"
                  onClick={handleHighlight}
                >
                  <Play className="w-3 h-3" />
                  Show me
                </Button>
              )}
              {docsLink && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-xs"
                  asChild
                >
                  <a href={docsLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3 h-3" />
                    Learn more
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * HelpTooltip - Simpler inline help with just hover tooltip
 */
export function HelpTooltip({
  text,
  className = '',
}: {
  text: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center cursor-help ${className}`}
      title={text}
    >
      <HelpCircle className="w-3.5 h-3.5 text-muted-foreground hover:text-primary transition-colors" />
    </span>
  );
}

/**
 * FieldHelp - Help text displayed below a form field
 */
export function FieldHelp({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`text-xs text-muted-foreground mt-1 ${className}`}>
      {children}
    </p>
  );
}

/**
 * HelpCard - Larger help content block
 */
export function HelpCard({
  title,
  children,
  icon: Icon = HelpCircle,
  variant = 'default',
  className = '',
}: {
  title: string;
  children: React.ReactNode;
  icon?: React.ElementType;
  variant?: 'default' | 'tip' | 'warning';
  className?: string;
}) {
  const variantClasses = {
    default: 'bg-muted/50 border-muted',
    tip: 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900',
    warning: 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900',
  };

  const iconColors = {
    default: 'text-muted-foreground',
    tip: 'text-blue-600',
    warning: 'text-amber-600',
  };

  return (
    <div className={`rounded-lg border p-4 ${variantClasses[variant]} ${className}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColors[variant]}`} />
        <div>
          <h4 className="font-medium text-sm mb-1">{title}</h4>
          <div className="text-sm text-muted-foreground">{children}</div>
        </div>
      </div>
    </div>
  );
}
