'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Target, Eye, Heart, TrendingUp, TrendingDown, Lightbulb, AlertTriangle, Check, FileDown, ExternalLink } from 'lucide-react';

export default function StrategicPage() {
  const [mission, setMission] = useState('To provide a safe, nurturing, and enriching environment where every child can learn, grow, and thrive through play-based education and compassionate care.');
  const [vision, setVision] = useState('To be the premier child care center in Crystal, MN, known for excellence in early childhood education, family engagement, and innovative programming that prepares children for lifelong success.');
  const [values, setValues] = useState(['Safety & Well-being', 'Respect & Inclusion', 'Play-Based Learning', 'Family Partnership', 'Continuous Improvement', 'Community Connection']);
  const [saved, setSaved] = useState(true);

  const swot = {
    strengths: ['Experienced, dedicated staff', 'Strong community reputation', 'Play-based curriculum', 'High parent satisfaction', 'MN DCYF excellent rating'],
    weaknesses: ['Limited outdoor space', 'Aging facility infrastructure', 'Staff retention challenges', 'Manual administrative processes', 'Waitlist management'],
    opportunities: ['Second location expansion', 'CACFP program enrollment', 'Digital parent engagement', 'Partnership with local schools', 'Grant funding availability'],
    threats: ['Rising operational costs', 'Competition from franchise centers', 'Regulatory changes', 'Staff recruitment market', 'Economic uncertainty'],
  };

  const priorities = [
    { title: 'Digital Transformation', description: 'Implement comprehensive digital platform for parent engagement, operations, and curriculum management', timeline: 'Q1-Q2 2026', status: 'in_progress' },
    { title: 'Second Location Planning', description: 'Complete feasibility study and business plan for Center 2', timeline: 'Q2-Q3 2026', status: 'planned' },
    { title: 'Staff Development Program', description: 'Launch professional development program with mentoring and certification support', timeline: 'Q1-Q4 2026', status: 'planned' },
    { title: 'Facility Improvements', description: 'Upgrade outdoor play area and update infant room', timeline: 'Q3-Q4 2026', status: 'planned' },
  ];

  const pathways = [
    {
      name: 'Assess',
      desc: 'Diagnostics that reveal hidden patterns',
      details: 'SWOT analysis, organizational readiness audit, data review to see what you cannot yet see',
      icon: Eye,
    },
    {
      name: 'Learn',
      desc: 'Courses, certification, and intensive workshops',
      details: 'Mission/Vision/Values alignment, goal setting, strategy development through structured learning',
      icon: Lightbulb,
    },
    {
      name: 'Transform',
      desc: 'Coaching and consulting for leaders ready to do the work',
      details: 'Implementation plans, action timelines, 1:1 coaching, and continuous iteration',
      icon: TrendingUp,
    },
  ];

  const statusColors: Record<string, string> = { in_progress: 'bg-christina-blue text-white', planned: 'bg-muted text-muted-foreground', completed: 'bg-christina-red text-white' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Strategic Planning Workbook</h1>
          <p className="text-muted-foreground">Interior Architecture Framework — Assess, Learn, Transform</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2"><FileDown className="h-4 w-4" /> Export PDF</Button>
          <Button className="bg-christina-red hover:bg-christina-red/90 gap-2" onClick={() => setSaved(true)}>
            {saved ? <><Check className="h-4 w-4" /> Saved</> : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Consulting CTA Banner */}
      <Card className="bg-gradient-to-r from-christina-red/10 to-christina-blue/10 border-christina-red/30">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-lg mb-1">Work with Dr. Josh Fraser (Ed.D.)</h2>
              <p className="text-muted-foreground text-sm">A sitting practitioner and justice-centered leader with two decades of experience, Dr. Fraser created the Interior Architecture framework — a four-book series guiding organizations through Assess, Learn, and Transform pathways. Services include executive coaching, organizational consulting, and diagnostic tools.</p>
            </div>
            <a
              href="https://interior-architecture-six.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-christina-red text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-christina-red/90 transition-colors whitespace-nowrap"
            >
              Learn More <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Interior Architecture 3-Pathway Framework */}
      <Card>
        <CardContent className="p-6">
          <h2 className="font-bold mb-4">Interior Architecture Framework — Three Pathways</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pathways.map((pathway, i) => {
              const Icon = pathway.icon;
              const colors = [
                'bg-christina-blue/10 border-christina-blue/30 text-christina-blue',
                'bg-christina-coral/10 border-christina-coral/30 text-christina-coral',
                'bg-christina-red/10 border-christina-red/30 text-christina-red',
              ];
              const bgColors = ['bg-christina-blue', 'bg-christina-coral', 'bg-christina-red'];
              return (
                <div key={pathway.name} className={`p-5 rounded-lg border ${colors[i]}`}>
                  <div className={`w-10 h-10 rounded-full ${bgColors[i]} flex items-center justify-center mb-3`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-lg font-bold mb-1">{pathway.name}</p>
                  <p className="text-sm font-medium mb-2">{pathway.desc}</p>
                  <p className="text-xs text-muted-foreground">{pathway.details}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="mvv">
        <TabsList className="flex-wrap">
          <TabsTrigger value="mvv">Mission, Vision & Values</TabsTrigger>
          <TabsTrigger value="swot">SWOT Analysis</TabsTrigger>
          <TabsTrigger value="priorities">Priorities & Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="mvv" className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-christina-red" /> Mission Statement</CardTitle></CardHeader>
            <CardContent><Textarea value={mission} onChange={(e) => { setMission(e.target.value); setSaved(false); }} rows={3} className="text-base" /></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Eye className="h-5 w-5 text-christina-blue" /> Vision Statement</CardTitle></CardHeader>
            <CardContent><Textarea value={vision} onChange={(e) => { setVision(e.target.value); setSaved(false); }} rows={3} className="text-base" /></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5 text-christina-coral" /> Core Values</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {values.map((value, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-christina-red/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-christina-red font-bold text-sm">{i + 1}</span>
                    </div>
                    <Input value={value} onChange={(e) => { const v = [...values]; v[i] = e.target.value; setValues(v); setSaved(false); }} className="border-0 bg-transparent p-0 h-auto font-medium" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="swot">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {([
              { key: 'strengths', label: 'Strengths', icon: TrendingUp, color: 'bg-christina-green', textColor: 'text-christina-green' },
              { key: 'weaknesses', label: 'Weaknesses', icon: TrendingDown, color: 'bg-christina-coral', textColor: 'text-christina-coral' },
              { key: 'opportunities', label: 'Opportunities', icon: Lightbulb, color: 'bg-christina-blue', textColor: 'text-christina-blue' },
              { key: 'threats', label: 'Threats', icon: AlertTriangle, color: 'bg-christina-yellow', textColor: 'text-christina-yellow' },
            ] as const).map(({ key, label, icon: Icon, color }) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    {label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {swot[key].map(s => (
                      <li key={s} className="flex items-start gap-2 text-sm">
                        <div className={`w-1.5 h-1.5 rounded-full ${color} mt-2 flex-shrink-0`} />
                        {s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="priorities">
          <div className="space-y-4">
            {priorities.map((p, i) => (
              <Card key={p.title}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-christina-red/10 flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-christina-red">{i + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold">{p.title}</h3>
                        <Badge className={statusColors[p.status]}>{p.status.replace('_', ' ')}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{p.description}</p>
                      <Badge variant="outline" className="text-xs">{p.timeline}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
