import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon } from 'lucide-react';

const events = [
  { date: 'Jan 27', title: 'Today', items: ['Noah - Bright Butterflies class', 'Ava - Rising Stars class'] },
  { date: 'Feb 5', title: 'Parent-Teacher Conferences', type: 'meeting', description: '4:00 PM - 7:00 PM' },
  { date: 'Feb 14', title: "Valentine's Day Party", type: 'event', description: 'Classroom celebrations' },
  { date: 'Feb 16', title: "Presidents' Day - Closed", type: 'holiday' },
  { date: 'Feb 20', title: 'Staff Development Day', type: 'meeting' },
  { date: 'Mar 1', title: 'Spring Re-enrollment Deadline', type: 'deadline' },
  { date: 'Mar 2', title: 'Dr. Seuss Week Begins', type: 'event' },
  { date: 'Mar 23', title: 'Spring Break', type: 'holiday' },
];

const typeColors: Record<string, string> = {
  meeting: 'bg-christina-blue',
  event: 'bg-christina-red',
  holiday: 'bg-christina-coral',
  deadline: 'bg-christina-yellow',
};

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Calendar</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" /> Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.map((event, i) => (
              <div key={i} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                <div className="text-center w-14 flex-shrink-0">
                  <p className="text-xs text-muted-foreground">{event.date.split(' ')[0]}</p>
                  <p className="text-lg font-bold">{event.date.split(' ')[1]}</p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {('type' in event) && event.type && <div className={`w-2 h-2 rounded-full ${typeColors[event.type] || 'bg-gray-400'}`} />}
                    <p className="font-medium text-sm">{event.title}</p>
                  </div>
                  {('description' in event) && event.description && <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>}
                  {('items' in event) && event.items && event.items.map((item) => <p key={item} className="text-xs text-muted-foreground">{item}</p>)}
                </div>
                {('type' in event) && event.type && (
                  <Badge variant="outline" className="text-xs h-fit capitalize">{event.type}</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
