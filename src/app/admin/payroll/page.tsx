'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  DialogFooter,
} from '@/components/ui/dialog';
import { PayStubCard } from '@/components/employee/PayStubCard';
import {
  getEmployees,
  getTimeEntries,
  getPayStubs,
  createPayStub,
  updatePayStub,
  updateEmployee,
  updateTimeEntry,
  seedSampleData,
} from '@/lib/employee-storage';
import {
  Employee,
  TimeEntry,
  PayStub,
  formatCurrency,
  formatHours,
  calculatePayStub,
  getCurrentPayPeriod,
  generatePayPeriods,
  getEmployeeFullName,
} from '@/types/employee';
import {
  CreditCard,
  Clock,
  DollarSign,
  FileText,
  Users,
  Calendar,
  Check,
  Edit2,
  RefreshCw,
  AlertCircle,
  Play,
} from 'lucide-react';

export default function AdminPayrollPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [payStubs, setPayStubs] = useState<PayStub[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Current pay period (computed once)
  const currentPeriod = getCurrentPayPeriod();
  const periods = generatePayPeriods(new Date().getFullYear());

  // Filters
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>(
    `${currentPeriod.start}|${currentPeriod.end}`
  );
  const [dateFrom, setDateFrom] = useState<string>(currentPeriod.start);
  const [dateTo, setDateTo] = useState<string>(currentPeriod.end);

  // Edit dialogs
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [editingRate, setEditingRate] = useState<Employee | null>(null);
  const [newRate, setNewRate] = useState<string>('');
  const [selectedStub, setSelectedStub] = useState<PayStub | null>(null);

  useEffect(() => {
    async function loadData() {
      await seedSampleData();
      const emps = await getEmployees();
      setEmployees(emps);

      const entries = await getTimeEntries();
      setTimeEntries(entries);

      const stubs = await getPayStubs();
      setPayStubs(stubs);

      setLoading(false);
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshData = async () => {
    const entries = await getTimeEntries();
    setTimeEntries(entries);
    const stubs = await getPayStubs();
    setPayStubs(stubs);
  };

  // Filter time entries
  const filteredEntries = timeEntries.filter((entry) => {
    if (selectedEmployee !== 'all' && entry.employee_id !== selectedEmployee) {
      return false;
    }
    if (dateFrom && entry.date < dateFrom) return false;
    if (dateTo && entry.date > dateTo) return false;
    return true;
  });

  // Filter pay stubs
  const filteredStubs = payStubs.filter((stub) => {
    if (selectedEmployee !== 'all' && stub.employee_id !== selectedEmployee) {
      return false;
    }
    return true;
  });

  const getEmployeeName = (id: string): string => {
    const emp = employees.find((e) => e.id === id);
    return emp ? getEmployeeFullName(emp) : 'Unknown';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Handle saving edited time entry
  const handleSaveEntry = async () => {
    if (!editingEntry) return;
    await updateTimeEntry(editingEntry.id, editingEntry);
    await refreshData();
    setEditingEntry(null);
  };

  // Handle saving pay rate
  const handleSaveRate = async () => {
    if (!editingRate || !newRate) return;
    await updateEmployee(editingRate.id, {
      hourly_rate: parseFloat(newRate),
    });
    const emps = await getEmployees();
    setEmployees(emps);
    setEditingRate(null);
    setNewRate('');
  };

  // Process payroll for selected period
  const handleProcessPayroll = async () => {
    if (!selectedPeriod) return;
    setProcessing(true);

    const [periodStart, periodEnd] = selectedPeriod.split('|');

    for (const employee of employees) {
      // Get time entries for this employee and period
      const empEntries = timeEntries.filter(
        (e) =>
          e.employee_id === employee.id &&
          e.date >= periodStart &&
          e.date <= periodEnd &&
          e.clock_out // Only completed entries
      );

      if (empEntries.length === 0) continue;

      // Check if stub already exists
      const existingStub = payStubs.find(
        (s) =>
          s.employee_id === employee.id &&
          s.period_start === periodStart &&
          s.period_end === periodEnd
      );

      if (existingStub) continue; // Skip if already exists

      // Calculate and create pay stub
      const stubData = calculatePayStub(employee, empEntries, periodStart, periodEnd);
      await createPayStub(stubData);
    }

    await refreshData();
    setProcessing(false);
  };

  // Mark stub as paid
  const handleMarkPaid = async (stubId: string) => {
    await updatePayStub(stubId, {
      status: 'paid',
      pay_date: new Date().toISOString().split('T')[0],
    });
    await refreshData();
  };

  // Finalize stub
  const handleFinalizeStub = async (stubId: string) => {
    await updatePayStub(stubId, { status: 'finalized' });
    await refreshData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading payroll data...</p>
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
            Payroll Management
          </h1>
          <p className="text-muted-foreground">
            Manage time entries, pay rates, and process payroll
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Employees</p>
                <p className="text-xl font-bold">{employees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time Entries</p>
                <p className="text-xl font-bold">{timeEntries.length}</p>
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
                <p className="text-sm text-muted-foreground">Pay Stubs</p>
                <p className="text-xl font-bold">{payStubs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <DollarSign className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-xl font-bold">
                  {payStubs.filter((s) => s.status === 'draft').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="time-entries" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="time-entries" className="gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Time Entries</span>
          </TabsTrigger>
          <TabsTrigger value="pay-rates" className="gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Pay Rates</span>
          </TabsTrigger>
          <TabsTrigger value="pay-stubs" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Pay Stubs</span>
          </TabsTrigger>
          <TabsTrigger value="process" className="gap-2">
            <Play className="h-4 w-4" />
            <span className="hidden sm:inline">Process</span>
          </TabsTrigger>
        </TabsList>

        {/* Time Entries Tab */}
        <TabsContent value="time-entries">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle>Time Entries</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Employees" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Employees</SelectItem>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {getEmployeeFullName(emp)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-[150px]"
                  />
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-[150px]"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Clock In</TableHead>
                    <TableHead>Clock Out</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.slice(0, 20).map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">
                        {getEmployeeName(entry.employee_id)}
                      </TableCell>
                      <TableCell>{formatDate(entry.date)}</TableCell>
                      <TableCell>{formatDateTime(entry.clock_in)}</TableCell>
                      <TableCell>
                        {entry.clock_out ? formatDateTime(entry.clock_out) : (
                          <Badge variant="outline">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {entry.hours_worked ? formatHours(entry.hours_worked) : '--'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingEntry(entry)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredEntries.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No time entries found for the selected filters
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pay Rates Tab */}
        <TabsContent value="pay-rates">
          <Card>
            <CardHeader>
              <CardTitle>Employee Pay Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Hourly Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell className="font-medium">
                        {getEmployeeFullName(emp)}
                      </TableCell>
                      <TableCell>{emp.job_title}</TableCell>
                      <TableCell>
                        <span className="text-lg font-bold">
                          {formatCurrency(emp.hourly_rate)}/hr
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            emp.employment_status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }
                        >
                          {emp.employment_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingRate(emp);
                            setNewRate(emp.hourly_rate.toString());
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pay Stubs Tab */}
        <TabsContent value="pay-stubs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pay Stubs</CardTitle>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Employees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Employees</SelectItem>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {getEmployeeFullName(emp)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Gross Pay</TableHead>
                    <TableHead>Net Pay</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStubs.map((stub) => (
                    <TableRow key={stub.id}>
                      <TableCell className="font-medium">
                        {getEmployeeName(stub.employee_id)}
                      </TableCell>
                      <TableCell>
                        {formatDate(stub.period_start)} - {formatDate(stub.period_end)}
                      </TableCell>
                      <TableCell>
                        {formatHours(stub.regular_hours + stub.overtime_hours)}
                      </TableCell>
                      <TableCell>{formatCurrency(stub.gross_pay)}</TableCell>
                      <TableCell className="font-bold">
                        {formatCurrency(stub.net_pay)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            stub.status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : stub.status === 'finalized'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {stub.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedStub(stub)}
                          >
                            View
                          </Button>
                          {stub.status === 'draft' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFinalizeStub(stub.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          {stub.status === 'finalized' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkPaid(stub.id)}
                              className="text-green-600"
                            >
                              Mark Paid
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredStubs.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No pay stubs found. Process payroll to generate pay stubs.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Process Payroll Tab */}
        <TabsContent value="process">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Process Payroll
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Period Selection */}
              <div className="space-y-2">
                <Label>Select Pay Period</Label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pay period" />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.slice(-6).reverse().map((period) => (
                      <SelectItem
                        key={`${period.start}|${period.end}`}
                        value={`${period.start}|${period.end}`}
                      >
                        {formatDate(period.start)} - {formatDate(period.end)}
                        {period.start === currentPeriod.start && (
                          <Badge className="ml-2" variant="secondary">Current</Badge>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Preview */}
              {selectedPeriod && (
                <div className="space-y-4">
                  <h3 className="font-medium">Preview: Payroll for Selected Period</h3>
                  <div className="grid gap-3">
                    {employees.map((emp) => {
                      const [periodStart, periodEnd] = selectedPeriod.split('|');
                      const empEntries = timeEntries.filter(
                        (e) =>
                          e.employee_id === emp.id &&
                          e.date >= periodStart &&
                          e.date <= periodEnd &&
                          e.clock_out
                      );
                      const totalHours = empEntries.reduce(
                        (sum, e) => sum + (e.hours_worked || 0),
                        0
                      );
                      const existingStub = payStubs.find(
                        (s) =>
                          s.employee_id === emp.id &&
                          s.period_start === periodStart &&
                          s.period_end === periodEnd
                      );

                      return (
                        <div
                          key={emp.id}
                          className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{getEmployeeFullName(emp)}</p>
                            <p className="text-sm text-muted-foreground">
                              {empEntries.length} entries • {formatHours(totalHours)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">
                              {formatCurrency(totalHours * emp.hourly_rate)}
                            </p>
                            {existingStub && (
                              <Badge variant="outline" className="text-xs">
                                Already processed
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Process Button */}
                  <div className="flex items-center gap-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <div className="flex-1">
                      <p className="font-medium">Ready to process payroll?</p>
                      <p className="text-sm text-muted-foreground">
                        This will generate pay stubs for all employees with time entries.
                      </p>
                    </div>
                    <Button
                      onClick={handleProcessPayroll}
                      disabled={processing}
                      className="gap-2"
                    >
                      {processing ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          Process Payroll
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Time Entry Dialog */}
      <Dialog open={!!editingEntry} onOpenChange={() => setEditingEntry(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Time Entry</DialogTitle>
          </DialogHeader>
          {editingEntry && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={editingEntry.date}
                  onChange={(e) =>
                    setEditingEntry({ ...editingEntry, date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Clock In</Label>
                <Input
                  type="time"
                  value={editingEntry.clock_in.split('T')[1]?.slice(0, 5) || ''}
                  onChange={(e) => {
                    const newClockIn = `${editingEntry.date}T${e.target.value}:00`;
                    setEditingEntry({ ...editingEntry, clock_in: newClockIn });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Clock Out</Label>
                <Input
                  type="time"
                  value={editingEntry.clock_out?.split('T')[1]?.slice(0, 5) || ''}
                  onChange={(e) => {
                    const newClockOut = `${editingEntry.date}T${e.target.value}:00`;
                    setEditingEntry({ ...editingEntry, clock_out: newClockOut });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Break Minutes</Label>
                <Input
                  type="number"
                  value={editingEntry.break_minutes || 0}
                  onChange={(e) =>
                    setEditingEntry({
                      ...editingEntry,
                      break_minutes: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingEntry(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEntry}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Pay Rate Dialog */}
      <Dialog open={!!editingRate} onOpenChange={() => setEditingRate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Pay Rate</DialogTitle>
          </DialogHeader>
          {editingRate && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Update hourly rate for {getEmployeeFullName(editingRate)}
              </p>
              <div className="space-y-2">
                <Label>Hourly Rate ($)</Label>
                <Input
                  type="number"
                  step="0.50"
                  min="0"
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRate(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Pay Stub Dialog */}
      <Dialog open={!!selectedStub} onOpenChange={() => setSelectedStub(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pay Stub Details</DialogTitle>
          </DialogHeader>
          {selectedStub && (
            <PayStubCard
              payStub={selectedStub}
              employeeName={getEmployeeName(selectedStub.employee_id)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
