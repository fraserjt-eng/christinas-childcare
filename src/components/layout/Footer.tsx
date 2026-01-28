import Link from 'next/link';
import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <svg width="32" height="32" viewBox="0 0 40 40" className="flex-shrink-0">
                <circle cx="20" cy="20" r="20" fill="#C62828" />
                <path d="M12 14 C12 14 20 8 28 14" stroke="#FFD54F" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <line x1="20" y1="10" x2="20" y2="28" stroke="#FFD54F" strokeWidth="2" strokeLinecap="round" />
                <text x="20" y="34" textAnchor="middle" fill="white" fontSize="10" fontFamily="Fredoka One, cursive" fontWeight="bold">C</text>
              </svg>
              <span className="font-heading font-bold text-white">Christina&apos;s</span>
            </div>
            <p className="text-sm italic mb-2">&ldquo;Where Learning And Growth Become One&rdquo;</p>
            <p className="text-sm">Nurturing young minds with love, creativity, and excellence.</p>
          </div>
          <div>
            <h3 className="font-heading font-bold text-white mb-3">Programs</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/programs" className="hover:text-white transition-colors">Infant Care</Link></li>
              <li><Link href="/programs" className="hover:text-white transition-colors">Toddler Program</Link></li>
              <li><Link href="/programs" className="hover:text-white transition-colors">Preschool</Link></li>
              <li><Link href="/programs" className="hover:text-white transition-colors">School Age</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-heading font-bold text-white mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/enroll" className="hover:text-white transition-colors">Enrollment</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Parent Portal</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-heading font-bold text-white mb-3">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>5510 W Broadway Ave</li>
              <li>Crystal, MN 55428</li>
              <li>(763) 390-5870</li>
              <li>info@christinaschildcare.com</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm">&copy; 2026 Christina&apos;s Child Care Center. All rights reserved.</p>
          <p className="text-sm flex items-center gap-1">Made with <Heart className="h-3 w-3 text-christina-red" /> for our families</p>
        </div>
      </div>
    </footer>
  );
}
