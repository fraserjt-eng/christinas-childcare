'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Loader2,
  Building2,
  User,
} from 'lucide-react';
import {
  Employee,
  BUILDINGS,
  isSalariedEmployee,
  getEmployeeFullName,
} from '@/types/employee';
import {
  getEmployees,
  getSalariedAllocations,
  upsertSalariedAllocation,
} from '@/lib/employee-storage';

interface AllocationData {
  building_id: string;
  role_coverage: string;
  notes: string;
}

export function SalariedAllocationGrid() {
  const [salariedEmployees, setSalariedEmployees] = useState<Employee[]>([]);
  const [allocations, setAllocations] = useState<Map<string, AllocationData>>(
    new Map()
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    const day = today.getDay();
    const start = new Date(today);
    start.setDate(today.getDate() - day + 1); // Start on Monday
    return start;
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      const emps = await getEmployees();
      const salaried = emps.filter(
        (e) => e.employment_status === 'active' && isSalariedEmployee(e)
      );
      setSalariedEmployees(salaried);

      const weekStr = currentWeekStart.toISOString().split('T')[0];
      const allocs = await getSalariedAllocations({ week_start: weekStr });

      const allocMap = new Map<string, AllocationData>();
      for (const alloc of allocs) {
        allocMap.set(alloc.employee_id, {
          building_id: alloc.building_id,
          role_coverage: alloc.role_coverage,
          notes: alloc.notes || '',
        });
      }
      setAllocations(allocMap);
      setLoading(false);
      setHasChanges(false);
    }
    loadData();
  }, [currentWeekStart]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newStart);
  };

  const updateAllocation = (
    employeeId: string,
    field: keyof AllocationData,
    value: string
  ) => {
    setAllocations((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(employeeId) || {
        building_id: BUILDINGS[0].id,
        role_coverage: '',
        notes: '',
      };
      newMap.set(employeeId, { ...current, [field]: value });
      return newMap;
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const weekStr = currentWeekStart.toISOString().split('T')[0];

      for (const employee of salariedEmployees) {
        const allocation = allocations.get(employee.id);
        if (allocation && allocation.building_id && allocation.role_coverage) {
          await upsertSalariedAllocation({
            employee_id: employee.id,
            week_start: weekStr,
            building_id: allocation.building_id,
            role_coverage: allocation.role_coverage,
            notes: allocation.notes || undefined,
          });
        }
      }

      setHasChanges(false);
    } catch (error) {
      console.error('Error saving allocations:', error);
    } finally {
      setSaving(false);
    }
  };

  const formatWeekRange = (): string => {
    const start = currentWeekStart;
    const end = new Date(currentWeekStart);
    end.setDate(end.getDate() + 4);
    return `${start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })} - ${end.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })}`;
  };

  const roleCoverageOptions = [
    'Morning Director',
    'Afternoon Director',
    'Full Day Director',
    'Floater',
    'Administrative',
    'Training',
    'Off-Site',
  ];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Count allocations per building
  const buildingCounts = BUILDINGS.map((building) => {
    const count = Array.from(allocations.values()).filter(
      (a) => a.building_id === building.id
    ).length;
    return { building, count };
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateWeek('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-lg">{formatWeekRange()}</CardTitle>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateWeek('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="outline" className="text-orange-600">
              Unsaved changes
            </Badge>
          )}
          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="gap-2"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Allocations
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Building Summary */}
        <div className="flex gap-4">
          {buildingCounts.map(({ building, count }) => (
            <div
              key={building.id}
              className="flex items-center gap-2 p-3 border rounded-lg"
            >
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{building.name}</p>
                <p className="text-sm text-muted-foreground">
                  {count} salaried staff
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Allocation Table */}
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-3 font-medium">Employee</th>
                <th className="text-left p-3 font-medium">Building</th>
                <th className="text-left p-3 font-medium">Role/Coverage</th>
                <th className="text-left p-3 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {salariedEmployees.map((employee) => {
                const allocation = allocations.get(employee.id) || {
                  building_id: '',
                  role_coverage: '',
                  notes: '',
                };
                return (
                  <tr key={employee.id} className="border-t">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {getEmployeeFullName(employee)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {employee.job_title}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <Select
                        value={allocation.building_id}
                        onValueChange={(value) =>
                          updateAllocation(employee.id, 'building_id', value)
                        }
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Select building..." />
                        </SelectTrigger>
                        <SelectContent>
                          {BUILDINGS.map((building) => (
                            <SelectItem key={building.id} value={building.id}>
                              {building.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3">
                      <Select
                        value={allocation.role_coverage}
                        onValueChange={(value) =>
                          updateAllocation(employee.id, 'role_coverage', value)
                        }
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select role..." />
                        </SelectTrigger>
                        <SelectContent>
                          {roleCoverageOptions.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3">
                      <Input
                        value={allocation.notes}
                        onChange={(e) =>
                          updateAllocation(employee.id, 'notes', e.target.value)
                        }
                        placeholder="Optional notes..."
                        className="w-full"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {salariedEmployees.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No salaried employees found
          </p>
        )}

        {/* Info */}
        <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg">
          <p>
            <strong>Salaried Staff:</strong> Owners, Directors, and Assistant
            Directors are allocated across buildings on a weekly basis. Use this
            view to plan coverage for each location.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
