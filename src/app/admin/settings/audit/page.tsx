'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileText, ArrowLeft, Search, RefreshCw, Download, Filter } from 'lucide-react';
import { getAuditLog, AuditLogEntry, addAuditLog } from '@/lib/user-storage';

function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return 'Invalid date';
  }
}

function ActionBadge({ action }: { action: string }) {
  const styles: Record<string, string> = {
    create: 'bg-green-100 text-green-800',
    update: 'bg-blue-100 text-blue-800',
    delete: 'bg-red-100 text-red-800',
    login: 'bg-purple-100 text-purple-800',
    logout: 'bg-gray-100 text-gray-800',
    activate: 'bg-green-100 text-green-800',
    deactivate: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <Badge variant="outline" className={styles[action] || 'bg-gray-100 text-gray-800'}>
      {action}
    </Badge>
  );
}

function ResourceBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    user: 'bg-blue-50 text-blue-700 border-blue-200',
    security_settings: 'bg-red-50 text-red-700 border-red-200',
    session: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const labels: Record<string, string> = {
    user: 'User',
    security_settings: 'Security',
    session: 'Session',
  };

  return (
    <Badge variant="outline" className={styles[type] || ''}>
      {labels[type] || type}
    </Badge>
  );
}

// Generate sample audit log entries for demo
function generateSampleAuditLogs(): AuditLogEntry[] {
  const now = Date.now();
  const hour = 3600000;
  const day = 86400000;

  return [
    {
      id: 'audit-1',
      user_id: 'user-1',
      user_email: 'christina@childcare.com',
      action: 'login',
      resource_type: 'session',
      details: 'Successful login from Chrome on Mac',
      timestamp: new Date(now - hour * 2).toISOString(),
    },
    {
      id: 'audit-2',
      user_id: 'user-1',
      user_email: 'christina@childcare.com',
      action: 'update',
      resource_type: 'security_settings',
      details: 'Updated password policy settings',
      timestamp: new Date(now - hour * 3).toISOString(),
    },
    {
      id: 'audit-3',
      user_id: 'user-2',
      user_email: 'admin@demo.com',
      action: 'create',
      resource_type: 'user',
      resource_id: 'user-7',
      details: 'Created user: newteacher@childcare.com',
      timestamp: new Date(now - hour * 5).toISOString(),
    },
    {
      id: 'audit-4',
      user_id: 'user-2',
      user_email: 'admin@demo.com',
      action: 'login',
      resource_type: 'session',
      details: 'Successful login from Safari on iPhone',
      timestamp: new Date(now - hour * 6).toISOString(),
    },
    {
      id: 'audit-5',
      user_id: 'user-1',
      user_email: 'christina@childcare.com',
      action: 'deactivate',
      resource_type: 'user',
      resource_id: 'user-8',
      details: 'Deactivated user: former.employee@childcare.com',
      timestamp: new Date(now - day).toISOString(),
    },
    {
      id: 'audit-6',
      user_id: 'user-3',
      user_email: 'maria.johnson@childcare.com',
      action: 'login',
      resource_type: 'session',
      details: 'Successful login from Chrome on Windows',
      timestamp: new Date(now - day - hour * 2).toISOString(),
    },
    {
      id: 'audit-7',
      user_id: 'user-1',
      user_email: 'christina@childcare.com',
      action: 'update',
      resource_type: 'user',
      resource_id: 'user-3',
      details: 'Updated user role: maria.johnson@childcare.com',
      timestamp: new Date(now - day * 2).toISOString(),
    },
    {
      id: 'audit-8',
      user_id: 'user-2',
      user_email: 'admin@demo.com',
      action: 'logout',
      resource_type: 'session',
      details: 'User logged out',
      timestamp: new Date(now - day * 2 - hour * 3).toISOString(),
    },
  ];
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = () => {
    setIsLoading(true);
    // Load from localStorage, or use sample data if empty
    let storedLogs = getAuditLog();
    if (storedLogs.length === 0) {
      storedLogs = generateSampleAuditLogs();
    }
    setLogs(storedLogs);
    setIsLoading(false);
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesResource = resourceFilter === 'all' || log.resource_type === resourceFilter;
    return matchesSearch && matchesAction && matchesResource;
  });

  const uniqueActions = Array.from(new Set(logs.map((l) => l.action)));
  const uniqueResources = Array.from(new Set(logs.map((l) => l.resource_type)));

  const handleExport = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Action', 'Resource', 'Details'].join(','),
      ...filteredLogs.map((log) =>
        [
          formatTimestamp(log.timestamp),
          log.user_email,
          log.action,
          log.resource_type,
          `"${(log.details || '').replace(/"/g, '""')}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Add a log entry when viewing audit logs
  useEffect(() => {
    addAuditLog('view', 'audit_log', undefined, 'Viewed audit log page');
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/settings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-christina-yellow/10 rounded-lg">
            <FileText className="h-6 w-6 text-christina-yellow" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Audit Logs</h1>
            <p className="text-muted-foreground">View security and activity logs</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <CardTitle className="text-lg">Activity Log</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadLogs}>
                <RefreshCw className="h-4 w-4 mr-2" /> Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" /> Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user or details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {uniqueActions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action.charAt(0).toUpperCase() + action.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={resourceFilter} onValueChange={setResourceFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Resource" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Resources</SelectItem>
                  {uniqueResources.map((resource) => (
                    <SelectItem key={resource} value={resource}>
                      {resource.charAt(0).toUpperCase() + resource.slice(1).replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Log Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead className="w-[100px]">Action</TableHead>
                    <TableHead className="w-[100px]">Resource</TableHead>
                    <TableHead className="hidden md:table-cell">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No audit log entries found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatTimestamp(log.timestamp)}
                        </TableCell>
                        <TableCell className="font-medium">{log.user_email}</TableCell>
                        <TableCell>
                          <ActionBadge action={log.action} />
                        </TableCell>
                        <TableCell>
                          <ResourceBadge type={log.resource_type} />
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-xs truncate">
                          {log.details || '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          <p className="text-sm text-muted-foreground mt-4">
            Showing {filteredLogs.length} of {logs.length} entries
          </p>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-dashed">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            Audit logs are stored locally in your browser for demonstration purposes.
            In production, logs would be stored securely in Supabase with tamper-proof protection
            and longer retention periods.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
