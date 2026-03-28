'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, ArrowLeft, Check, X, Info } from 'lucide-react';
import { ROLE_DEFINITIONS } from '@/lib/user-storage';

type PermissionValue = boolean | 'own' | 'limited';

interface Permission {
  name: string;
  description: string;
  owner: PermissionValue;
  admin: PermissionValue;
  teacher: PermissionValue;
  parent: PermissionValue;
}

const permissionCategories: { category: string; permissions: Permission[] }[] = [
  {
    category: 'Dashboard & Overview',
    permissions: [
      {
        name: 'View Dashboard',
        description: 'Access the main dashboard and overview',
        owner: true,
        admin: true,
        teacher: true,
        parent: true,
      },
      {
        name: 'View Operations Stats',
        description: 'See real-time attendance and ratio data',
        owner: true,
        admin: true,
        teacher: true,
        parent: false,
      },
    ],
  },
  {
    category: 'Staff Management',
    permissions: [
      {
        name: 'View Staff Directory',
        description: 'See list of all staff members',
        owner: true,
        admin: true,
        teacher: 'limited',
        parent: false,
      },
      {
        name: 'Manage Staff Records',
        description: 'Add, edit, or remove staff members',
        owner: true,
        admin: true,
        teacher: false,
        parent: false,
      },
      {
        name: 'Process Payroll',
        description: 'Run payroll and manage compensation',
        owner: true,
        admin: true,
        teacher: false,
        parent: false,
      },
      {
        name: 'View Own Pay Stubs',
        description: 'Access personal pay information',
        owner: true,
        admin: true,
        teacher: true,
        parent: false,
      },
      {
        name: 'Approve Time Off',
        description: 'Approve or deny time off requests',
        owner: true,
        admin: true,
        teacher: false,
        parent: false,
      },
    ],
  },
  {
    category: 'Scheduling',
    permissions: [
      {
        name: 'View All Schedules',
        description: 'See schedules for all staff',
        owner: true,
        admin: true,
        teacher: false,
        parent: false,
      },
      {
        name: 'View Own Schedule',
        description: 'See personal work schedule',
        owner: true,
        admin: true,
        teacher: true,
        parent: false,
      },
      {
        name: 'Create Staff Schedules',
        description: 'Build and modify staff schedules',
        owner: true,
        admin: true,
        teacher: false,
        parent: false,
      },
      {
        name: 'Request Schedule Changes',
        description: 'Submit schedule change requests',
        owner: true,
        admin: true,
        teacher: true,
        parent: false,
      },
    ],
  },
  {
    category: 'Curriculum & Lessons',
    permissions: [
      {
        name: 'View Curriculum',
        description: 'Access curriculum materials and lesson plans',
        owner: true,
        admin: true,
        teacher: true,
        parent: false,
      },
      {
        name: 'Create Lesson Plans',
        description: 'Build new lesson plans using the builder',
        owner: true,
        admin: true,
        teacher: true,
        parent: false,
      },
      {
        name: 'Edit All Lessons',
        description: 'Modify any lesson plan',
        owner: true,
        admin: true,
        teacher: false,
        parent: false,
      },
      {
        name: 'Edit Own Lessons',
        description: 'Modify lessons you created',
        owner: true,
        admin: true,
        teacher: true,
        parent: false,
      },
    ],
  },
  {
    category: 'Children & Families',
    permissions: [
      {
        name: 'View All Children',
        description: 'See information for all enrolled children',
        owner: true,
        admin: true,
        teacher: true,
        parent: false,
      },
      {
        name: 'View Own Children',
        description: 'See information for linked children only',
        owner: true,
        admin: true,
        teacher: true,
        parent: true,
      },
      {
        name: 'Edit Child Records',
        description: 'Update child information and notes',
        owner: true,
        admin: true,
        teacher: 'limited',
        parent: 'own',
      },
      {
        name: 'View Progress Reports',
        description: 'Access child progress and milestone tracking',
        owner: true,
        admin: true,
        teacher: true,
        parent: 'own',
      },
    ],
  },
  {
    category: 'Attendance & Food',
    permissions: [
      {
        name: 'Record Attendance',
        description: 'Check children in and out',
        owner: true,
        admin: true,
        teacher: true,
        parent: false,
      },
      {
        name: 'View Attendance Reports',
        description: 'Access attendance history and reports',
        owner: true,
        admin: true,
        teacher: true,
        parent: 'own',
      },
      {
        name: 'Record Food Counts',
        description: 'Log meal and snack counts',
        owner: true,
        admin: true,
        teacher: true,
        parent: false,
      },
      {
        name: 'Manage Menu Planning',
        description: 'Create and edit meal menus',
        owner: true,
        admin: true,
        teacher: false,
        parent: false,
      },
    ],
  },
  {
    category: 'Financial & Business',
    permissions: [
      {
        name: 'View Financial Reports',
        description: 'Access financial data and reports',
        owner: true,
        admin: true,
        teacher: false,
        parent: false,
      },
      {
        name: 'Manage Budget',
        description: 'Create and modify budgets',
        owner: true,
        admin: true,
        teacher: false,
        parent: false,
      },
      {
        name: 'View Enrollment Pipeline',
        description: 'Access enrollment inquiries and pipeline',
        owner: true,
        admin: true,
        teacher: false,
        parent: false,
      },
      {
        name: 'Strategic Planning',
        description: 'Access and modify strategic plans',
        owner: true,
        admin: 'limited',
        teacher: false,
        parent: false,
      },
    ],
  },
  {
    category: 'System & Security',
    permissions: [
      {
        name: 'Manage Users',
        description: 'Create, edit, and deactivate user accounts',
        owner: true,
        admin: false,
        teacher: false,
        parent: false,
      },
      {
        name: 'Change Role Permissions',
        description: 'Modify what each role can access',
        owner: true,
        admin: false,
        teacher: false,
        parent: false,
      },
      {
        name: 'View Audit Logs',
        description: 'Access security and activity logs',
        owner: true,
        admin: true,
        teacher: false,
        parent: false,
      },
      {
        name: 'System Settings',
        description: 'Configure application settings',
        owner: true,
        admin: false,
        teacher: false,
        parent: false,
      },
    ],
  },
];

