'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, Award, Users, AlertTriangle, Calendar, CheckCircle2, Clock } from 'lucide-react'

const ratioCards = [
  { room: 'Infant Room', current: '3 children : 1 staff', required: '4:1', ratio: 3/1, max: 4/1, status: 'Compliant' },
  { room: 'Toddler Room', current: '6 children : 1 staff', required: '7:1', ratio: 6/1, max: 7/1, status: 'Compliant' },
  { room: 'Preschool Room', current: '9 children : 1 staff', required: '10:1', ratio: 9/1, max: 10/1, status: 'Compliant' },
  { room: 'School Age Room', current: '12 children : 1 staff', required: '15:1', ratio: 12/1, max: 15/1, status: 'Compliant' },
]

const trainingTracker = [
  { name: 'Ophelia Zeogar', required: 16, completed: 16, status: 'Complete' },
  { name: 'Christina Fraser', required: 16, completed: 14, status: 'In Progress' },
  { name: 'Maria Santos', required: 16, completed: 16, status: 'Complete' },
  { name: 'James Robinson', required: 16, completed: 10, status: 'In Progress' },
  { name: 'Sarah Kim', required: 16, completed: 16, status: 'Complete' },
  { name: 'David Chen', required: 16, completed: 8, status: 'Due Soon' },
  { name: 'Lisa Johnson', required: 16, completed: 12, status: 'In Progress' },
]

const deadlines = [
  { task: 'Monthly Fire Drill', due: 'Feb 1, 2026', status: 'Due Soon', icon: 'AlertTriangle' },
  { task: 'Health & Safety Inspection', due: 'Mar 15, 2026', status: 'Scheduled', icon: 'Calendar' },
  { task: 'CPR Renewal - James Robinson', due: 'Apr 20, 2026', status: 'Upcoming', icon: 'Clock' },
  { task: 'CPR Renewal - David Chen', due: 'May 5, 2026', status: 'Upcoming', icon: 'Clock' },
  { task: 'Annual License Renewal', due: 'Dec 1, 2026', status: 'On Track', icon: 'CheckCircle2' },
]

function getStatusBadge(status: string) {
  switch (status) {
    case 'Complete':
    case 'Compliant':
    case 'On Track':
      return 'bg-green-100 text-green-800'
    case 'Due Soon':
      return 'bg-yellow-100 text-yellow-800'
    case 'In Progress':
    case 'Scheduled':
    case 'Upcoming':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function ComplianceDashboardPage() {
  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-8 w-8 text-christina-red" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Compliance Dashboard</h1>
          <p className="text-muted-foreground">License, ratios, training, and deadlines</p>
        </div>
      </div>

      {/* License Status */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-christina-red" />
              <CardTitle>License Status</CardTitle>
            </div>
            <Badge className="bg-green-100 text-green-800 text-sm">Active</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">License Number</p>
              <p className="font-semibold">MN DHS #CF-12345</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <p className="font-semibold">Child Care Center</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expires</p>
              <p className="font-semibold">December 1, 2026</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ratio Compliance */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Users className="h-5 w-5 text-christina-red" />
          Ratio Compliance
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ratioCards.map((room) => (
            <Card key={room.room}>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <h3 className="font-semibold">{room.room}</h3>
                  <p className="text-lg font-bold">{room.current}</p>
                  <p className="text-xs text-muted-foreground">Required: {room.required}</p>
                  <Badge className="bg-green-100 text-green-800">{room.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Training Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-christina-red" />
            Training Hours Tracker
          </CardTitle>
          <CardDescription>MN requires 16 hours of annual training per staff member</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trainingTracker.map((staff) => (
              <div key={staff.name} className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{staff.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className={"h-2 rounded-full " + (staff.status === 'Complete' ? 'bg-green-500' : staff.status === 'Due Soon' ? 'bg-yellow-500' : 'bg-blue-500')}
                        style={{ width: String(Math.min((staff.completed / staff.required) * 100, 100)) + '%' }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-16 text-right">{staff.completed}/{staff.required} hrs</span>
                  </div>
                </div>
                <Badge className={getStatusBadge(staff.status)}>{staff.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-christina-red" />
            Upcoming Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {deadlines.map((d) => (
              <div key={d.task} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  {d.status === 'Due Soon' ? <AlertTriangle className="h-4 w-4 text-yellow-500" /> : d.status === 'Scheduled' ? <Calendar className="h-4 w-4 text-blue-500" /> : d.status === 'On Track' ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Clock className="h-4 w-4 text-blue-400" />}
                  <div>
                    <p className="text-sm font-medium">{d.task}</p>
                    <p className="text-xs text-muted-foreground">{d.due}</p>
                  </div>
                </div>
                <Badge className={getStatusBadge(d.status)}>{d.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
