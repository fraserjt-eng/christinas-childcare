'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search,
  BookOpen,
  ChevronRight,
  Lightbulb,
  Users,
  Calendar,
  FileText,
  BarChart3,
  MessageSquare,
  Shield,
  Settings,
  ArrowLeft,
} from 'lucide-react';
import { useState } from 'react';

const docCategories = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'First steps and system overview',
    icon: Lightbulb,
    articles: [
      { title: 'Welcome to Christina\'s', slug: 'welcome', readTime: '3 min' },
      { title: 'Logging In and Navigation', slug: 'login-navigation', readTime: '2 min' },
      { title: 'Understanding Your Dashboard', slug: 'dashboard-overview', readTime: '4 min' },
      { title: 'Setting Up Your Profile', slug: 'profile-setup', readTime: '3 min' },
    ],
  },
  {
    id: 'lesson-planning',
    title: 'Lesson Planning',
    description: 'Create and manage lesson plans',
    icon: BookOpen,
    articles: [
      { title: 'AI Lesson Builder Overview', slug: 'ai-lesson-builder', readTime: '5 min' },
      { title: 'Creating a New Lesson', slug: 'create-lesson', readTime: '4 min' },
      { title: 'Using Activity Templates', slug: 'activity-templates', readTime: '3 min' },
      { title: 'Customizing AI Suggestions', slug: 'customize-ai', readTime: '4 min' },
      { title: 'Saving and Organizing Lessons', slug: 'save-organize', readTime: '3 min' },
    ],
  },
  {
    id: 'curriculum-library',
    title: 'Curriculum Library',
    description: 'Browse and remix curriculum content',
    icon: FileText,
    articles: [
      { title: 'Navigating the Library', slug: 'navigate-library', readTime: '3 min' },
      { title: 'Filtering by Age and Topic', slug: 'filtering', readTime: '2 min' },
      { title: 'Remixing Existing Lessons', slug: 'remix-lessons', readTime: '4 min' },
      { title: 'Creating Collections', slug: 'collections', readTime: '3 min' },
      { title: 'Sharing with Your Team', slug: 'sharing', readTime: '2 min' },
    ],
  },
  {
    id: 'staff-management',
    title: 'Staff Management',
    description: 'Team profiles and scheduling',
    icon: Users,
    articles: [
      { title: 'Adding Staff Members', slug: 'add-staff', readTime: '3 min' },
      { title: 'Managing Roles and Permissions', slug: 'roles-permissions', readTime: '4 min' },
      { title: 'Tracking Certifications', slug: 'certifications', readTime: '3 min' },
      { title: 'Staff Scheduling', slug: 'scheduling', readTime: '5 min' },
    ],
  },
  {
    id: 'attendance',
    title: 'Attendance & Ratios',
    description: 'Daily tracking and compliance',
    icon: Calendar,
    articles: [
      { title: 'Recording Attendance', slug: 'record-attendance', readTime: '2 min' },
      { title: 'Understanding Ratio Requirements', slug: 'ratios', readTime: '4 min' },
      { title: 'Handling Late Arrivals', slug: 'late-arrivals', readTime: '2 min' },
      { title: 'Attendance Reports', slug: 'attendance-reports', readTime: '3 min' },
    ],
  },
  {
    id: 'parent-communication',
    title: 'Parent Communication',
    description: 'Updates, photos, and messaging',
    icon: MessageSquare,
    articles: [
      { title: 'Sending Daily Updates', slug: 'daily-updates', readTime: '3 min' },
      { title: 'Photo Sharing Best Practices', slug: 'photo-sharing', readTime: '4 min' },
      { title: 'Managing Parent Messages', slug: 'parent-messages', readTime: '3 min' },
      { title: 'Incident Reports', slug: 'incident-reports', readTime: '4 min' },
    ],
  },
  {
    id: 'reports',
    title: 'Reports & Analytics',
    description: 'Data insights and exports',
    icon: BarChart3,
    articles: [
      { title: 'Available Reports Overview', slug: 'reports-overview', readTime: '4 min' },
      { title: 'Generating DCYF Reports', slug: 'dcyf-reports', readTime: '5 min' },
      { title: 'Exporting Data', slug: 'export-data', readTime: '3 min' },
      { title: 'Understanding Analytics', slug: 'analytics', readTime: '4 min' },
    ],
  },
  {
    id: 'compliance',
    title: 'Compliance & Safety',
    description: 'Regulatory requirements and safety',
    icon: Shield,
    articles: [
      { title: 'Minnesota DCYF Requirements', slug: 'dcyf-requirements', readTime: '6 min' },
      { title: 'Safety Checklist Features', slug: 'safety-checklists', readTime: '4 min' },
      { title: 'Documentation Best Practices', slug: 'documentation', readTime: '5 min' },
    ],
  },
  {
    id: 'settings',
    title: 'Settings & Admin',
    description: 'System configuration',
    icon: Settings,
    articles: [
      { title: 'Account Settings', slug: 'account-settings', readTime: '3 min' },
      { title: 'Notification Preferences', slug: 'notifications', readTime: '2 min' },
      { title: 'Customizing Your Center', slug: 'customize-center', readTime: '4 min' },
    ],
  },
];

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = searchQuery
    ? docCategories.map(cat => ({
        ...cat,
        articles: cat.articles.filter(article =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter(cat => cat.articles.length > 0)
    : docCategories;

  const totalArticles = docCategories.reduce((sum, cat) => sum + cat.articles.length, 0);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <section className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/training">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Training
                </Link>
              </Button>
              <div className="h-6 w-px bg-slate-200" />
              <h1 className="text-lg font-semibold text-slate-900">Documentation</h1>
            </div>
            <Badge variant="outline">{totalArticles} articles</Badge>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="search"
                placeholder="Search documentation..."
                className="pl-10 h-12 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {searchQuery && filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">No articles found for &ldquo;{searchQuery}&rdquo;</p>
              <Button variant="link" onClick={() => setSearchQuery('')}>
                Clear search
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map((category) => (
                <Card key={category.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <category.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{category.title}</CardTitle>
                        <CardDescription className="text-sm">{category.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.articles.map((article) => (
                        <li key={article.slug}>
                          <Link
                            href={`/training/docs/${category.id}/${article.slug}`}
                            className="flex items-center justify-between py-2 px-3 -mx-3 rounded-lg hover:bg-slate-50 transition-colors group"
                          >
                            <span className="text-sm text-slate-700 group-hover:text-primary transition-colors">
                              {article.title}
                            </span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              {article.readTime}
                              <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Help Section */}
      <section className="py-12 bg-slate-50">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Can&apos;t find what you&apos;re looking for?
          </h3>
          <p className="text-slate-600 mb-6">
            Our team is here to help with any questions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" asChild>
              <Link href="/training">
                <BookOpen className="w-4 h-4 mr-2" /> Watch Video Tutorials
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/contact">
                <MessageSquare className="w-4 h-4 mr-2" /> Contact Support
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
