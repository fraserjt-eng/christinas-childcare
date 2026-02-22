'use client';

import { ScrollFadeIn } from '@/components/features/ScrollFadeIn';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { BookOpen, Calendar, ArrowRight, Clock } from 'lucide-react';

const blogPosts = [
  {
    slug: 'preparing-your-child-for-their-first-day-at-daycare',
    title: 'Preparing Your Child for Their First Day at Daycare',
    excerpt:
      'Starting daycare is a big milestone for both kids and parents. Here are practical ways to make the transition smoother, from building familiarity with the routine to managing your own feelings about the change.',
    date: 'January 15, 2026',
    readTime: '5 min read',
    category: 'Transitions',
  },
  {
    slug: 'the-power-of-play-based-learning',
    title: 'The Power of Play-Based Learning',
    excerpt:
      'Play is not a break from learning. It is how young children make sense of the world around them. Research consistently shows that hands-on, child-led play builds stronger foundations than worksheets ever could.',
    date: 'January 8, 2026',
    readTime: '6 min read',
    category: 'Child Development',
  },
  {
    slug: 'what-to-look-for-when-choosing-child-care',
    title: 'What to Look for When Choosing Child Care',
    excerpt:
      'Finding the right child care can feel overwhelming. This guide walks you through the quality indicators that matter most, from staff ratios and licensing to the warmth you feel when you walk through the door.',
    date: 'December 20, 2025',
    readTime: '7 min read',
    category: 'Choosing Care',
  },
  {
    slug: 'our-daily-routine-a-peek-inside-christinas',
    title: "Our Daily Routine: A Peek Inside Christina's",
    excerpt:
      'Ever wonder what your child does all day? We break down a typical day at our center, from morning circle time to afternoon outdoor play, so you can see exactly how we balance learning, movement, and rest.',
    date: 'December 10, 2025',
    readTime: '4 min read',
    category: 'Inside Our Center',
  },
  {
    slug: 'building-social-skills-in-early-childhood',
    title: 'Building Social Skills in Early Childhood',
    excerpt:
      'Sharing, taking turns, and navigating disagreements are skills that children build over time with practice and support. Learn how we help kids develop the social tools they will carry into kindergarten and beyond.',
    date: 'November 28, 2025',
    readTime: '5 min read',
    category: 'Child Development',
  },
];

const categoryColors: Record<string, string> = {
  Transitions: 'bg-amber-100 text-amber-800',
  'Child Development': 'bg-emerald-100 text-emerald-800',
  'Choosing Care': 'bg-blue-100 text-blue-800',
  'Inside Our Center': 'bg-purple-100 text-purple-800',
};

export default function BlogPage() {
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <ScrollFadeIn direction="up" duration={600}>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-christina-red/10 text-christina-red px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <BookOpen className="h-4 w-4" />
              Parent Resources
            </div>
            <h1 className="font-playful text-4xl md:text-5xl mb-4">
              Tips, Guides &amp; Insights
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Practical advice and a behind-the-scenes look at how we care for
              your children. Written by our team for the families we serve.
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
                        className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                          categoryColors[post.category] ||
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {post.category}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold mb-3 group-hover:text-christina-red transition-colors">
                      {post.title}
                    </h2>

                    <p className="text-muted-foreground text-sm flex-1 mb-4">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {post.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.readTime}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-christina-red text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Read
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
