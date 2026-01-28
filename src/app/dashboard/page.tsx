import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, FileText, Camera, Bell, Clock } from 'lucide-react';
import Link from 'next/link';

const children = [
  { name: 'Noah Brown', classroom: 'Bright Butterflies', teacher: 'Devon Park', age: '3 years', status: 'Checked in at 8:15 AM' },
  { name: 'Ava Davis', classroom: 'Rising Stars', teacher: 'Linda Chen', age: '4 years', status: 'Checked in at 7:50 AM' },
];

const updates = [
  { title: 'Progress Report Available', description: 'January report for Noah is ready to view', time: '2 hours ago', type: 'report' },
  { title: 'New Photos Added', description: '5 new photos from art time in Bright Butterflies', time: '4 hours ago', type: 'photo' },
  { title: 'Upcoming Event', description: "Valentine's Day Party - February 14th", time: '1 day ago', type: 'event' },
  { title: 'Document Reminder', description: "Ava's immunization records due for update", time: '3 days ago', type: 'document' },
];

export default function ParentDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, Parent!</h1>
        <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your children today.</p>
      </div>

      {/* Children Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children.map((child) => (
          <Card key={child.name}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-christina-blue/10 flex items-center justify-center">
                  <span className="font-heading font-bold text-christina-blue text-lg">{child.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{child.name}</h3>
                  <p className="text-sm text-muted-foreground">{child.classroom} &middot; {child.teacher}</p>
                  <Badge variant="outline" className="mt-2 gap-1 text-christina-red border-christina-red/30">
                    <Clock className="h-3 w-3" /> {child.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: '/dashboard/children', label: 'My Children', icon: Users, color: 'bg-christina-red' },
          { href: '/dashboard/progress', label: 'Progress', icon: FileText, color: 'bg-christina-blue' },
          { href: '/dashboard/photos', label: 'Photos', icon: Camera, color: 'bg-christina-coral' },
          { href: '/dashboard/calendar', label: 'Calendar', icon: Calendar, color: 'bg-christina-yellow' },
        ].map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <div className={`w-10 h-10 rounded-lg ${link.color} flex items-center justify-center mx-auto mb-2`}>
                  <link.icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-sm font-medium">{link.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Updates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> Recent Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {updates.map((update, i) => (
              <div key={i} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0">
                <div className={`w-2 h-2 rounded-full mt-2 ${update.type === 'report' ? 'bg-christina-red' : update.type === 'photo' ? 'bg-christina-blue' : update.type === 'event' ? 'bg-christina-coral' : 'bg-christina-yellow'}`} />
                <div className="flex-1">
                  <p className="font-medium text-sm">{update.title}</p>
                  <p className="text-sm text-muted-foreground">{update.description}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{update.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
