'use client';

// Quietly capture where the person was when they opened the report form, so J
// has the context without having to ask for it.
export function captureContext() {
  if (typeof window === 'undefined') {
    return { page_url: '', viewport: '' };
  }
  return {
    page_url: window.location.href,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
  };
}
