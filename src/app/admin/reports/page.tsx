'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ClipboardList, Utensils, Moon, Palette, Heart } from 'lucide-react'

const childReports = [
  {
    name: 'Emma W.',
    initials: 'EW',
    classroom: 'Toddler',
    meals: {
      breakfast: { item: 'Oatmeal with berries', amount: 'Most' },
      lunch: { item: 'Chicken nuggets, peas, applesauce', amount: 'All' },
      snack: { item: 'Goldfish crackers, milk', amount: 'Some' },
    },
    nap: { start: '12:30 PM', end: '2:15 PM', quality: 'Slept well' },
    activities: ['Circle time', 'Finger painting', 'Outdoor play', 'Block building'],
    mood: 'Happy and engaged all day. Shared toys nicely during free play.',
    moodBadge: 'Great Day',
  },
  {
    name: 'Liam S.',
    initials: 'LS',
    classroom: 'Preschool',
    meals: {
      breakfast: { item: 'Scrambled eggs, toast', amount: 'All' },
      lunch: { item: 'Mac and cheese, green beans', amount: 'Most' },
      snack: { item: 'Apple slices, cheese', amount: 'All' },
    },
    nap: { start: '1:00 PM', end: '2:00 PM', quality: 'Restless, woke once' },
    activities: ['Letter recognition', 'Playdough', 'Story time', 'Music and movement'],
    mood: 'A bit tired in the morning but perked up after snack. Loved music time!',
    moodBadge: 'Good Day',
  },
  {
    name: 'Sofia M.',
    initials: 'SM',
    classroom: 'Infant',
    meals: {
      breakfast: { item: 'Formula 6oz', amount: 'All' },
      lunch: { item: 'Pureed sweet potato, formula 5oz', amount: 'Most' },
      snack: { item: 'Formula 4oz, puffs', amount: 'All' },
    },
    nap: { start: '10:00 AM', end: '11:30 AM', quality: 'Morning nap, plus 2:00-3:15 PM' },
    activities: ['Tummy time', 'Sensory play', 'Peek-a-boo', 'Soft music'],
    mood: 'Content and curious. Reached for new toys during sensory play. Smiling lots!',
    moodBadge: 'Great Day',
  },
]

const classrooms = ['All', 'Infant', 'Toddler', 'Preschool', 'School Age']

export default function DailyReportsPage() {
  const [selectedClassroom, setSelectedClassroom] = useState('All')
  const [selectedDate] = useState('2026-01-27')

  const filtered = selectedClassroom === 'All'
    ? childReports
    : childReports.filter((c) => c.classroom === selectedClassroom)

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardList className="h-8 w-8 text-christina-red" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Daily Reports</h1>
          <p className="text-muted-foreground">Per-child activity logs and updates</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="w-full sm:w-48">
          <input
            type="date"
            defaultValue={selectedDate}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <Select value={selectedClassroom} onValueChange={setSelectedClassroom}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by classroom" />
          </SelectTrigger>
          <SelectContent>
            {classrooms.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6">
        {filtered.map((child) => (
          <Card key={child.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-christina-red flex items-center justify-center text-white font-semibold text-sm">
                    {child.initials}
                  </div>
                  <div>
                    <CardTitle>{child.name}</CardTitle>
                    <CardDescription>{child.classroom} Room</CardDescription>
                  </div>
                </div>
                <Badge className={child.moodBadge === 'Great Day' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                  {child.moodBadge}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Utensils className="h-4 w-4 text-christina-red" />
                    Meals
                  </div>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Breakfast:</span> {child.meals.breakfast.item} <Badge variant="outline" className="text-xs ml-1">{child.meals.breakfast.amount}</Badge></p>
                    <p><span className="font-medium">Lunch:</span> {child.meals.lunch.item} <Badge variant="outline" className="text-xs ml-1">{child.meals.lunch.amount}</Badge></p>
                    <p><span className="font-medium">Snack:</span> {child.meals.snack.item} <Badge variant="outline" className="text-xs ml-1">{child.meals.snack.amount}</Badge></p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Moon className="h-4 w-4 text-christina-red" />
                    Nap Time
                  </div>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Start:</span> {child.nap.start}</p>
                    <p><span className="font-medium">End:</span> {child.nap.end}</p>
                    <p className="text-muted-foreground">{child.nap.quality}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Palette className="h-4 w-4 text-christina-red" />
                    Activities
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {child.activities.map((a) => (
                      <Badge key={a} variant="secondary" className="text-xs">{a}</Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Heart className="h-4 w-4 text-christina-red" />
                    Mood & Behavior
                  </div>
                  <p className="text-sm text-muted-foreground">{child.mood}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
