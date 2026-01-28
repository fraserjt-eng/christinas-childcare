import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Download, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const documents = [
  { name: 'Enrollment Agreement - Noah', type: 'Enrollment', date: 'Sep 1, 2023', status: 'current' },
  { name: 'Enrollment Agreement - Ava', type: 'Enrollment', date: 'Jan 15, 2023', status: 'current' },
  { name: 'Immunization Records - Noah', type: 'Medical', date: 'Aug 15, 2025', status: 'current' },
  { name: 'Immunization Records - Ava', type: 'Medical', date: 'Jun 10, 2025', status: 'needs_update' },
  { name: 'Emergency Contact Form - Noah', type: 'Emergency', date: 'Sep 1, 2023', status: 'current' },
  { name: 'Emergency Contact Form - Ava', type: 'Emergency', date: 'Jan 15, 2023', status: 'current' },
  { name: 'Photo Release Consent', type: 'Consent', date: 'Sep 1, 2023', status: 'current' },
  { name: 'Allergy Action Plan - Noah', type: 'Medical', date: 'Sep 1, 2023', status: 'current' },
];

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Documents</h1>
        <Button className="bg-christina-red hover:bg-christina-red/90 gap-2">
          <Upload className="h-4 w-4" /> Upload
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {documents.map((doc) => (
              <div key={doc.name} className="flex items-center gap-4 p-4 hover:bg-muted/50">
                <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">{doc.type} &middot; {doc.date}</p>
                </div>
                {doc.status === 'needs_update' && (
                  <Badge variant="outline" className="text-christina-coral border-christina-coral/30 gap-1">
                    <AlertCircle className="h-3 w-3" /> Update needed
                  </Badge>
                )}
                <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
