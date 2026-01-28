'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Clock, Plus, BarChart3, Shuffle, ExternalLink } from 'lucide-react';

const sampleLessons = [
  { title: 'Rainbow Counting', ageGroup: 'Preschool', domain: 'Math', duration: 25, objectives: ['Count to 10 with objects', 'Color recognition'], materials: ['Colored bears', 'Number cards'] },
  { title: 'Letter Sound Safari', ageGroup: 'Preschool', domain: 'Literacy', duration: 30, objectives: ['Identify letter sounds', 'Vocabulary building'], materials: ['Letter cards', 'Animal figurines'] },
  { title: 'Texture Walk', ageGroup: 'Toddler', domain: 'Science', duration: 20, objectives: ['Sensory exploration', 'Descriptive language'], materials: ['Texture boards', 'Nature items'] },
  { title: 'Feelings Faces', ageGroup: 'Toddler', domain: 'Social-Emotional', duration: 15, objectives: ['Identify emotions', 'Practice empathy'], materials: ['Emotion cards', 'Mirror', 'Crayons'] },
  { title: 'Baby Beats', ageGroup: 'Infant', domain: 'Music', duration: 10, objectives: ['Respond to rhythm', 'Motor coordination'], materials: ['Shakers', 'Drum', 'Scarves'] },
  { title: 'Shape Builders', ageGroup: 'Preschool', domain: 'Math', duration: 25, objectives: ['Identify shapes', 'Spatial reasoning'], materials: ['Shape blocks', 'Pattern cards'] },
  { title: 'Story Retell', ageGroup: 'School Age', domain: 'Literacy', duration: 30, objectives: ['Narrative structure', 'Sequencing events'], materials: ['Picture books', 'Story cards', 'Journals'] },
  { title: 'Bug Detectives', ageGroup: 'School Age', domain: 'Science', duration: 35, objectives: ['Observation skills', 'Scientific inquiry'], materials: ['Magnifying glasses', 'Bug journals', 'Field guide'] },
  { title: 'Friendship Quilt', ageGroup: 'Preschool', domain: 'Social-Emotional', duration: 20, objectives: ['Collaboration', 'Self-expression'], materials: ['Fabric squares', 'Markers', 'Glue'] },
  { title: 'Water Play Discovery', ageGroup: 'Toddler', domain: 'Science', duration: 20, objectives: ['Cause and effect', 'Fine motor skills'], materials: ['Water table', 'Cups', 'Funnels'] },
];

const mockAnalytics = [
  { label: 'Lessons Created', value: 47 },
  { label: 'This Month', value: 8 },
  { label: 'Most Used Domain', value: 'Literacy' },
  { label: 'Avg Duration', value: '24 min' },
];

const domainOptions = ['Literacy', 'Math', 'Science', 'Social-Emotional', 'Music', 'Art', 'Physical', 'Language'];
const ageOptions = ['Infant', 'Toddler', 'Preschool', 'School Age'];

export default function LessonBuilderPage() {
  const [tab, setTab] = useState('new');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Lesson Builder</h1>
        <p className="text-muted-foreground">Create, manage, and remix lesson plans for all age groups.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="new" className="gap-1"><Plus className="h-3 w-3" /> New Lesson</TabsTrigger>
          <TabsTrigger value="library" className="gap-1"><BookOpen className="h-3 w-3" /> Library</TabsTrigger>
          <TabsTrigger value="remix" className="gap-1"><Shuffle className="h-3 w-3" /> Remix</TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1"><BarChart3 className="h-3 w-3" /> Analytics</TabsTrigger>
        </TabsList>

        {/* New Lesson Form */}
        <TabsContent value="new">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><BookOpen className="h-5 w-5 text-christina-red" /> Create New Lesson</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Lesson Title</label>
                  <Input placeholder="e.g., Rainbow Counting Adventure" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Age Group</label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select age group" /></SelectTrigger>
                    <SelectContent>
                      {ageOptions.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Learning Domain</label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select domain" /></SelectTrigger>
                    <SelectContent>
                      {domainOptions.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration (minutes)</label>
                  <Input type="number" placeholder="25" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Learning Objectives</label>
                <Textarea placeholder="Enter each objective on a new line..." rows={3} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Materials Needed</label>
                <Textarea placeholder="Enter each material on a new line..." rows={2} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Procedure</label>
                <Textarea placeholder="Step-by-step lesson procedure..." rows={5} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Assessment / How to Evaluate</label>
                <Textarea placeholder="How will you assess student learning?" rows={3} />
              </div>
              <Button className="bg-christina-red hover:bg-christina-red/90">Save Lesson</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Library */}
        <TabsContent value="library">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sampleLessons.map((lesson, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-sm">{lesson.title}</h3>
                    <Badge variant="outline" className="text-xs gap-1 shrink-0"><Clock className="h-3 w-3" /> {lesson.duration}m</Badge>
                  </div>
                  <div className="flex gap-2 mb-3">
                    <Badge className="bg-christina-red/10 text-christina-red text-xs">{lesson.ageGroup}</Badge>
                    <Badge variant="outline" className="text-xs">{lesson.domain}</Badge>
                  </div>
                  <div className="mb-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Objectives</p>
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      {lesson.objectives.map(o => <li key={o}>- {o}</li>)}
                    </ul>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {lesson.materials.map(m => <Badge key={m} variant="outline" className="text-xs">{m}</Badge>)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Remix */}
        <TabsContent value="remix">
          <Card>
            <CardHeader><CardTitle className="text-base">Remix an Existing Lesson</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Select a lesson from the library to adapt for a different age group, domain, or duration.</p>
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Base Lesson</label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Choose a lesson to remix" /></SelectTrigger>
                  <SelectContent>
                    {sampleLessons.map(l => <SelectItem key={l.title} value={l.title}>{l.title} ({l.ageGroup})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Age Group</label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select age group" /></SelectTrigger>
                    <SelectContent>
                      {ageOptions.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Duration (minutes)</label>
                  <Input type="number" placeholder="20" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Adaptation Notes</label>
                <Textarea placeholder="Describe how to adapt this lesson..." rows={4} />
              </div>
              <Button className="bg-christina-red hover:bg-christina-red/90">Generate Remix</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {mockAnalytics.map(stat => (
              <Card key={stat.label}>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-christina-red">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader><CardTitle className="text-base">Lessons by Domain</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { domain: 'Literacy', count: 14, pct: 30 },
                  { domain: 'Math', count: 10, pct: 21 },
                  { domain: 'Science', count: 8, pct: 17 },
                  { domain: 'Social-Emotional', count: 6, pct: 13 },
                  { domain: 'Music & Art', count: 5, pct: 11 },
                  { domain: 'Physical', count: 4, pct: 8 },
                ].map(d => (
                  <div key={d.domain} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-36">{d.domain}</span>
                    <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                      <div className="bg-christina-red h-full rounded-full transition-all" style={{ width: `${d.pct}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground w-16 text-right">{d.count} ({d.pct}%)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardHeader><CardTitle className="text-base">Monthly Lesson Creation</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-40">
                {[3, 5, 4, 7, 6, 8, 5, 9, 7, 6, 8, 4].map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-christina-red/80 rounded-t" style={{ height: `${(v / 9) * 100}%` }} />
                    <span className="text-xs text-muted-foreground">{['J','F','M','A','M','J','J','A','S','O','N','D'][i]}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground pt-4 border-t">
        Designed by Josh Fraser Ed.D. &bull;{' '}
        <a
          href="https://pd-session-builder.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-christina-red hover:underline"
        >
          PD Session Builder <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
