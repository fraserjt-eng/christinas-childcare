'use client';

import { SupplyRequestForm } from '@/components/employee/SupplyRequest';
import { getCurrentEmployee } from '@/lib/employee-storage';

export default function EmployeeSuppliesPage() {
  const employee = getCurrentEmployee();
  const staffName = employee ? `${employee.first_name} ${employee.last_name}` : 'Staff Member';

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div>
        <h1 className="text-xl font-bold">Request Supplies</h1>
        <p className="text-muted-foreground text-sm">
          Submit a request for classroom or center supplies.
        </p>
      </div>
      <SupplyRequestForm staffName={staffName} />
    </div>
  );
}
