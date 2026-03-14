'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck, Calendar } from 'lucide-react';
import {
  getCertifications,
  updateCertification,
  daysUntilExpiry,
  CERT_TYPE_LABELS,
  type Certification,
  type CertType,
  type CertStatus,
} from '@/lib/staff-development-storage';

// ─── Constants ────────────────────────────────────────────────────────────────

const STAFF_IDS = [
  { id: 'emp-oz', name: 'Ophelia Zeogar' },
  { id: 'emp-cf', name: 'Christina Fraser' },
  { id: 'emp-ms', name: 'Maria Santos' },
  { id: 'emp-jr', name: 'James Robinson' },
  { id: 'emp-sk', name: 'Sarah Kim' },
  { id: 'emp-dc', name: 'David Chen' },
];

const CERT_COLUMNS: CertType[] = ['cpr_first_aid', 'state_licensing', 'food_handler', 'mandatory_training'];

// ─── Status Badge ─────────────────────────────────────────────────────────────

function statusBadge(status: CertStatus, daysLeft: number) {
  switch (status) {
    case 'current':
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 border gap-1 text-xs">
          <CheckCircle2 className="h-3 w-3" />
          Current
        </Badge>
      );
    case 'expiring_soon':
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 border gap-1 text-xs">
          <AlertTriangle className="h-3 w-3" />
          {daysLeft}d
        </Badge>
      );
    case 'expired':
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200 border gap-1 text-xs">
          <XCircle className="h-3 w-3" />
          Expired
        </Badge>
      );
  }
}

function cellBg(status: CertStatus): string {
  switch (status) {
    case 'current': return 'bg-emerald-50 cursor-pointer hover:bg-emerald-100';
    case 'expiring_soon': return 'bg-yellow-50 cursor-pointer hover:bg-yellow-100';
    case 'expired': return 'bg-red-50 cursor-pointer hover:bg-red-100';
  }
}

// ─── Detail Dialog ────────────────────────────────────────────────────────────

interface CertDetailDialogProps {
  open: boolean;
  cert?: Certification;
  onUpdate: () => void;
  onClose: () => void;
}

