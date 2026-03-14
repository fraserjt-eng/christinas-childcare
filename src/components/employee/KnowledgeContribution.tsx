'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { createEntry, CATEGORY_LABELS, type KnowledgeCategory } from '@/lib/knowledge-storage';
import { CheckCircle2, Lightbulb, Plus } from 'lucide-react';

const CATEGORY_COLORS: Record<KnowledgeCategory, string> = {
  daily_procedures: 'bg-blue-100 text-blue-800',
  emergency_protocols: 'bg-red-100 text-red-800',
  classroom_routines: 'bg-green-100 text-green-800',
  parent_templates: 'bg-purple-100 text-purple-800',
  compliance_checklists: 'bg-orange-100 text-orange-800',
  vendor_contacts: 'bg-slate-100 text-slate-800',
  equipment_instructions: 'bg-yellow-100 text-yellow-800',
};

export function KnowledgeContribution() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<KnowledgeCategory>('daily_procedures');
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  function validate(): boolean {
    if (!title.trim()) { setError('Please enter a title.'); return false; }
    if (!authorName.trim()) { setError('Please enter your name.'); return false; }
    if (!content.trim()) { setError('Please enter the content.'); return false; }
    if (content.trim().length < 20) { setError('Content is too short. Please write at least a sentence or two.'); return false; }
    setError('');
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      // Store as plain text wrapped in a paragraph for the HTML content field.
      // Admin will polish with the rich text editor before publishing.
      const contentHtml = content
        .split('\n\n')
        .filter(p => p.trim())
        .map(p => `<p>${p.trim().replace(/\n/g, '<br/>')}</p>`)
        .join('');

      await createEntry({
        title: title.trim(),
        category,
        content_html: contentHtml,
        author_name: authorName.trim(),
        status: 'draft',
        is_onboarding_required: false,
      });
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubmitAnother() {
    setTitle('');
    setCategory('daily_procedures');
    setContent('');
    setError('');
    setSubmitted(false);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 space-y-4 text-center">
        <div className="rounded-full bg-christina-green/10 p-5">
          <CheckCircle2 className="h-12 w-12 text-christina-green" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Submitted for Review</h2>
          <p className="text-muted-foreground mt-2 max-w-md">
            Your entry has been saved as a draft. Christina will review it and publish it to the team once it&apos;s ready.
          </p>
        </div>
        <Button
          onClick={handleSubmitAnother}
          className="bg-christina-red hover:bg-christina-red/90 text-white mt-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Submit Another Entry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Intro card */}
      <Card className="border-l-4 border-l-christina-yellow bg-christina-yellow/5">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-christina-coral mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium">Share what you know</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                You don&apos;t need perfect writing. Just share the procedure, tip, or info you&apos;d want a new teammate to have. Christina will review it before publishing.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">New Knowledge Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="kc-name">Your Name</Label>
              <Input
                id="kc-name"
                value={authorName}
                onChange={e => setAuthorName(e.target.value)}
                placeholder="e.g. Maria Santos"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="kc-title">Entry Title</Label>
              <Input
                id="kc-title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. How we handle a child who won&apos;t nap"
              />
              <p className="text-xs text-muted-foreground">
                Be specific so it&apos;s easy to find later.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="kc-category">Category</Label>
              <select
                id="kc-category"
                value={category}
                onChange={e => setCategory(e.target.value as KnowledgeCategory)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                {(Object.keys(CATEGORY_LABELS) as KnowledgeCategory[]).map(cat => (
                  <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                ))}
              </select>
              <div className="mt-1">
                <Badge className={CATEGORY_COLORS[category]}>
                  {CATEGORY_LABELS[category]}
                </Badge>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="kc-content">Content</Label>
              <Textarea
                id="kc-content"
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Write the steps, info, or procedure here. Plain language is perfect — no need for fancy formatting."
                className="min-h-[180px] text-sm leading-relaxed"
              />
              <p className="text-xs text-muted-foreground">
                Use blank lines to separate paragraphs. Christina can format it further after review.
              </p>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-christina-red hover:bg-christina-red/90 text-white"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : null}
              Submit for Review
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
