import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const reports = [
  {
    child: 'Noah Brown', period: 'January 2026', teacher: 'Devon Park', date: 'Jan 15, 2026',
    milestones: [
      { area: 'Language', milestone: 'Uses complete sentences', status: 'achieved' as const },
      { area: 'Social', milestone: 'Shares with peers independently', status: 'developing' as const },
      { area: 'Motor', milestone: 'Holds pencil with correct grip', status: 'achieved' as const },
      { area: 'Cognitive', milestone: 'Counts to 20', status: 'developing' as const },
      { area: 'Creative', milestone: 'Draws recognizable figures', status: 'emerging' as const },
    ],
    notes: 'Noah is making wonderful progress. He loves story time and is beginning to retell stories with increasing detail.',
  },
  {
    child: 'Ava Davis', period: 'January 2026', teacher: 'Linda Chen', date: 'Jan 15, 2026',
    milestones: [
      { area: 'Language', milestone: 'Recognizes written name', status: 'achieved' as const },
      { area: 'Social', milestone: 'Leads group activities', status: 'achieved' as const },
      { area: 'Motor', milestone: 'Cuts with scissors on a line', status: 'developing' as const },
      { area: 'Cognitive', milestone: 'Sorts by multiple attributes', status: 'achieved' as const },
      { area: 'Creative', milestone: 'Creates detailed artwork', status: 'developing' as const },
    ],
    notes: 'Ava is a natural leader in the classroom. She helps younger friends and shows great enthusiasm for learning.',
  },
];

const statusColors = {
  achieved: 'bg-christina-red text-white',
  developing: 'bg-christina-blue text-white',
  emerging: 'bg-christina-yellow text-foreground',
};

export default function ProgressPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Progress Reports</h1>
      <div className="space-y-6">
        {reports.map((report) => (
          <Card key={`${report.child}-${report.period}`}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle>{report.child}</CardTitle>
                  <p className="text-sm text-muted-foreground">{report.period} &middot; {report.teacher}</p>
                </div>
                <Badge variant="outline">{report.date}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {report.milestones.map((m) => (
                  <div key={m.milestone} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                    <Badge className={`${statusColors[m.status]} text-xs`}>{m.status}</Badge>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">{m.area}</p>
                      <p className="text-sm">{m.milestone}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm font-medium mb-1">Teacher Notes</p>
                <p className="text-sm text-muted-foreground">{report.notes}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
