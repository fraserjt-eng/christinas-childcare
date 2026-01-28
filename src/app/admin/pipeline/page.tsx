'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UserPlus, Phone, Calendar, FileText, CheckCircle2, ArrowRight } from 'lucide-react'

interface PipelineItem {
  parentName: string
  childName: string
  childAge: string
  program: string
  dateAdded: string
}

const columns: { title: string; color: string; badgeClass: string; icon: React.ElementType; items: PipelineItem[] }[] = [
  {
    title: 'Inquiry',
    color: 'border-t-christina-red',
    badgeClass: 'bg-red-100 text-red-800',
    icon: Phone,
    items: [
      { parentName: 'Jennifer & Mark Thompson', childName: 'Ava Thompson', childAge: '8 months', program: 'Infant Care', dateAdded: 'Jan 20, 2026' },
      { parentName: 'Robert & Ana Garcia', childName: 'Diego Garcia', childAge: '2 years', program: 'Toddler', dateAdded: 'Jan 18, 2026' },
      { parentName: 'Michelle Davis', childName: 'Zoe Davis', childAge: '3 years', program: 'Preschool', dateAdded: 'Jan 22, 2026' },
    ],
  },
  {
    title: 'Tour Scheduled',
    color: 'border-t-blue-500',
    badgeClass: 'bg-blue-100 text-blue-800',
    icon: Calendar,
    items: [
      { parentName: 'Kevin & Priya Patel', childName: 'Arjun Patel', childAge: '18 months', program: 'Toddler', dateAdded: 'Jan 14, 2026' },
      { parentName: 'Sarah & Tom Wilson', childName: 'Ethan Wilson', childAge: '4 years', program: 'Preschool', dateAdded: 'Jan 12, 2026' },
    ],
  },
  {
    title: 'Paperwork',
    color: 'border-t-yellow-500',
    badgeClass: 'bg-yellow-100 text-yellow-800',
    icon: FileText,
    items: [
      { parentName: 'Laura & James Kim', childName: 'Mia Kim', childAge: '6 months', program: 'Infant Care', dateAdded: 'Jan 8, 2026' },
      { parentName: 'David & Rachel Nguyen', childName: 'Lucas Nguyen', childAge: '5 years', program: 'School Age', dateAdded: 'Jan 6, 2026' },
    ],
  },
  {
    title: 'Enrolled',
    color: 'border-t-green-500',
    badgeClass: 'bg-green-100 text-green-800',
    icon: CheckCircle2,
    items: [
      { parentName: 'Amanda & Chris Brown', childName: 'Olivia Brown', childAge: '3 years', program: 'Preschool', dateAdded: 'Jan 2, 2026' },
      { parentName: 'Jessica & Matt Lee', childName: 'Noah Lee', childAge: '1 year', program: 'Toddler', dateAdded: 'Dec 28, 2025' },
    ],
  },
]

export default function EnrollmentPipelinePage() {
  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserPlus className="h-8 w-8 text-christina-red" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Enrollment Pipeline</h1>
            <p className="text-muted-foreground">Track prospective families from inquiry to enrollment</p>
          </div>
        </div>
        <Button className="bg-christina-red hover:bg-christina-red/90">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Inquiry
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
        {columns.map((col) => (
          <div key={col.title} className="min-w-[300px] flex-1 snap-start">
            <div className={"rounded-lg border-t-4 " + col.color + " bg-muted/30 p-4 space-y-3"}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <col.icon className="h-4 w-4" />
                  <h2 className="font-semibold">{col.title}</h2>
                </div>
                <Badge className={col.badgeClass}>{col.items.length}</Badge>
              </div>

              <div className="space-y-3">
                {col.items.map((item) => (
                  <Card key={item.childName} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium text-sm">{item.childName}</h3>
                        <Badge variant="outline" className="text-xs">{item.childAge}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.parentName}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">{item.program}</Badge>
                        <span className="text-xs text-muted-foreground">{item.dateAdded}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pipeline Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {columns.map((col, i) => (
              <div key={col.title} className="flex items-center gap-2">
                <div className="text-center">
                  <div className="text-2xl font-bold">{col.items.length}</div>
                  <div className="text-xs text-muted-foreground">{col.title}</div>
                </div>
                {i < columns.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground mx-2" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
