'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PayStubCard } from '@/components/employee/PayStubCard';
import {
  getCurrentEmployee,
  getPayStubs,
} from '@/lib/employee-storage';
import { Employee, PayStub, formatCurrency } from '@/types/employee';
import { CreditCard, TrendingUp, DollarSign, FileText } from 'lucide-react';

export default function EmployeePayStubsPage() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [payStubs, setPayStubs] = useState<PayStub[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );
  const [selectedStub, setSelectedStub] = useState<PayStub | null>(null);

  useEffect(() => {
    async function loadData() {
      const emp = getCurrentEmployee();
      setEmployee(emp);

      if (emp) {
        const stubs = await getPayStubs({ employee_id: emp.id });
        setPayStubs(stubs);
      }
    }
    loadData();
  }, []);

  const years = Array.from(
    new Set(payStubs.map((s) => new Date(s.period_end).getFullYear()))
  ).sort((a, b) => b - a);

  const filteredStubs = payStubs.filter((s) =>
    new Date(s.period_end).getFullYear().toString() === selectedYear
  );

  // Calculate YTD totals
  const ytdTotals = filteredStubs.reduce(
    (acc, stub) => ({
      grossPay: acc.grossPay + stub.gross_pay,
      netPay: acc.netPay + stub.net_pay,
      totalDeductions: acc.totalDeductions + stub.total_deductions,
      hours: acc.hours + stub.regular_hours + stub.overtime_hours,
    }),
    { grossPay: 0, netPay: 0, totalDeductions: 0, hours: 0 }
  );

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="h-6 w-6" />
            Pay Stubs
          </h1>
          <p className="text-muted-foreground">
            View your pay history and deductions
          </p>
        </div>
        {years.length > 0 && (
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* YTD Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">YTD Gross</p>
                <p className="text-xl font-bold">{formatCurrency(ytdTotals.grossPay)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">YTD Net</p>
                <p className="text-xl font-bold">{formatCurrency(ytdTotals.netPay)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <CreditCard className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">YTD Taxes</p>
                <p className="text-xl font-bold">{formatCurrency(ytdTotals.totalDeductions)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">YTD Hours</p>
                <p className="text-xl font-bold">{ytdTotals.hours.toFixed(1)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pay Stub List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Pay Statements</span>
            <Badge variant="outline">{filteredStubs.length} stubs</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStubs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No pay stubs found for {selectedYear}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Pay stubs will appear here after payroll is processed
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredStubs.map((stub) => (
                <PayStubCard
                  key={stub.id}
                  payStub={stub}
                  compact
                  onClick={() => setSelectedStub(stub)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pay Stub Detail Dialog */}
      <Dialog open={!!selectedStub} onOpenChange={() => setSelectedStub(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pay Stub Details</DialogTitle>
          </DialogHeader>
          {selectedStub && (
            <PayStubCard
              payStub={selectedStub}
              employeeName={`${employee.first_name} ${employee.last_name}`}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
