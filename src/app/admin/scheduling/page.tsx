import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

const days = ['Mon 1/27', 'Tue 1/28', 'Wed 1/29', 'Thu 1/30', 'Fri 1/31'];

const staff = [
  { name: 'Maria Santos', role: 'Lead, Infants', shifts: ['7:00-3:00', '7:00-3:00', '7:00-3:00', '7:00-3:00', '7:00-3:00'] },
  { name: 'James Robinson', role: 'Lead, Toddlers', shifts: ['7:00-3:00', '7:00-3:00', '7:00-3:00', '7:00-3:00', 'OFF'] },
  { name: 'Sarah Mitchell', role: 'Lead, Toddlers', shifts: ['8:00-4:00', '8:00-4:00', '8:00-4:00', '8:00-4:00', '8:00-4:00'] },
  { name: 'Devon Park', role: 'Lead, Preschool', shifts: ['8:00-4:00', '8:00-4:00', '8:00-4:00', '8:00-4:00', '8:00-4:00'] },
  { name: 'Linda Chen', role: 'Lead, Preschool', shifts: ['9:00-5:00', '9:00-5:00', '9:00-5:00', '9:00-5:00', '9:00-5:00'] },
  { name: 'Marcus Johnson', role: 'Lead, School Age', shifts: ['10:00-6:00', '10:00-6:00', '10:00-6:00', '10:00-6:00', '10:00-6:00'] },
  { name: 'Patricia Hughes', role: 'Admin', shifts: ['8:00-4:00', '8:00-4:00', '8:00-4:00', '8:00-4:00', '8:00-4:00'] },
  { name: 'Christina Walker', role: 'Director', shifts: ['7:00-5:00', '7:00-5:00', '7:00-5:00', '7:00-5:00', '7:00-3:00'] },
];

export default function SchedulingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Staff Scheduling</h1>
        <p className="text-muted-foreground">Week of January 27, 2026</p>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium min-w-[180px]">Staff Member</th>
                {days.map(d => <th key={d} className="text-center p-3 font-medium min-w-[100px]">{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.name} className="border-b last:border-0">
                  <td className="p-3">
                    <p className="font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.role}</p>
                  </td>
                  {s.shifts.map((shift, i) => (
                    <td key={i} className="p-3 text-center">
                      {shift === 'OFF' ? (
                        <Badge variant="outline" className="text-xs text-muted-foreground">OFF</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Clock className="h-3 w-3" />{shift}
                        </Badge>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
