import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle } from 'lucide-react';

const classrooms = [
  { name: 'Little Stars', ageGroup: 'Infant', capacity: 8, present: 6, staffPresent: 2, requiredRatio: 4, color: '#FF7043' },
  { name: 'Busy Bees', ageGroup: 'Toddler', capacity: 12, present: 10, staffPresent: 2, requiredRatio: 5, color: '#FFD54F' },
  { name: 'Curious Cubs', ageGroup: 'Toddler', capacity: 12, present: 9, staffPresent: 2, requiredRatio: 5, color: '#FFD54F' },
  { name: 'Bright Butterflies', ageGroup: 'Preschool', capacity: 18, present: 12, staffPresent: 2, requiredRatio: 8, color: '#4CAF50' },
  { name: 'Rising Stars', ageGroup: 'Preschool', capacity: 20, present: 10, staffPresent: 1, requiredRatio: 10, color: '#4CAF50' },
  { name: 'Adventure Club', ageGroup: 'School Age', capacity: 15, present: 5, staffPresent: 1, requiredRatio: 12, color: '#2196F3' },
];

export default function RatiosPage() {
  const allCompliant = classrooms.every(c => c.present / c.staffPresent <= c.requiredRatio);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ratio Monitor</h1>
          <p className="text-muted-foreground">Real-time staff-to-child ratios</p>
        </div>
        <Badge className={allCompliant ? 'bg-christina-red text-white gap-1' : 'bg-christina-coral text-white gap-1'}>
          {allCompliant ? <><CheckCircle className="h-3 w-3" /> All Compliant</> : <><AlertTriangle className="h-3 w-3" /> Attention Needed</>}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classrooms.map((cls) => {
          const actualRatio = cls.present / cls.staffPresent;
          const compliant = actualRatio <= cls.requiredRatio;
          const percentage = (cls.present / cls.capacity) * 100;

          return (
            <Card key={cls.name}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold">{cls.name}</h3>
                    <p className="text-xs text-muted-foreground">{cls.ageGroup}</p>
                  </div>
                  <Badge className={compliant ? 'bg-christina-red text-white' : 'bg-christina-coral text-white'}>
                    {compliant ? 'OK' : 'Alert'}
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Children Present</span>
                    <span className="font-medium">{cls.present} / {cls.capacity}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="h-2 rounded-full" style={{ width: `${percentage}%`, backgroundColor: cls.color }} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Staff Present</span>
                    <span className="font-medium">{cls.staffPresent}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Required Ratio</span>
                    <span className="font-medium">1:{cls.requiredRatio}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Actual Ratio</span>
                    <span className={`font-bold ${compliant ? 'text-christina-red' : 'text-christina-coral'}`}>1:{actualRatio.toFixed(1)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
