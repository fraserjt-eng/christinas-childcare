'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Mail, CheckCircle2, Clock, User, ArrowRight, Send } from 'lucide-react';
import { Tour, getTours, updateTour } from '@/lib/tour-storage';

function formatShortDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function daysSince(isoStr: string): number {
  return Math.floor((Date.now() - new Date(isoStr).getTime()) / (1000 * 60 * 60 * 24));
}

function buildFunnelData(tours: Tour[]) {
  const completed = tours.filter(t => t.status === 'completed').length;
  const followUpSent = tours.filter(t => t.status === 'completed' && t.follow_up_sent_at).length;
  // Approximate application received as 60% of follow-ups sent (demo data)
  const applicationReceived = Math.round(followUpSent * 0.6);

  return [
    { stage: 'Tour Completed', count: completed },
    { stage: 'Follow-up Sent', count: followUpSent },
    { stage: 'Application Received', count: applicationReceived },
  ];
}

const FOLLOW_UP_TEMPLATE = (parentName: string) => `
Hi ${parentName.split('&')[0].trim()},

Thank you so much for visiting Christina's Child Care Center today! It was wonderful to meet you and share what makes our program special.

If you have any questions after your visit, please don't hesitate to reach out. We're happy to discuss enrollment openings, tuition rates, or anything else on your mind.

To take the next step, you can complete an enrollment application at: [application link]

We hope to welcome your family soon!

Warm regards,
Christina's Child Care Center
`.trim();

export function TourFollowUp() {
  const [completedTours, setCompletedTours] = useState<Tour[]>([]);
  const [sending, setSending] = useState<string | null>(null);
  const [previewTour, setPreviewTour] = useState<Tour | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const tours = await getTours({ status: 'completed' });
    setCompletedTours(tours);
  }

  const pendingFollowUp = completedTours.filter(t => !t.follow_up_sent_at);
  const sentFollowUp = completedTours.filter(t => t.follow_up_sent_at);
  const funnelData = buildFunnelData(completedTours);

  async function handleSendFollowUp(tour: Tour) {
    setSending(tour.id);
    // Simulate a brief send delay
    await new Promise(r => setTimeout(r, 600));
    await updateTour(tour.id, { follow_up_sent_at: new Date().toISOString() });
    await load();
    setSending(null);
    if (previewTour?.id === tour.id) setPreviewTour(null);
  }

  return (
    <div className="space-y-6">
      {/* Conversion funnel chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-christina-red" />
            Conversion Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={funnelData} margin={{ top: 8, right: 16, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="stage"
                  tick={{ fontSize: 11 }}
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [value, 'Families']}
                  contentStyle={{ fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#C62828"
                  fill="#C62828"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-3">
            {funnelData.map((d, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl font-bold">{d.count}</p>
                <p className="text-xs text-muted-foreground">{d.stage}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending follow-ups */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4 text-christina-coral" />
            Needs Follow-up
            {pendingFollowUp.length > 0 && (
              <Badge className="bg-christina-coral text-white">
                {pendingFollowUp.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingFollowUp.length === 0 ? (
            <div className="text-center py-6 space-y-2">
              <CheckCircle2 className="h-8 w-8 text-christina-green mx-auto" />
              <p className="text-sm text-muted-foreground">All completed tours have received follow-ups.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingFollowUp.map(tour => (
                <div key={tour.id} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{tour.parent_name}</span>
                        {tour.feedback_score && (
                          <Badge variant="outline" className="text-xs">
                            {'★'.repeat(tour.feedback_score)} {tour.feedback_score}/5
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        <span>Toured {formatShortDate(tour.scheduled_date)}</span>
                        <span>{tour.center_name}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {daysSince(
                            new Date(tour.created_at).toISOString()
                          )} days ago
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPreviewTour(previewTour?.id === tour.id ? null : tour)}
                      >
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        className="bg-christina-red hover:bg-christina-red/90"
                        disabled={sending === tour.id}
                        onClick={() => handleSendFollowUp(tour)}
                      >
                        <Send className="h-3.5 w-3.5 mr-1.5" />
                        {sending === tour.id ? 'Sending...' : 'Send'}
                      </Button>
                    </div>
                  </div>

                  {previewTour?.id === tour.id && (
                    <div className="rounded-md bg-muted/40 border p-3">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">
                        EMAIL PREVIEW
                      </p>
                      <pre className="text-xs whitespace-pre-wrap font-sans text-foreground leading-relaxed">
                        {FOLLOW_UP_TEMPLATE(tour.parent_name)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Already sent */}
      {sentFollowUp.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-christina-green" />
              Follow-ups Sent ({sentFollowUp.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sentFollowUp.map(tour => (
                <div
                  key={tour.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-green-50/50 border border-green-100"
                >
                  <div>
                    <p className="font-medium text-sm">{tour.parent_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Toured {formatShortDate(tour.scheduled_date)} &middot; {tour.center_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-800 border-green-200 border text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Sent
                    </Badge>
                    {tour.follow_up_sent_at && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatShortDate(tour.follow_up_sent_at.split('T')[0])}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
