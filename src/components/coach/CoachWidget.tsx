'use client';

// The leadership Coach: a floating helper shown ONLY to owners/superadmin
// (J + the owners). It answers how-to questions about the app and, when the
// app can't do something, offers to file a support ticket to J. Self-gates on
// role, so it is safe to mount on any screen.

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X } from 'lucide-react';
import { useSessionUser } from '@/lib/use-session-user';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

export function CoachWidget() {
  const { user } = useSessionUser();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [suggestTicket, setSuggestTicket] = useState(false);
  const [ticketState, setTicketState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, busy]);

  // Only the leadership team sees the Coach.
  if ((user?.role || '').toLowerCase() !== 'superadmin') return null;

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    const next = [...messages, { role: 'user' as const, content: text }];
    setMessages(next);
    setInput('');
    setSuggestTicket(false);
    setBusy(true);
    try {
      const r = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Send only the route (e.g. "/admin/families") so the Coach can answer
        // for the screen you're on; never page content (could hold a child name).
        body: JSON.stringify({
          messages: next,
          page: typeof window !== 'undefined' ? window.location.pathname : undefined,
        }),
      });
      const d = await r.json();
      if (r.ok) {
        setMessages((m) => [...m, { role: 'assistant', content: d.reply || '…' }]);
        setSuggestTicket(Boolean(d.suggestTicket));
      } else {
        setMessages((m) => [...m, { role: 'assistant', content: d.error || 'Something went wrong.' }]);
      }
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'Connection error. Try again.' }]);
    }
    setBusy(false);
  }

  async function createTicket() {
    setTicketState('sending');
    const firstQ = messages.find((m) => m.role === 'user')?.content || 'Coach request';
    const transcript = messages
      .map((m) => `${m.role === 'user' ? 'Me' : 'Coach'}: ${m.content}`)
      .join('\n\n');
    try {
      const form = new FormData();
      form.set('subject', `Coach: ${firstQ.slice(0, 120)}`);
      form.set('description', transcript.slice(0, 4000));
      if (typeof window !== 'undefined') form.set('page_url', window.location.pathname);
      const r = await fetch('/api/support/tickets', { method: 'POST', body: form });
      setTicketState(r.ok ? 'sent' : 'idle');
      if (r.ok) setSuggestTicket(false);
    } catch {
      setTicketState('idle');
    }
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open the Coach"
          className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-christina-red text-white shadow-lg hover:bg-christina-red/90"
        >
          <Sparkles className="h-6 w-6" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-5 right-5 z-50 flex h-[32rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-christina-red px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <span className="font-semibold">Coach</span>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <p className="text-sm text-gray-500">
                Ask me how to do anything in the app — attendance, daily reports,
                newsletters, families. If it can&rsquo;t be done here, I&rsquo;ll
                offer to send J a ticket.
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={
                    m.role === 'user'
                      ? 'max-w-[85%] whitespace-pre-wrap rounded-2xl bg-christina-red px-3 py-2 text-sm text-white'
                      : 'max-w-[85%] whitespace-pre-wrap rounded-2xl bg-gray-100 px-3 py-2 text-sm text-gray-800'
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}
            {busy && <p className="text-xs text-gray-400">Coach is thinking…</p>}
            {suggestTicket && ticketState !== 'sent' && (
              <button
                type="button"
                onClick={createTicket}
                disabled={ticketState === 'sending'}
                className="w-full rounded-lg border border-christina-red px-3 py-2 text-sm font-semibold text-christina-red hover:bg-red-50 disabled:opacity-50"
              >
                {ticketState === 'sending' ? 'Sending…' : 'Create a ticket for J'}
              </button>
            )}
            {ticketState === 'sent' && (
              <p className="text-center text-xs text-green-700">Ticket sent to J.</p>
            )}
          </div>

          <div className="flex items-center gap-2 border-t p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="How do I…?"
              className="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-christina-red/30"
            />
            <button
              type="button"
              onClick={send}
              disabled={busy || !input.trim()}
              aria-label="Send"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-christina-red text-white disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
