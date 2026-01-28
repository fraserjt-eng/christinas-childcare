'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogIn, LogOut } from 'lucide-react';

const initialAttendance = [
  { id: '1', name: 'Emma Thompson', classroom: 'Little Stars', checkIn: '7:45 AM', checkOut: '', checkedBy: 'David Thompson' },
  { id: '2', name: 'Liam Garcia', classroom: 'Busy Bees', checkIn: '8:00 AM', checkOut: '', checkedBy: 'Sofia Garcia' },
  { id: '3', name: 'Olivia Williams', classroom: 'Curious Cubs', checkIn: '7:30 AM', checkOut: '', checkedBy: 'Marcus Williams' },
  { id: '4', name: 'Noah Brown', classroom: 'Bright Butterflies', checkIn: '8:15 AM', checkOut: '', checkedBy: 'Angela Brown' },
  { id: '5', name: 'Ava Davis', classroom: 'Rising Stars', checkIn: '7:50 AM', checkOut: '', checkedBy: 'Robert Davis' },
  { id: '6', name: 'Sophia Martinez', classroom: 'Adventure Club', checkIn: '7:30 AM', checkOut: '', checkedBy: '' },
  { id: '7', name: 'Jackson Anderson', classroom: 'Little Stars', checkIn: '8:30 AM', checkOut: '', checkedBy: 'Karen Anderson' },
  { id: '8', name: 'Isabella Taylor', classroom: 'Busy Bees', checkIn: '8:05 AM', checkOut: '', checkedBy: 'Michael Taylor' },
  { id: '9', name: 'Aiden Thomas', classroom: 'Curious Cubs', checkIn: '', checkOut: '', checkedBy: '' },
  { id: '10', name: 'Mia Jackson', classroom: 'Bright Butterflies', checkIn: '', checkOut: '', checkedBy: '' },
];

export default function AttendancePage() {
  const [records, setRecords] = useState(initialAttendance);
  const [filter, setFilter] = useState('all');

  const present = records.filter(r => r.checkIn && !r.checkOut).length;
  const absent = records.filter(r => !r.checkIn).length;
  const departed = records.filter(r => r.checkOut).length;

  function checkIn(id: string) {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, checkIn: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) } : r));
  }

  function checkOut(id: string) {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, checkOut: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) } : r));
  }

  const filtered = filter === 'all' ? records : records.filter(r => {
    if (filter === 'present') return r.checkIn && !r.checkOut;
    if (filter === 'absent') return !r.checkIn;
    if (filter === 'departed') return !!r.checkOut;
    return r.classroom === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Attendance</h1>
          <p className="text-muted-foreground">Monday, January 27, 2026</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-christina-red">{present}</p><p className="text-xs text-muted-foreground">Present</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-christina-coral">{absent}</p><p className="text-xs text-muted-foreground">Not Checked In</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-christina-blue">{departed}</p><p className="text-xs text-muted-foreground">Departed</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base">Daily Attendance</CardTitle>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Children</SelectItem>
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="absent">Not Checked In</SelectItem>
              <SelectItem value="departed">Departed</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filtered.map((record) => (
              <div key={record.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${record.checkOut ? 'bg-gray-400' : record.checkIn ? 'bg-christina-red' : 'bg-christina-coral'}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{record.name}</p>
                  <p className="text-xs text-muted-foreground">{record.classroom}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {record.checkIn && <span className="flex items-center gap-1"><LogIn className="h-3 w-3" /> {record.checkIn}</span>}
                  {record.checkOut && <span className="flex items-center gap-1"><LogOut className="h-3 w-3" /> {record.checkOut}</span>}
                </div>
                <div>
                  {!record.checkIn ? (
                    <Button size="sm" variant="outline" onClick={() => checkIn(record.id)} className="text-xs">Check In</Button>
                  ) : !record.checkOut ? (
                    <Button size="sm" variant="outline" onClick={() => checkOut(record.id)} className="text-xs">Check Out</Button>
                  ) : (
                    <Badge variant="outline" className="text-xs">Complete</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