function PermissionCell({ value }: { value: PermissionValue }) {
  if (value === true) {
    return <Check className="h-5 w-5 text-green-600 mx-auto" />;
  }
  if (value === false) {
    return <X className="h-5 w-5 text-gray-300 mx-auto" />;
  }
  return (
    <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
      {value === 'own' ? 'Own Only' : 'Limited'}
    </Badge>
  );
}

export default function RolesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/settings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-christina-blue/10 rounded-lg">
            <Shield className="h-6 w-6 text-christina-blue" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Roles & Permissions</h1>
            <p className="text-muted-foreground">View role-based access controls</p>
          </div>
        </div>
      </div>

      {/* Role Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(ROLE_DEFINITIONS).map(([role, def]) => (
          <Card key={role}>
            <CardHeader className="pb-2">
              <Badge className={`w-fit ${def.color}`}>{def.label}</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{def.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Banner */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="flex items-start gap-3 p-4">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-blue-900">Role permissions are currently read-only</p>
            <p className="text-sm text-blue-700">
              Contact your system administrator to request permission changes.
              Custom role editing will be available in a future update.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Permission Matrix */}
      {permissionCategories.map((category) => (
        <Card key={category.category}>
          <CardHeader>
            <CardTitle className="text-lg">{category.category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Permission</TableHead>
                    <TableHead className="text-center w-[100px]">Owner</TableHead>
                    <TableHead className="text-center w-[100px]">Admin</TableHead>
                    <TableHead className="text-center w-[100px]">Teacher</TableHead>
                    <TableHead className="text-center w-[100px]">Parent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {category.permissions.map((permission) => (
                    <TableRow key={permission.name}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{permission.name}</p>
                          <p className="text-xs text-muted-foreground">{permission.description}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <PermissionCell value={permission.owner} />
                      </TableCell>
                      <TableCell className="text-center">
                        <PermissionCell value={permission.admin} />
                      </TableCell>
                      <TableCell className="text-center">
                        <PermissionCell value={permission.teacher} />
                      </TableCell>
                      <TableCell className="text-center">
                        <PermissionCell value={permission.parent} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              <span className="text-sm">Full Access</span>
            </div>
            <div className="flex items-center gap-2">
              <X className="h-5 w-5 text-gray-300" />
              <span className="text-sm">No Access</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                Own Only
              </Badge>
              <span className="text-sm">Access to own records only</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                Limited
              </Badge>
              <span className="text-sm">Restricted access</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
