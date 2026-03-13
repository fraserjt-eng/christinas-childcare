'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Check,
  Loader2,
} from 'lucide-react';
import {
  getReimbursements,
  upsertReimbursement,
  ReimbursementRecord,
} from '@/lib/cacfp-compliance-storage';
import { formatFoodCurrency } from '@/types/food';

export function ReimbursementTracker() {
  const [records, setRecords] = useState<ReimbursementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ReimbursementRecord>>({});

  useEffect(() => {
    async function load() {
      const data = await getReimbursements();
      setRecords(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleEdit = (record: ReimbursementRecord) => {
    setEditing(record.month);
    setEditForm(record);
  };

  const handleSave = async () => {
    if (!editing || !editForm.month) return;
    await upsertReimbursement({
      month: editForm.month,
      expected_amount: editForm.expected_amount || 0,
      actual_amount: editForm.actual_amount || 0,
      submitted: editForm.submitted || false,
      submitted_at: editForm.submitted_at,
      received: editForm.received || false,
      received_at: editForm.received_at,
      discrepancy_notes: editForm.discrepancy_notes,
    });
    const updated = await getReimbursements();
    setRecords(updated);
    setEditing(null);
    setEditForm({});
  };

  const handleAddMonth = () => {
    const today = new Date();
    const month = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
    setEditing(month);
    setEditForm({
      month,
      expected_amount: 0,
      actual_amount: 0,
      submitted: false,
      received: false,
    });
  };

  // Calculate totals
  const totalExpected = records.reduce((sum, r) => sum + r.expected_amount, 0);
  const totalActual = records.reduce((sum, r) => sum + r.actual_amount, 0);
  const totalDiscrepancy = totalExpected - totalActual;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Reimbursement Tracker
          </CardTitle>
          <Button size="sm" variant="outline" onClick={handleAddMonth}>
            <Plus className="h-4 w-4 mr-1" />
            Add Month
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        {records.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-blue-50 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Expected</p>
              <p className="text-lg font-bold text-christina-blue">
                {formatFoodCurrency(totalExpected)}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Received</p>
              <p className="text-lg font-bold text-christina-green">
                {formatFoodCurrency(totalActual)}
              </p>
            </div>
            <div className={`p-3 rounded-lg text-center ${totalDiscrepancy > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
              <p className="text-xs text-muted-foreground">Discrepancy</p>
              <p className={`text-lg font-bold flex items-center justify-center gap-1 ${
                totalDiscrepancy > 0 ? 'text-christina-coral' : 'text-christina-green'
              }`}>
                {totalDiscrepancy > 0 ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                {formatFoodCurrency(Math.abs(totalDiscrepancy))}
              </p>
            </div>
          </div>
        )}

        {/* Edit Form */}
        {editing && (
          <div className="p-4 border-2 border-christina-blue/30 rounded-lg space-y-3 bg-blue-50/30">
            <p className="font-medium">
              {new Date(editing + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Expected Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editForm.expected_amount || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, expected_amount: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label className="text-sm">Actual Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editForm.actual_amount || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, actual_amount: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={editForm.submitted}
                  onCheckedChange={(checked) => setEditForm(prev => ({
                    ...prev,
                    submitted: checked as boolean,
                    submitted_at: checked ? new Date().toISOString() : undefined,
                  }))}
                />
                <Label className="text-sm">Claim submitted</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={editForm.received}
                  onCheckedChange={(checked) => setEditForm(prev => ({
                    ...prev,
                    received: checked as boolean,
                    received_at: checked ? new Date().toISOString() : undefined,
                  }))}
                />
                <Label className="text-sm">Payment received</Label>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>
                <Check className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setEditing(null); setEditForm({}); }}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Records List */}
        {records.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No reimbursement records yet. Add a month to start tracking.
          </p>
        ) : (
          <div className="space-y-2">
            {records.map((record) => {
              const discrepancy = record.expected_amount - record.actual_amount;
              return (
                <div
                  key={record.month}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 cursor-pointer"
                  onClick={() => handleEdit(record)}
                >
                  <div>
                    <p className="font-medium">
                      {new Date(record.month + '-01').toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className={record.submitted ? 'text-christina-green' : 'text-muted-foreground'}>
                        {record.submitted ? 'Submitted' : 'Not submitted'}
                      </Badge>
                      <Badge variant="outline" className={record.received ? 'text-christina-green' : 'text-muted-foreground'}>
                        {record.received ? 'Received' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatFoodCurrency(record.expected_amount)}</p>
                    {record.actual_amount > 0 && discrepancy !== 0 && (
                      <p className={`text-sm ${discrepancy > 0 ? 'text-christina-coral' : 'text-christina-green'}`}>
                        {discrepancy > 0 ? '-' : '+'}{formatFoodCurrency(Math.abs(discrepancy))}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
