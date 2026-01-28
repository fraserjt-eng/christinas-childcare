'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UtensilsCrossed, Check } from 'lucide-react';

const classrooms = ['Little Stars', 'Busy Bees', 'Curious Cubs', 'Bright Butterflies', 'Rising Stars', 'Adventure Club'];
const meals = ['Breakfast', 'AM Snack', 'Lunch', 'PM Snack'];

const initialCounts: Record<string, Record<string, number>> = {
  'Little Stars': { 'Breakfast': 6, 'AM Snack': 0, 'Lunch': 0, 'PM Snack': 0 },
  'Busy Bees': { 'Breakfast': 10, 'AM Snack': 0, 'Lunch': 0, 'PM Snack': 0 },
  'Curious Cubs': { 'Breakfast': 9, 'AM Snack': 0, 'Lunch': 0, 'PM Snack': 0 },
  'Bright Butterflies': { 'Breakfast': 15, 'AM Snack': 0, 'Lunch': 0, 'PM Snack': 0 },
  'Rising Stars': { 'Breakfast': 17, 'AM Snack': 0, 'Lunch': 0, 'PM Snack': 0 },
  'Adventure Club': { 'Breakfast': 8, 'AM Snack': 0, 'Lunch': 0, 'PM Snack': 0 },
};

export default function FoodCountsPage() {
  const [counts, setCounts] = useState(initialCounts);
  const [saved, setSaved] = useState(false);

  function updateCount(classroom: string, meal: string, value: string) {
    setCounts(prev => ({
      ...prev,
      [classroom]: { ...prev[classroom], [meal]: parseInt(value) || 0 }
    }));
    setSaved(false);
  }

  const totals = meals.reduce((acc, meal) => {
    acc[meal] = classrooms.reduce((sum, cls) => sum + (counts[cls]?.[meal] || 0), 0);
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Food Counts (CACFP)</h1>
          <p className="text-muted-foreground">Monday, January 27, 2026</p>
        </div>
        <Button className="bg-christina-red hover:bg-christina-red/90 gap-2" onClick={() => setSaved(true)}>
          {saved ? <><Check className="h-4 w-4" /> Saved</> : 'Save Counts'}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">Classroom</th>
                {meals.map(m => <th key={m} className="text-center p-3 font-medium">{m}</th>)}
              </tr>
            </thead>
            <tbody>
              {classrooms.map((cls) => (
                <tr key={cls} className="border-b last:border-0">
                  <td className="p-3 font-medium">{cls}</td>
                  {meals.map((meal) => (
                    <td key={meal} className="p-3 text-center">
                      <Input
                        type="number"
                        min="0"
                        value={counts[cls]?.[meal] || 0}
                        onChange={(e) => updateCount(cls, meal, e.target.value)}
                        className="w-16 mx-auto text-center"
                      />
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-muted/30 font-bold">
                <td className="p-3">Totals</td>
                {meals.map(m => <td key={m} className="p-3 text-center">{totals[m]}</td>)}
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <UtensilsCrossed className="h-4 w-4 text-christina-red" />
            <span className="font-medium text-sm">Today&apos;s Summary</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Total meals served today: <strong>{Object.values(totals).reduce((a, b) => a + b, 0)}</strong> across {classrooms.length} classrooms.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
