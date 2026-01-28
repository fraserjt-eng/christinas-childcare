import { Card, CardContent } from '@/components/ui/card';
import { Camera } from 'lucide-react';

const photoSets = [
  { date: 'January 24, 2026', classroom: 'Bright Butterflies', count: 5, description: 'Art time - painting with sponges' },
  { date: 'January 22, 2026', classroom: 'Rising Stars', count: 8, description: 'Outdoor winter nature walk' },
  { date: 'January 20, 2026', classroom: 'Bright Butterflies', count: 4, description: 'Building block tower challenge' },
  { date: 'January 17, 2026', classroom: 'Rising Stars', count: 6, description: 'Music and movement circle time' },
  { date: 'January 15, 2026', classroom: 'Bright Butterflies', count: 3, description: 'Story time with puppets' },
];

const colors = ['bg-christina-coral/20', 'bg-christina-blue/20', 'bg-christina-red/20', 'bg-christina-yellow/20'];

export default function PhotosPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Photo Gallery</h1>
      <p className="text-muted-foreground">Photos from your children&apos;s classrooms.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {photoSets.map((set, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer">
            <div className={`h-40 ${colors[i % colors.length]} flex items-center justify-center rounded-t-lg`}>
              <Camera className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <CardContent className="p-4">
              <p className="font-medium text-sm">{set.description}</p>
              <p className="text-xs text-muted-foreground mt-1">{set.classroom} &middot; {set.date}</p>
              <p className="text-xs text-muted-foreground">{set.count} photos</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
