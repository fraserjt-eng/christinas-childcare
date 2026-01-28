import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Baby, ClipboardCheck, AlertTriangle, TrendingUp, UtensilsCrossed } from 'lucide-react';

const stats = [
  { label: 'Children Present', value: '52', subtitle: 'of 65 enrolled', icon: Baby, color: 'text-christina-red' },
  { label: 'Staff On Duty', value: '7', subtitle: 'of 8 total', icon: Users, color: 'text-christina-blue' },
  { label: 'Attendance Rate', value: '80%', subtitle: 'Today', icon: ClipboardCheck, color: 'text-christina-coral' },
  { label: 'Meals Served', value: '186', subtitle: 'Breakfast complete', icon: UtensilsCrossed, color: 'text-christina-yellow' },
];

const ratios = [
  { classroom: 'Little Stars', ageGroup: 'Infant', present: 6, staff: 2, required: '1:4', actual: '1:3', compliant: true },
  { classroom: 'Busy Bees', ageGroup: 'Toddler', present: 10, staff: 2, required: '1:5', actual: '1:5', compliant: true },
  { classroom: 'Curious Cubs', ageGroup: 'Toddler', present: 9, staff: 2, required: '1:5', actual: '1:4.5', compliant: true },
  { classroom: 'Bright Butterflies', ageGroup: 'Preschool', present: 12, staff: 2, required: '1:8', actual: '1:6', compliant: true },
  { classroom: 'Rising Stars', ageGroup: 'Preschool', present: 10, staff: 1, required: '1:10', actual: '1:10', compliant: true },
  { classroom: 'Adventure Club', ageGroup: 'School Age', present: 5, staff: 1, required: '1:12', actual: '1:5', compliant: true },
];

const alerts = [
  { message: 'Ava Davis immunization records need updating', type: 'warning' },
  { message: 'New enrollment inquiry from Jennifer Lee', type: 'info' },
  { message: 'Staff development day scheduled Feb 20', type: 'info' },
];

export default function AdminOverview() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Operations Dashboard</h1>
          <p className="text-muted-foreground">Monday, January 27, 2026</p>
        </div>
        <Badge variant="outline" className="gap-1 text-christina-red border-christina-red/30">
          <div className="w-2 h-2 rounded-full bg-christina-red animate-pulse" /> Center Open
        </Badge>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts */}
      <Card>
        <CardHeader><CardTitle className="text-base">Alerts & Notifications</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                {alert.type === 'warning' ? (
                  <AlertTriangle className="h-4 w-4 text-christina-coral mt-0.5" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-christina-blue mt-0.5" />
                )}
                <span className="text-sm">{alert.message}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ratio Monitor */}
      <Card>
        <CardHeader><CardTitle className="text-base">Staff-to-Child Ratio Monitor</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Classroom</th>
                  <th className="text-left p-2 font-medium">Age Group</th>
                  <th className="text-center p-2 font-medium">Children</th>
                  <th className="text-center p-2 font-medium">Staff</th>
                  <th className="text-center p-2 font-medium">Required</th>
                  <th className="text-center p-2 font-medium">Actual</th>
                  <th className="text-center p-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {ratios.map((r) => (
                  <tr key={r.classroom} className="border-b last:border-0">
                    <td className="p-2 font-medium">{r.classroom}</td>
                    <td className="p-2 text-muted-foreground">{r.ageGroup}</td>
                    <td className="p-2 text-center">{r.present}</td>
                    <td className="p-2 text-center">{r.staff}</td>
                    <td className="p-2 text-center">{r.required}</td>
                    <td className="p-2 text-center">{r.actual}</td>
                    <td className="p-2 text-center">
                      <Badge className={r.compliant ? 'bg-christina-red text-white' : 'bg-christina-coral text-white'}>
                        {r.compliant ? 'Compliant' : 'Alert'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
