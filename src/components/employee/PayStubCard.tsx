'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { PayStub, formatCurrency, formatHours } from '@/types/employee';
import { Calendar, DollarSign, Clock, FileText } from 'lucide-react';

interface PayStubCardProps {
  payStub: PayStub;
  employeeName?: string;
  compact?: boolean;
  onClick?: () => void;
  className?: string;
}

export function PayStubCard({
  payStub,
  employeeName,
  compact = false,
  onClick,
  className,
}: PayStubCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: PayStub['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'finalized':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (compact) {
    return (
      <Card
        className={cn(
          'cursor-pointer hover:shadow-md transition-shadow',
          className
        )}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">
                  {formatDate(payStub.period_start)} - {formatDate(payStub.period_end)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatHours(payStub.regular_hours + payStub.overtime_hours)} worked
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">{formatCurrency(payStub.net_pay)}</p>
              <Badge className={cn('text-xs', getStatusColor(payStub.status))}>
                {payStub.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Pay Period
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {formatDate(payStub.period_start)} - {formatDate(payStub.period_end)}
            </p>
            {employeeName && (
              <p className="text-sm font-medium mt-1">{employeeName}</p>
            )}
          </div>
          <Badge className={cn(getStatusColor(payStub.status))}>
            {payStub.status.charAt(0).toUpperCase() + payStub.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Hours Section */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Hours Worked</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Regular Hours</p>
              <p className="font-medium">{formatHours(payStub.regular_hours)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overtime Hours</p>
              <p className="font-medium">{formatHours(payStub.overtime_hours)}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Earnings Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Earnings</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Regular Pay ({formatCurrency(payStub.hourly_rate)}/hr)
              </span>
              <span>{formatCurrency(payStub.regular_pay)}</span>
            </div>
            {payStub.overtime_pay > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Overtime Pay (1.5x)
                </span>
                <span>{formatCurrency(payStub.overtime_pay)}</span>
              </div>
            )}
            <div className="flex justify-between font-medium pt-1 border-t">
              <span>Gross Pay</span>
              <span>{formatCurrency(payStub.gross_pay)}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Deductions Section */}
        <div>
          <p className="font-medium mb-3">Deductions</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Federal Tax</span>
              <span className="text-red-600">-{formatCurrency(payStub.federal_tax)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">State Tax (VA)</span>
              <span className="text-red-600">-{formatCurrency(payStub.state_tax)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Social Security</span>
              <span className="text-red-600">-{formatCurrency(payStub.social_security)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Medicare</span>
              <span className="text-red-600">-{formatCurrency(payStub.medicare)}</span>
            </div>
            {payStub.other_deductions > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Other Deductions</span>
                <span className="text-red-600">-{formatCurrency(payStub.other_deductions)}</span>
              </div>
            )}
            <div className="flex justify-between font-medium pt-1 border-t">
              <span>Total Deductions</span>
              <span className="text-red-600">-{formatCurrency(payStub.total_deductions)}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Net Pay */}
        <div className="bg-primary/10 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold">Net Pay</span>
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(payStub.net_pay)}
            </span>
          </div>
          {payStub.pay_date && (
            <p className="text-sm text-muted-foreground mt-1">
              Pay Date: {formatDate(payStub.pay_date)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
