'use client';

import { useState } from 'react';
import { ScrollFadeIn } from '@/components/features/ScrollFadeIn';
import { Trash2, ShieldCheck, Clock, CheckCircle2, Mail } from 'lucide-react';

export default function DeleteDataPage() {
  const [form, setForm] = useState({
    requesterName: '',
    requesterEmail: '',
    relationship: '',
    childName: '',
    reason: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/data-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please email us instead.');
        setStatus('error');
        return;
      }
      setStatus('done');
    } catch {
      setError('Something went wrong. Please email us instead.');
      setStatus('error');
    }
  }

  const inputClass =
    'w-full px-4 py-2.5 rounded-lg border border-[#e5e0d8] bg-white focus:outline-none focus:border-christina-red focus:ring-1 focus:ring-christina-red text-[#1a1a1a]';

  return (
    <div className="py-12">
      <div className="max-w-2xl mx-auto px-4">
        <ScrollFadeIn direction="up" duration={600}>
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-full bg-christina-red/10 flex items-center justify-center mx-auto mb-6">
              <Trash2 className="h-8 w-8 text-christina-red" />
            </div>
            <h1 className="font-playful text-4xl md:text-5xl text-[#1a1a1a] mb-4">
              Request Data Deletion
            </h1>
            <p className="text-lg text-[#6b6b6b] max-w-xl mx-auto font-light">
              You can ask us to delete your family&apos;s personal information at any time. Fill out
              the form below and we will take care of it.
            </p>
          </div>
        </ScrollFadeIn>

        <ScrollFadeIn direction="up" duration={600} delay={80}>
          <div className="mb-8 p-5 rounded-xl bg-[#faf8f5] border border-[#e5e0d8] space-y-3">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-christina-red flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#4b4b4b]">
                <strong>Your request is tracked, not lost in an inbox.</strong> When you submit, it
                goes straight to our director to review and act on.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-christina-red flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#4b4b4b]">
                <strong>A note on records we must keep.</strong> As a licensed childcare provider,
                Minnesota requires us to retain certain records (such as attendance, incident, and
                meal records) for a set period. We will delete everything we are permitted to delete
                and keep only what licensing requires, then remove the rest once that period ends.
                We will respond within <strong>10 business days</strong>.
              </p>
            </div>
          </div>
        </ScrollFadeIn>

        <ScrollFadeIn direction="up" duration={600} delay={140}>
          {status === 'done' ? (
            <div className="text-center p-8 bg-[#f4f8f5] rounded-2xl border border-[#d8e8de]">
              <CheckCircle2 className="h-12 w-12 text-christina-green mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#1a1a1a] mb-2">Request received</h2>
              <p className="text-[#6b6b6b] max-w-md mx-auto">
                Thank you. Your deletion request has been sent to our director. We will be in touch
                within 10 business days at the email you provided.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6 sm:p-8 bg-white rounded-2xl border border-[#e5e0d8] shadow-sm"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                    Your name <span className="text-christina-red">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.requesterName}
                    onChange={(e) => update('requesterName', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                    Your email <span className="text-christina-red">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={form.requesterEmail}
                    onChange={(e) => update('requesterEmail', e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                    Your relationship to the child
                  </label>
                  <input
                    type="text"
                    placeholder="Parent, guardian, etc."
                    value={form.relationship}
                    onChange={(e) => update('relationship', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                    Child&apos;s name (optional)
                  </label>
                  <input
                    type="text"
                    value={form.childName}
                    onChange={(e) => update('childName', e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                  Anything you want us to know (optional)
                </label>
                <textarea
                  rows={4}
                  value={form.reason}
                  onChange={(e) => update('reason', e.target.value)}
                  className={inputClass}
                />
              </div>

              {status === 'error' && (
                <p className="text-sm text-christina-red bg-christina-red/5 border border-christina-red/20 rounded-lg p-3">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full sm:w-auto px-8 py-3 bg-christina-red text-white font-medium rounded-lg hover:bg-christina-red/90 transition-colors disabled:opacity-60"
              >
                {status === 'sending' ? 'Sending...' : 'Submit deletion request'}
              </button>

              <p className="text-sm text-[#6b6b6b] flex items-center gap-2 pt-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                Prefer email? Write to info@christinaschildcare.com and we will handle it the same way.
              </p>
            </form>
          )}
        </ScrollFadeIn>
      </div>
    </div>
  );
}
