import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Phone } from 'lucide-react';

interface Inquiry {
  name: string;
  child: string;
  age: string;
  program: string;
  email: string;
  phone: string;
  date: string;
  status: string;
  message: string;
}

const inquiries: Inquiry[] = [];

const statusColors: Record<string, string> = {
  new: 'bg-christina-coral text-white',
  contacted: 'bg-christina-blue text-white',
  toured: 'bg-christina-red text-white',
  enrolled: 'bg-christina-red text-white',
  declined: 'bg-gray-400 text-white',
};

export default function InquiriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Enrollment Inquiries</h1>
        <p className="text-muted-foreground">{inquiries.length} inquiries</p>
      </div>
      <div className="space-y-4">
        {inquiries.length === 0 && (
          <Card>
            <CardContent className="p-10 text-center text-muted-foreground">
              No enrollment inquiries yet. New inquiries will appear here.
            </CardContent>
          </Card>
        )}
        {inquiries.map((inq) => (
          <Card key={inq.email}>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">{inq.name}</h3>
                    <Badge className={statusColors[inq.status]}>{inq.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Child: {inq.child} ({inq.age}) &middot; Program: {inq.program} &middot; Submitted: {inq.date}
                  </p>
                  {inq.message && <p className="text-sm bg-muted/50 p-3 rounded-lg">&ldquo;{inq.message}&rdquo;</p>}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1"><Mail className="h-3 w-3" /> Email</Button>
                  <Button size="sm" variant="outline" className="gap-1"><Phone className="h-3 w-3" /> Call</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
