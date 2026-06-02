'use client';

import { ScrollFadeIn } from '@/components/features/ScrollFadeIn';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { BookOpen, Calendar, ArrowRight, Clock } from 'lucide-react';
import { useT } from '@/contexts/LanguageContext';

const blogPosts = [
  {
    slug: 'preparing-your-child-for-their-first-day-at-daycare',
    titleKey: 'blog.post1Title',
    excerptKey: 'blog.post1Excerpt',
    dateKey: 'blog.post1Date',
    readTimeKey: 'blog.post1ReadTime',
    categoryKey: 'blog.categoryTransitions',
    categoryStyle: 'bg-amber-100 text-amber-800',
  },
  {
    slug: 'the-power-of-play-based-learning',
    titleKey: 'blog.post2Title',
    excerptKey: 'blog.post2Excerpt',
    dateKey: 'blog.post2Date',
    readTimeKey: 'blog.post2ReadTime',
    categoryKey: 'blog.categoryChildDevelopment',
    categoryStyle: 'bg-emerald-100 text-emerald-800',
  },
  {
    slug: 'what-to-look-for-when-choosing-child-care',
    titleKey: 'blog.post3Title',
    excerptKey: 'blog.post3Excerpt',
    dateKey: 'blog.post3Date',
    readTimeKey: 'blog.post3ReadTime',
    categoryKey: 'blog.categoryChoosingCare',
    categoryStyle: 'bg-blue-100 text-blue-800',
  },
  {
    slug: 'our-daily-routine-a-peek-inside-christinas',
    titleKey: 'blog.post4Title',
    excerptKey: 'blog.post4Excerpt',
    dateKey: 'blog.post4Date',
    readTimeKey: 'blog.post4ReadTime',
    categoryKey: 'blog.categoryInsideOurCenter',
    categoryStyle: 'bg-purple-100 text-purple-800',
  },
  {
    slug: 'building-social-skills-in-early-childhood',
    titleKey: 'blog.post5Title',
    excerptKey: 'blog.post5Excerpt',
    dateKey: 'blog.post5Date',
    readTimeKey: 'blog.post5ReadTime',
    categoryKey: 'blog.categoryChildDevelopment',
    categoryStyle: 'bg-emerald-100 text-emerald-800',
  },
] as const;

export default function BlogPage() {
  const t = useT();
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <ScrollFadeIn direction="up" duration={600}>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-christina-red/10 text-christina-red px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <BookOpen className="h-4 w-4" />
              {t('blog.badge')}
            </div>
            <h1 className="font-playful text-4xl md:text-5xl mb-4">
              {t('blog.heroTitle')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('blog.heroSubtitle')}
            </p>
          </div>
        </ScrollFadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post, index) => (
            <ScrollFadeIn
              key={post.slug}
              direction="up"
              duration={700}
              delay={index * 100}
              distance={40}
            >
              <Link href={`/blog/${post.slug}`} className="block h-full group">
                <Card className="h-full transition-shadow hover:shadow-lg border-t-4 border-t-transparent group-hover:border-t-christina-red">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold ${post.categoryStyle}`}
                      >
                        {t(post.categoryKey)}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold mb-3 group-hover:text-christina-red transition-colors">
                      {t(post.titleKey)}
                    </h2>

                    <p className="text-muted-foreground text-sm flex-1 mb-4">
                      {t(post.excerptKey)}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {t(post.dateKey)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {t(post.readTimeKey)}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-christina-red text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        {t('blog.readLink')}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </ScrollFadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}
