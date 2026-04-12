'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { AlertTriangle, CheckCircle, Info, ArrowRight } from 'lucide-react';
import { TrainingDigestItem, StaffingAlert } from '@/lib/intelligence/types';

const SEVERITY_STYLES = {
  info: { bg: 'bg-christina-green/10', text: 'text-christina-green', icon: CheckCircle },
  warning: { bg: 'bg-christina-yellow/10', text: 'text-christina-yellow', icon: Info },
  action_needed: { bg: 'bg-christina-coral/10', text: 'text-christina-coral', icon: AlertTriangle },
} as const;

function SeverityBadge({ severity }: { severity: 'info' | 'warning' | 'action_needed' }) {
  const style = SEVERITY_STYLES[severity];
  const label = severity === 'action_needed' ? 'Action Needed' : severity === 'warning' ? 'Warning' : 'Info';
  return (
    <Badge className={`${style.bg} ${style.text} border-0`}>
      {label}
    </Badge>
  );
}

export function TrainingDigestCard({ items }: { items: TrainingDigestItem[] }) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-muted-foreground font-body">
          No training alerts. All systems running smoothly.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const style = SEVERITY_STYLES[item.severity];
        const Icon = style.icon;
        return (
          <Card key={i} className={`border-l-4 ${item.severity === 'action_needed' ? 'border-l-christina-coral' : item.severity === 'warning' ? 'border-l-christina-yellow' : 'border-l-christina-green'}`}>
            <CardContent className="py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Icon className={`h-5 w-5 mt-0.5 ${style.text}`} />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm">{item.title}</p>
                      <SeverityBadge severity={item.severity} />
                    </div>
                    <p className="text-sm text-muted-foreground font-body">{item.detail}</p>
                  </div>
                </div>
                {item.actionLink && (
                  <Link
                    href={item.actionLink}
                    className="text-christina-blue hover:underline text-sm flex items-center gap-1 shrink-0"
                  >
                    View <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function StaffingAlertCard({ alerts }: { alerts: StaffingAlert[] }) {
  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-muted-foreground font-body">
          No staffing alerts. Operations are on track.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert, i) => {
        const style = SEVERITY_STYLES[alert.severity];
        const Icon = style.icon;
        return (
          <Card key={i} className={`border-l-4 ${alert.severity === 'action_needed' ? 'border-l-christina-coral' : alert.severity === 'warning' ? 'border-l-christina-yellow' : 'border-l-christina-green'}`}>
            <CardContent className="py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Icon className={`h-5 w-5 mt-0.5 ${style.text}`} />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm">{alert.title}</p>
                      <SeverityBadge severity={alert.severity} />
                    </div>
                    <p className="text-sm text-muted-foreground font-body">{alert.detail}</p>
                    {alert.dataPoints.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {alert.dataPoints.slice(0, 5).map((dp, j) => (
                          <li key={j} className="text-xs text-muted-foreground font-body flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-muted-foreground inline-block" />
                            {dp}
                          </li>
                        ))}
                        {alert.dataPoints.length > 5 && (
                          <li className="text-xs text-muted-foreground font-body">
                            +{alert.dataPoints.length - 5} more
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                </div>
                {alert.actionLink && (
                  <Link
                    href={alert.actionLink}
                    className="text-christina-blue hover:underline text-sm flex items-center gap-1 shrink-0"
                  >
                    View <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