function CertDetailDialog({ open, cert, onUpdate, onClose }: CertDetailDialogProps) {
  const [newExpiry, setNewExpiry] = useState('');
  const [newIssued, setNewIssued] = useState('');

  useEffect(() => {
    if (cert) {
      setNewExpiry(cert.expiry_date);
      setNewIssued(cert.issued_date);
    }
  }, [cert]);

  if (!cert) return null;

  const days = daysUntilExpiry(cert.expiry_date);

  function handleSave() {
    if (!cert) return;
    updateCertification(cert.id, { issued_date: newIssued, expiry_date: newExpiry });
    onUpdate();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">{cert.cert_name}</DialogTitle>
          <p className="text-sm text-muted-foreground">{cert.employee_name}</p>
        </DialogHeader>
        <div className="space-y-4 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Status</span>
            {statusBadge(cert.status, days)}
          </div>

          {cert.status !== 'expired' && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Days until expiry</span>
              <span className={`text-sm font-semibold ${days <= 30 ? 'text-red-600' : days <= 90 ? 'text-yellow-600' : 'text-emerald-600'}`}>
                {days} days
              </span>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Issue Date</label>
            <input
              type="date"
              value={newIssued}
              onChange={e => setNewIssued(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C62828]"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Expiry Date</label>
            <input
              type="date"
              value={newExpiry}
              onChange={e => setNewExpiry(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C62828]"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={onClose} className="flex-1">Cancel</Button>
            <Button size="sm" onClick={handleSave} className="flex-1 bg-[#C62828] hover:bg-[#B71C1C] text-white">
              Update Dates
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CertificationTracker() {
  const [allCerts, setAllCerts] = useState<Certification[]>([]);
  const [selectedCert, setSelectedCert] = useState<Certification | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);

  function loadCerts() {
    setAllCerts(getCertifications());
  }

  useEffect(() => {
    loadCerts();
  }, []);

  function getCertForEmployee(employeeId: string, certType: CertType): Certification | undefined {
    return allCerts.find(c => c.employee_id === employeeId && c.cert_type === certType);
  }

  function handleCellClick(cert?: Certification) {
    if (cert) {
      setSelectedCert(cert);
      setDialogOpen(true);
    }
  }

  // Summary counts
  const totalCurrent = allCerts.filter(c => c.status === 'current').length;
  const totalExpiring = allCerts.filter(c => c.status === 'expiring_soon').length;
  const totalExpired = allCerts.filter(c => c.status === 'expired').length;

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 flex-shrink-0" />
            <div>
              <p className="text-2xl font-bold text-emerald-700">{totalCurrent}</p>
              <p className="text-xs text-emerald-600">Current</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-yellow-500 flex-shrink-0" />
            <div>
              <p className="text-2xl font-bold text-yellow-700">{totalExpiring}</p>
              <p className="text-xs text-yellow-600">Expiring Soon</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <XCircle className="h-8 w-8 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-2xl font-bold text-red-700">{totalExpired}</p>
              <p className="text-xs text-red-600">Expired</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expiring soon alerts */}
      {totalExpiring + totalExpired > 0 && (
        <div className="space-y-2">
          {allCerts
            .filter(c => c.status === 'expired' || c.status === 'expiring_soon')
            .sort((a, b) => a.expiry_date.localeCompare(b.expiry_date))
            .map(cert => {
              const days = daysUntilExpiry(cert.expiry_date);
              return (
                <div
                  key={cert.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    cert.status === 'expired'
                      ? 'bg-red-50 border-red-200'
                      : days <= 30
                      ? 'bg-orange-50 border-orange-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <Calendar className={`h-4 w-4 flex-shrink-0 ${cert.status === 'expired' ? 'text-red-500' : 'text-yellow-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">
                      {cert.employee_name} — {CERT_TYPE_LABELS[cert.cert_type]}
                    </p>
                    <p className="text-xs text-gray-500">{cert.cert_name}</p>
                  </div>
                  <span className={`text-xs font-bold ${cert.status === 'expired' ? 'text-red-600' : 'text-yellow-700'}`}>
                    {cert.status === 'expired' ? `Expired ${Math.abs(days)}d ago` : `Expires in ${days}d`}
                  </span>
                </div>
              );
            })}
        </div>
      )}

      {/* Main grid */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#C62828]" />
            Certification Status by Employee
          </CardTitle>
          <p className="text-xs text-muted-foreground">Click any cell to view details and update dates</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left text-xs font-semibold text-gray-600 px-4 py-2.5 w-40">Employee</th>
                  {CERT_COLUMNS.map(col => (
                    <th key={col} className="text-center text-xs font-semibold text-gray-600 px-3 py-2.5 min-w-28">
                      {CERT_TYPE_LABELS[col]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {STAFF_IDS.map(staff => (
                  <tr key={staff.id} className="border-b last:border-b-0 hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{staff.name}</td>
                    {CERT_COLUMNS.map(certType => {
                      const cert = getCertForEmployee(staff.id, certType);
                      if (!cert) {
                        return (
                          <td key={certType} className="px-3 py-3 text-center">
                            <span className="text-xs text-gray-300">—</span>
                          </td>
                        );
                      }
                      const days = daysUntilExpiry(cert.expiry_date);
                      return (
                        <td
                          key={certType}
                          className={`px-3 py-3 text-center rounded-sm transition-colors ${cellBg(cert.status)}`}
                          onClick={() => handleCellClick(cert)}
                        >
                          {statusBadge(cert.status, days)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <CertDetailDialog
        open={dialogOpen}
        cert={selectedCert}
        onUpdate={loadCerts}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}
