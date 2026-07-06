'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Heart, Send } from 'lucide-react';
import { useT } from '@/contexts/LanguageContext';

export function Footer() {
  const t = useT();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    const existing = JSON.parse(localStorage.getItem('christinas_newsletter') || '[]');
    existing.push({ email, subscribedAt: new Date().toISOString() });
    localStorage.setItem('christinas_newsletter', JSON.stringify(existing));
    setSubscribed(true);
    setEmail('');
  }

  return (
    <footer className="bg-gray-900 text-gray-300 pb-16 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <svg width="32" height="32" viewBox="0 0 40 40" className="flex-shrink-0">
                <defs>
                  <linearGradient id="zGradientFooter" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFE082" />
                    <stop offset="50%" stopColor="#FFD54F" />
                    <stop offset="100%" stopColor="#FFC107" />
                  </linearGradient>
                </defs>
                <circle cx="20" cy="20" r="20" fill="#C62828" />
                <path
                  d="M12,10 L28,10 Q30,10 29,12 L17,26 L28,26 Q30,26 30,28 Q30,30 28,30 L12,30 Q10,30 11,28 L23,14 L12,14 Q10,14 10,12 Q10,10 12,10 Z"
                  fill="url(#zGradientFooter)"
                />
                <circle cx="31" cy="9" r="1.5" fill="#FFE082" opacity="0.9" />
              </svg>
              <span className="font-playful text-white text-lg">Christina&apos;s</span>
            </div>
            <p className="text-sm italic mb-2">{t('chrome.tagline')}</p>
            <p className="text-sm mb-6">{t('chrome.footerBlurb')}</p>

            {/* Newsletter Signup */}
            <div>
              <h3 className="font-heading font-bold text-white mb-2 text-sm">{t('chrome.stayConnected')}</h3>
              {subscribed ? (
                <p className="text-christina-green text-sm">{t('chrome.thanksSub')}</p>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('chrome.emailPlaceholder')}
                    required
                    className="flex-1 px-3 py-2 rounded text-sm bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500 focus:outline-none focus:border-christina-red"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded bg-christina-red hover:bg-christina-red/90 text-white transition-colors"
                    aria-label="Subscribe"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
          <div>
            <h3 className="font-heading font-bold text-white mb-3">{t('chrome.programs')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/programs" className="hover:text-white transition-colors">{t('chrome.infantCare')}</Link></li>
              <li><Link href="/programs" className="hover:text-white transition-colors">{t('chrome.toddler')}</Link></li>
              <li><Link href="/programs" className="hover:text-white transition-colors">{t('chrome.preschool')}</Link></li>
              <li><Link href="/programs" className="hover:text-white transition-colors">{t('chrome.schoolAge')}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-heading font-bold text-white mb-3">{t('chrome.quickLinks')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">{t('chrome.aboutUs')}</Link></li>
              <li><Link href="/gallery" className="hover:text-white transition-colors">{t('chrome.navGallery')}</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">{t('chrome.navFaq')}</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">{t('chrome.parentResources')}</Link></li>
              <li><Link href="/enroll" className="hover:text-white transition-colors">{t('chrome.enrollment')}</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">{t('chrome.parentPortal')}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-heading font-bold text-white mb-3">{t('chrome.contact')}</h3>
            <ul className="space-y-2 text-sm">
              <li>5510 W Broadway Ave</li>
              <li>Crystal, MN 55428</li>
              <li><a href="tel:+17633905870" className="hover:text-white transition-colors">Crystal: (763) 390-5870</a></li>
              <li><a href="tel:+15555555555" className="hover:text-white transition-colors">Brooklyn Park: 555-555-5555</a></li>
            </ul>
            <div className="mt-4 text-sm">
              <p className="text-white font-medium">{t('chrome.hours')}</p>
              <p>{t('chrome.hoursValue')}</p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm">{t('chrome.rights')}</p>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/privacy" className="hover:text-white transition-colors">{t('chrome.privacy')}</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/cookie-policy" className="hover:text-white transition-colors">Cookies</Link>
            <Link href="/ferpa-notice" className="hover:text-white transition-colors">Children&apos;s Records</Link>
            <Link href="/data-processing" className="hover:text-white transition-colors">Data Handling</Link>
            <Link href="/retention-schedule" className="hover:text-white transition-colors">Data Retention</Link>
            <Link href="/delete-data" className="hover:text-white transition-colors">Delete My Data</Link>
            <p className="flex items-center gap-1">{t('chrome.madeWith')} <Heart className="h-3 w-3 text-christina-red" /> {t('chrome.forFamilies')}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
