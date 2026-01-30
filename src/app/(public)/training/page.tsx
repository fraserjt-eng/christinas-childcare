'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  BookOpen,
  Users,
  Calendar,
  FileText,
  BarChart3,
  Lightbulb,
  ChevronRight,
  Clock,
  GraduationCap,
} from 'lucide-react';

const videoSections = [
  {
    id: 'lesson-builder',
    title: 'Lesson Builder',
    description: 'Create AI-powered lesson plans in minutes',
    icon: Lightbulb,
    duration: '12 min',
    scriptId: 'lesson-builder',
    videos: [
      { title: 'Getting Started with Lesson Builder', duration: '3:45' },
      { title: 'Using AI to Generate Activities', duration: '4:20' },
      { title: 'Customizing and Saving Lessons', duration: '4:15' },
    ],
  },
  {
    id: 'curriculum',
    title: 'Curriculum Library',
    description: 'Browse, filter, and remix curriculum content',
    icon: BookOpen,
    duration: '15 min',
    scriptId: 'curriculum',
    videos: [
      { title: 'Navigating the Curriculum Library', duration: '4:00' },
      { title: 'Filtering by Age Group and Topic', duration: '3:30' },
      { title: 'Remixing Lessons for Your Classroom', duration: '5:00' },
      { title: 'Creating Custom Collections', duration: '2:45' },
    ],
  },
  {
    id: 'staff',
    title: 'Staff Management',
    description: 'Manage staff profiles, schedules, and certifications',
    icon: Users,
    duration: '10 min',
    scriptId: 'staff',
    videos: [
      { title: 'Adding and Managing Staff Profiles', duration: '3:00' },
      { title: 'Tracking Certifications and Training', duration: '4:00' },
      { title: 'Staff Scheduling Basics', duration: '3:15' },
    ],
  },
  {
    id: 'attendance',
    title: 'Attendance & Ratios',
    description: 'Track daily attendance and maintain compliance',
    icon: Calendar,
    duration: '8 min',
    scriptId: 'attendance',
    videos: [
      { title: 'Recording Daily Attendance', duration: '2:45' },
      { title: 'Understanding Ratio Requirements', duration: '3:00' },
      { title: 'Generating Attendance Reports', duration: '2:30' },
    ],
  },
  {
    id: 'reports',
    title: 'Reports & Analytics',
    description: 'Generate insights and compliance reports',
    icon: BarChart3,
    duration: '10 min',
    scriptId: 'reports',
    videos: [
      { title: 'Overview of Available Reports', duration: '3:00' },
      { title: 'Exporting Data for DCYF Compliance', duration: '4:00' },
      { title: 'Understanding Your Analytics Dashboard', duration: '3:15' },
    ],
  },
];

const quickStartGuides = [
  {
    title: 'New Staff Onboarding',
    description: 'Essential training for new team members',
    topics: ['Attendance', 'Communication', 'Safety Protocols'],
    estimatedTime: '30 min',
  },
  {
    title: 'Lead Teacher Essentials',
    description: 'Advanced features for classroom leaders',
    topics: ['Lesson Planning', 'Parent Updates', 'Progress Tracking'],
    estimatedTime: '45 min',
  },
  {
    title: 'Administrator Guide',
    description: 'Complete system administration training',
    topics: ['Staff Management', 'Reports', 'Compliance'],
    estimatedTime: '60 min',
  },
];

export default function TrainingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-white/10 text-white border-white/20 hover:bg-white/20">
              <GraduationCap className="w-3 h-3 mr-1" /> Training Center
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Learn to Use Christina&apos;s
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed">
              Video tutorials, interactive guides, and documentation to help you
              get the most out of our childcare management system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100">
                <Play className="w-4 h-4 mr-2" /> Watch Overview
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white text-white bg-transparent hover:bg-white/10" asChild>
                <Link href="/training/docs">
                  <FileText className="w-4 h-4 mr-2" /> Browse Documentation
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start Paths */}
      <section className="py-16 border-b">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">Quick Start Guides</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Curated learning paths based on your role
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {quickStartGuides.map((guide) => (
              <Card key={guide.title} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {guide.title}
                  </CardTitle>
                  <CardDescription>{guide.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {guide.topics.map((topic) => (
                      <Badge key={topic} variant="secondary" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {guide.estimatedTime}
                    </span>
                    <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      Start <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Video Tutorials */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">Video Tutorials</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Step-by-step video guides for every feature
            </p>
          </div>

          <div className="space-y-8 max-w-4xl mx-auto">
            {videoSections.map((section) => (
              <Card key={section.id} className="overflow-hidden">
                <CardHeader className="bg-slate-50 border-b">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <section.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                        <CardDescription>{section.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {section.duration}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {section.videos.map((video, index) => (
                      <Link
                        key={video.title}
                        href={`/training/scripts#${section.scriptId}`}
                        className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium text-slate-500 group-hover:bg-primary group-hover:text-white transition-colors">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 group-hover:text-primary transition-colors">
                            {video.title}
                          </p>
                          <p className="text-xs text-slate-400">View recording script</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-slate-500">{video.duration}</span>
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                            <FileText className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Tours CTA */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto bg-gradient-to-br from-primary/5 via-transparent to-primary/5 border-primary/20">
            <CardContent className="p-8 md:p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Lightbulb className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                Interactive In-App Tours
              </h3>
              <p className="text-slate-600 mb-6 max-w-lg mx-auto">
                Learn by doing with our guided tours. Look for the
                <span className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 bg-primary/10 rounded text-primary font-medium text-sm">
                  <Play className="w-3 h-3" /> Start Tour
                </span>
                button on admin pages.
              </p>
              <Button asChild>
                <Link href="/admin">
                  Go to Admin Dashboard <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Training Resources Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">Additional Resources</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Multiple ways to learn based on your preference
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow group">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Step-by-Step Guides</h4>
                <p className="text-sm text-slate-600 mb-4">
                  Detailed written instructions for every feature with tips and warnings
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/training/guides">
                    Read Guides <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow group">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mx-auto mb-4">
                  <Play className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Video Scripts</h4>
                <p className="text-sm text-slate-600 mb-4">
                  Narration scripts for recording your own training videos
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/training/scripts">
                    View Scripts <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow group">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Documentation</h4>
                <p className="text-sm text-slate-600 mb-4">
                  Searchable reference docs organized by feature category
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/training/docs">
                    Browse Docs <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
