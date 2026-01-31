'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PinPad } from '@/components/employee/PinPad';
import { Badge } from '@/components/ui/badge';
import {
  authenticateByPin,
  authenticateByEmail,
  seedSampleData,
  getEmployees,
} from '@/lib/employee-storage';
import { Employee } from '@/types/employee';
import { Clock, KeyRound, Mail, Users } from 'lucide-react';

export default function EmployeeLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pinError, setPinError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [seeded, setSeeded] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    async function init() {
      const result = await seedSampleData();
      if (result.employees > 0) {
        setSeeded(true);
      }
      const emps = await getEmployees();
      setEmployees(emps);
    }
    init();
  }, []);

  const handlePinSubmit = useCallback(async (pin: string) => {
    setLoading(true);
    setPinError('');

    await new Promise((r) => setTimeout(r, 500)); // Simulate network delay

    const employee = await authenticateByPin(pin);
    if (employee) {
      router.push('/employee');
    } else {
      setPinError('Invalid PIN. Please try again.');
      setLoading(false);
    }
  }, [router]);

  async function handleEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setEmailError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    await new Promise((r) => setTimeout(r, 500)); // Simulate network delay

    const employee = await authenticateByEmail(email, password);
    if (employee) {
      router.push('/employee');
    } else {
      setEmailError('Invalid email or password. Use your PIN as password.');
      setLoading(false);
    }
  }

  return (
    <div className="py-16">
      <div className="max-w-lg mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-christina-red flex items-center justify-center mx-auto mb-4">
            <Clock className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Employee Portal</h1>
          <p className="text-muted-foreground">Clock in/out and access your dashboard</p>
          {seeded && (
            <Badge variant="outline" className="mt-2">
              Demo data loaded
            </Badge>
          )}
        </div>

        {/* Login Tabs */}
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="pin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="pin" className="gap-2">
                  <KeyRound className="h-4 w-4" />
                  Quick PIN
                </TabsTrigger>
                <TabsTrigger value="email" className="gap-2">
                  <Mail className="h-4 w-4" />
                  Email Login
                </TabsTrigger>
              </TabsList>

              {/* PIN Login Tab */}
              <TabsContent value="pin" className="mt-0">
                <div className="text-center mb-6">
                  <p className="text-sm text-muted-foreground">
                    Enter your 4-digit PIN to clock in/out
                  </p>
                </div>
                <PinPad
                  onSubmit={handlePinSubmit}
                  error={pinError}
                  loading={loading}
                  maxLength={4}
                />
              </TabsContent>

              {/* Email Login Tab */}
              <TabsContent value="email" className="mt-0">
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@christinaschildcare.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter your PIN as password"
                      required
                    />
                  </div>
                  {emailError && (
                    <p className="text-sm text-red-600">{emailError}</p>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-christina-red hover:bg-christina-red/90"
                    disabled={loading}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Demo Credentials */}
            <div className="mt-8 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs font-semibold text-muted-foreground uppercase">
                  Demo Credentials
                </p>
              </div>
              <div className="grid gap-2 text-sm">
                {employees.slice(0, 4).map((emp) => (
                  <div
                    key={emp.id}
                    className="flex justify-between items-center p-2 bg-background rounded"
                  >
                    <div>
                      <span className="font-medium">
                        {emp.first_name} {emp.last_name}
                      </span>
                      <span className="text-muted-foreground ml-2 text-xs">
                        ({emp.job_title})
                      </span>
                    </div>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      PIN: {emp.pin}
                    </code>
                  </div>
                ))}
                {employees.length > 4 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{employees.length - 4} more employees
                  </p>
                )}
              </div>
            </div>

            {/* Other Login Links */}
            <div className="mt-6 flex justify-center gap-4 text-sm text-muted-foreground">
              <Link
                href="/admin-login"
                className="text-christina-red hover:underline"
              >
                Admin Login
              </Link>
              <span>•</span>
              <Link
                href="/login"
                className="text-christina-blue hover:underline"
              >
                Parent Portal
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
