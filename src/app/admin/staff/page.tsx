'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Users, Clock } from 'lucide-react'

const staffMembers = [
  { name: 'Ophelia Zeogar', initials: 'OZ', role: 'Owner / Director', hireDate: 'Jan 2018', certifications: ['CPR/First Aid', 'CDA', 'MN Director Qualified'], weeklyHours: 45, color: 'bg-christina-red' },
  { name: 'Stephen Zeogar', initials: 'SZ', role: 'Owner', hireDate: 'Jan 2018', certifications: ['Business Management'], weeklyHours: 30, color: 'bg-slate-600' },
  { name: 'Christina Fraser', initials: 'CF', role: 'Assistant Director', hireDate: 'Mar 2019', certifications: ['CPR/First Aid', 'CDA', 'B.S. Early Childhood Education'], weeklyHours: 40, color: 'bg-christina-red' },
  { name: 'Maria Santos', initials: 'MS', role: 'Lead Teacher - Infants', hireDate: 'Jun 2020', certifications: ['CPR/First Aid', 'CDA'], weeklyHours: 40, color: 'bg-pink-500' },
  { name: 'James Robinson', initials: 'JR', role: 'Lead Teacher - Toddlers', hireDate: 'Aug 2020', certifications: ['CPR/First Aid'], weeklyHours: 40, color: 'bg-blue-500' },
  { name: 'Sarah Kim', initials: 'SK', role: 'Teacher - Preschool', hireDate: 'Jan 2021', certifications: ['CPR/First Aid', 'CDA'], weeklyHours: 40, color: 'bg-purple-500' },
  { name: 'David Chen', initials: 'DC', role: 'Teacher - School Age', hireDate: 'Sep 2021', certifications: ['CPR/First Aid'], weeklyHours: 35, color: 'bg-green-600' },
  { name: 'Lisa Johnson', initials: 'LJ', role: 'Teacher Aide', hireDate: 'Mar 2022', certifications: ['CPR/First Aid'], weeklyHours: 32, color: 'bg-amber-500' },
]

export default function StaffDirectoryPage() {
  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-8 w-8 text-christina-red" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Staff Directory</h1>
          <p className="text-muted-foreground">Manage team members and schedules</p>
        </div>
      </div>

      <Tabs defaultValue="profiles">
        <TabsList>
          <TabsTrigger value="profiles">Profiles</TabsTrigger>
          <TabsTrigger value="schedule">Schedule Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="profiles" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {staffMembers.map((staff) => (
              <Card key={staff.name} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className={staff.color + " text-white text-lg font-semibold"}>
                        {staff.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{staff.name}</h3>
                      <p className="text-sm text-muted-foreground">{staff.role}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Since {staff.hireDate}</span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-1">
                      {staff.certifications.map((cert) => (
                        <Badge key={cert} variant="secondary" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-christina-red" />
                Weekly Hours Overview
              </CardTitle>
              <CardDescription>Scheduled hours per staff member this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {staffMembers.map((staff) => (
                  <div key={staff.name} className="flex items-center gap-4">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={staff.color + " text-white text-xs"}>
                        {staff.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{staff.name}</p>
                      <p className="text-xs text-muted-foreground">{staff.role}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 md:w-48 bg-muted rounded-full h-2.5">
                        <div
                          className="bg-christina-red h-2.5 rounded-full"
                          style={{ width: ((staff.weeklyHours / 45) * 100) + "%" }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">
                        {staff.weeklyHours}h
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
