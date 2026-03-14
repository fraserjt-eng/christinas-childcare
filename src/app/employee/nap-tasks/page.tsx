'use client';
import { NapTimeTaskList } from '@/components/employee/NapTimeTaskList';
import { Moon } from 'lucide-react';
export default function NapTasksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Moon className="h-6 w-6" />
          Nap Time Tasks
        </h1>
        <p className="text-muted-foreground">Tasks to complete during quiet time (12:30-2:30 PM)</p>
      </div>
      <NapTimeTaskList />
    </div>
  );
}
