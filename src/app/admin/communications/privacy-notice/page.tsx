'use client';

// Family privacy-notice communication: review + print the per-family drafts.
//
// Email is intentionally OFF until the owner verifies the Resend sending domain.
// Until then this page builds every family's notice (with their PIN) as a
// ready-to-send DRAFT you can preview and print. "Send all emails" is disabled
// until sending is configured server-side, so nothing leaves by accident.
//
// All rendering happens through the admin-gated, service-role route
// /api/communications/send (mode 'draft'); PINs/PII never reach the anon client.

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Printer, Eye, Send, RefreshCw, AlertTriangle } from 'lucide-react';

interface Draft {
  familyId: string;
  email: string;
  hasEmail: boolean;
  familyName: string;
  subject: string;
  html: string;
}
interface DraftResponse {
  centerName: string;
  sendEnabled: boolean;
  total: number;
  withEmail: number;
  withoutEmail: number;
  drafts: Draft[];
}

export default function PrivacyNoticeCommsPage() {
  const [data, setData] = useState<DraftResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sendMsg, setSendMsg] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/communications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'draft' }),
      });
      if (!res.ok) {
        setError(res.status === 401 ? 'Sign in as an admin to view the drafts.' : 'Could not build the drafts.');
        setData(null);
        return;
      }
      setData((await res.json()) as DraftResponse);
    } catch {
      setError('Could not build the drafts.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function previewOne(d: Draft) {
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(d.html);
      w.document.close();
    }
  }

  function printAll() {
    if (!data) return;
    const withEmailOrNot = data.drafts;
    const combined = withEmailOrNot
      .map((d) => `<div style="page-break-after:always">${d.html}</div>`)
      .join('\n');
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(`<!doctype html><html><head><title>Family notices</title></head><body>${combined}</body></html>`);
      w.document.close();
      w.focus();
      setTimeout(() => w.print(), 400);
    }
  }

  async function sendAll() {
    if (!data?.sendEnabled || sending) return;
    if (!confirm(`Send the privacy notice to ${data.withEmail} families with an email on file? This emails real families.`)) return;
    setSending(true);
    setSendMsg('');
    try {
      const res = await fetch('/api/communications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'send' }),
      });
      const r = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSendMsg(r.error || 'Send failed.');
        return;
      }
      setSendMsg(`Sent ${r.sent} of ${r.total}. ${r.failed ? `${r.failed} could not be sent.` : ''}`);
    } catch {
      setSendMsg('Send failed.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="container mx-auto space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <Mail className="h-8 w-8 text-christina-red" />
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Family Privacy Notice</h1>
          <p className="text-muted-foreground">
            Each family&apos;s notice with their kiosk PIN, ready to send{data ? ` for ${data.centerName}` : ''}.
          </p>
        </div>
      </div>

      {/* Email status banner */}
      <div className="flex items-start gap-3 rounded-lg border border-christina-yellow/60 bg-christina-yellow/10 px-4 py-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#8a6d00]" />
        <div className="text-sm">
          <p className="font-semibold text-[#5a4500]">
            {data?.sendEnabled ? 'Email is configured. You can send or print.' : 'Email is off for now. These are drafts you can print and hand out.'}
          </p>
          {!data?.sendEnabled && (
            <p className="text-[#5a4500]/90">
              Sending turns on once the Resend domain is verified and the API key is set. Until then, print and post these, and hand out the PIN slips.
            </p>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-christina-red">{error}</p>}

      {loading ? (
        <p className="text-sm text-muted-foreground">Building drafts...</p>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              ['Drafts ready', data.total],
              ['With email', data.withEmail],
              ['No email yet', data.withoutEmail],
            ].map(([label, val]) => (
              <Card key={label as string}>
                <CardContent className="p-4">
                  <p className="text-2xl font-bold text-christina-red">{val as number}</p>
                  <p className="text-xs text-muted-foreground">{label as string}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={load} disabled={loading}>
              <RefreshCw className="mr-1.5 h-4 w-4" /> Refresh
            </Button>
            <Button onClick={printAll} disabled={data.total === 0} className="bg-christina-red text-white hover:bg-christina-red/90">
              <Printer className="mr-1.5 h-4 w-4" /> Print all ({data.total})
            </Button>
            <Button
              onClick={sendAll}
              disabled={!data.sendEnabled || sending || data.withEmail === 0}
              variant={data.sendEnabled ? 'default' : 'outline'}
              title={data.sendEnabled ? '' : 'Sending is off until the email domain is verified'}
            >
              <Send className="mr-1.5 h-4 w-4" /> {data.sendEnabled ? `Send all emails (${data.withEmail})` : 'Send all emails (off)'}
            </Button>
          </div>
          {sendMsg && <p className="text-sm font-medium text-christina-green">{sendMsg}</p>}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recipients</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {data.drafts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No families in this center yet.</p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b text-xs uppercase text-muted-foreground">
                      <th className="py-2">Family</th>
                      <th className="py-2">Email</th>
                      <th className="py-2">Preview</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.drafts.map((d) => (
                      <tr key={d.familyId} className="border-b last:border-0">
                        <td className="py-2 font-medium">{d.familyName}</td>
                        <td className="py-2 text-muted-foreground">{d.hasEmail ? d.email : <span className="italic">no email yet (print + hand out)</span>}</td>
                        <td className="py-2">
                          <Button variant="ghost" size="sm" onClick={() => previewOne(d)}>
                            <Eye className="mr-1 h-4 w-4" /> View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
