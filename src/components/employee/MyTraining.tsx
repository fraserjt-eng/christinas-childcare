'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, XCircle, Clock, Target, BookOpen } from 'lucide-react';
import {
  getCertifications,
  getTrainingRecords,
  getDevGoals,
  getAnnualTrainingHours,
  daysUntilExpiry,
  CERT_TYPE_LABELS,
  ANNUAL_TRAINING_HOURS_REQUIRED,
  type Certification,
  type TrainingRecord,
  type DevGoal,
} from '@/lib/staff-development-storage';
import { useSessionUser } from '@/lib/use-session-user';

const CURRENT_YEAR = new Date().getFullYear();

// ─── Cert Status Badge ────────────────────────────────────────────────────────

function certStatusBadge(cert: Certification) {
  const days = daysUntilExpiry(cert.expiry_date);
  switch (cert.status) {
    case 'current':
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 border text-xs gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Current — {days}d left
        </Badge>
      );
    case 'expiring_soon':
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 border text-xs gap-1">
          <AlertTriangle className="h-3 w-3" />
          Expiring in {days}d
        </Badge>
      );
    case 'expired':
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200 border text-xs gap-1">
          <XCircle className="h-3 w-3" />
          Expired {Math.abs(days)}d ago
        </Badge>
      );
  }
}

// ─── Goal Status Badge ────────────────────────────────────────────────────────

function goalStatusBadge(status: DevGoal['status']) {
  switch (status) {
    case 'active':
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200 border text-xs gap-1"><Clock className="h-3 w-3" />Active</Badge>;
    case 'completed':
      return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 border text-xs gap-1"><CheckCircle2 className="h-3 w-3" />Completed</Badge>;
    case 'overdue':
      return <Badge className="bg-red-100 text-red-800 border-red-200 border text-xs gap-1"><AlertTriangle className="h-3 w-3" />Overdue</Badge>;
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function MyTraining() {
  // The signed-in employee's own development. session.user.id is the employee id
  // (minted by staff-pin), so this shows real records, never a demo person.
  const { user } = useSessionUser();
  const empId = user?.id || '';
  const empName = user?.full_name || '';
  const [certs, setCerts] = useState<Certification[]>([]);
  const [trainingRecords, setTrainingRecords] = useState<TrainingRecord[]>([]);
  const [goals, setGoals] = useState<DevGoal[]>([]);
  const [annualHours, setAnnualHours] = useState(0);

  useEffect(() => {
    if (!empId) return;
    setCerts(getCertifications({ employee_id: empId }));
    setTrainingRecords(getTrainingRecords(empId));
    setGoals(getDevGoals(empId));
    setAnnualHours(getAnnualTrainingHours(empId, CURRENT_YEAR));
  }, [empId]);

  const hoursPct = Math.min(100, (annualHours / ANNUAL_TRAINING_HOURS_REQUIRED) * 100);
  const hoursRemaining = Math.max(0, ANNUAL_TRAINING_HOURS_REQUIRED - annualHours);
  const hoursMet = annualHours >= ANNUAL_TRAINING_HOURS_REQUIRED;

  const expiredCerts = certs.filter(c => c.status === 'expired');
  const expiringSoonCerts = certs.filter(c => c.status === 'expiring_soon');

  return (
    <div className="space-y-5 max-w-2xl mx-auto pb-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Development</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{empName}</p>
      </div>

      {/* Urgent alerts */}
      {(expiredCerts.length + expiringSoonCerts.length) > 0 && (
        <div className="space-y-2">
          {expiredCerts.map(cert => (
            <div key={cert.id} className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl">
              <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-800">{CERT_TYPE_LABELS[cert.cert_type]} is expired</p>
                <p className="text-xs text-red-600">{cert.cert_name} — contact your director to schedule renewal</p>
              </div>
            </div>
          ))}
          {expiringSoonCerts.map(cert => {
            const days = daysUntilExpiry(cert.expiry_date);
            return (
              <div key={cert.id} className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-yellow-800">{CERT_TYPE_LABELS[cert.cert_type]} expires in {days} days</p>
                  <p className="text-xs text-yellow-600">{cert.cert_name}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Certifications */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#C62828]" />
            My Certifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {certs.length === 0 ? (
            <p className="text-sm text-gray-400">No certifications on file.</p>
          ) : (
            certs.map(cert => (
              <div key={cert.id} className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">{cert.cert_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Issued {new Date(cert.issued_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    &nbsp;&bull;&nbsp;
                    Expires {new Date(cert.expiry_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                {certStatusBadge(cert)}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Annual training hours */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[#C62828]" />
            {CURRENT_YEAR} Training Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">{annualHours}h completed of {ANNUAL_TRAINING_HOURS_REQUIRED}h required</span>
            {hoursMet ? (
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 border text-xs gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Requirement Met
              </Badge>
            ) : (
              <Badge className="bg-amber-100 text-amber-800 border-amber-200 border text-xs">
                {hoursRemaining}h remaining
              </Badge>
            )}
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${hoursMet ? 'bg-emerald-500' : hoursPct >= 50 ? 'bg-[#2196F3]' : 'bg-amber-400'}`}
              style={{ width: `${hoursPct}%` }}
            />
          </div>

          {trainingRecords.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold text-gray-600">Recent Training</p>
              {trainingRecords.slice(0, 5).map(record => (
                <div key={record.id} className="flex items-center justify-between py-1.5 border-b last:border-b-0">
                  <div>
                    <p className="text-xs font-medium text-gray-700">{record.training_name}</p>
                    <p className="text-xs text-gray-400">{record.provider} &bull; {new Date(record.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">{record.hours}h</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Development goals */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-[#C62828]" />
            My Development Goals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {goals.length === 0 ? (
            <p className="text-sm text-gray-400">No goals set yet. Talk to your director about setting development goals.</p>
          ) : (
            goals.map(goal => (
              <div key={goal.id} className={`p-3 rounded-xl border ${
                goal.status === 'overdue' ? 'bg-red-50 border-red-200' :
                goal.status === 'completed' ? 'bg-emerald-50 border-emerald-100' :
                'bg-gray-50 border-gray-100'
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-medium leading-snug ${goal.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {goal.goal_text}
                  </p>
                  {goalStatusBadge(goal.status)}
                </div>
                <p className="text-xs text-gray-500 mt-1.5">
                  Target: {new Date(goal.target_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                {goal.progress_notes && (
                  <p className="text-xs text-gray-600 mt-1.5 italic">{goal.progress_notes}</p>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
