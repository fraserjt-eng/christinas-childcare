import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const children = [
  {
    name: 'Noah Brown', age: '3 years', dob: 'September 12, 2022', classroom: 'Bright Butterflies',
    teacher: 'Devon Park', enrolled: 'September 1, 2023', allergies: 'None',
    emergency: { name: 'Angela Brown', phone: '(217) 555-0204', relation: 'Mother' },
    milestones: ['Uses complete sentences', 'Counts to 15', 'Recognizes 10 letters', 'Zips jacket independently'],
  },
  {
    name: 'Ava Davis', age: '4 years', dob: 'January 25, 2022', classroom: 'Rising Stars',
    teacher: 'Linda Chen', enrolled: 'January 15, 2023', allergies: 'None',
    emergency: { name: 'Robert Davis', phone: '(217) 555-0205', relation: 'Father' },
    milestones: ['Recognizes written name', 'Counts to 30', 'Writes first name', 'Leads group activities'],
  },
];

export default function ChildrenPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Children</h1>
      <Tabs defaultValue="noah">
        <TabsList>
          <TabsTrigger value="noah">Noah Brown</TabsTrigger>
          <TabsTrigger value="ava">Ava Davis</TabsTrigger>
        </TabsList>
        {children.map((child, idx) => (
          <TabsContent key={child.name} value={idx === 0 ? 'noah' : 'ava'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-20 h-20 rounded-full bg-christina-blue/10 flex items-center justify-center">
                      <span className="font-heading font-bold text-christina-blue text-2xl">{child.name.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{child.name}</h2>
                      <p className="text-muted-foreground">{child.age}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-y-3 text-sm">
                    <span className="text-muted-foreground">Date of Birth</span><span>{child.dob}</span>
                    <span className="text-muted-foreground">Classroom</span><span>{child.classroom}</span>
                    <span className="text-muted-foreground">Teacher</span><span>{child.teacher}</span>
                    <span className="text-muted-foreground">Enrolled</span><span>{child.enrolled}</span>
                    <span className="text-muted-foreground">Allergies</span><span>{child.allergies}</span>
                  </div>
                </CardContent>
              </Card>
              <div className="space-y-6">
                <Card>
                  <CardHeader><CardTitle>Emergency Contact</CardTitle></CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p className="font-medium">{child.emergency.name}</p>
                    <p className="text-muted-foreground">{child.emergency.relation}</p>
                    <p>{child.emergency.phone}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Recent Milestones</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {child.milestones.map((m) => (
                        <div key={m} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-christina-red" />
                          <span className="text-sm">{m}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
