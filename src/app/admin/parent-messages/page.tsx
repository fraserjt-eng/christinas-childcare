'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Mail, Send, ArrowLeft, Plus } from 'lucide-react';
import {
  getAllConversations,
  sendMessageFromAdmin,
  markReadForAdmin,
  ParentConversation,
} from '@/lib/parent-messages-storage';

interface RegisteredFamily {
  id: string;
  email: string;
  parentName: string;
}

export default function AdminParentMessagesPage() {
  const [conversations, setConversations] = useState<ParentConversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Direct message to a registered parent (server-backed + email).
  const [families, setFamilies] = useState<RegisteredFamily[]>([]);
  const [dmOpen, setDmOpen] = useState(false);
  const [dmEmail, setDmEmail] = useState('');
  const [dmSubject, setDmSubject] = useState('');
  const [dmBody, setDmBody] = useState('');
  const [dmBusy, setDmBusy] = useState(false);
  const [dmError, setDmError] = useState<string | null>(null);
  const [dmResult, setDmResult] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setConversations(getAllConversations());
  }, []);

  useEffect(() => {
    refresh();
    fetch('/api/admin/family')
      .then((r) => (r.ok ? r.json() : { families: [] }))
      .then((d) => setFamilies(d.families || []))
      .catch(() => {});
  }, [refresh]);

  async function handleSendDirect() {
    setDmError(null);
    if (!dmEmail || !dmSubject.trim() || !dmBody.trim()) {
      setDmError('Pick a parent and fill in the subject and message.');
      return;
    }
    setDmBusy(true);
    try {
      const r = await fetch('/api/admin/parent-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: dmEmail,
          subject: dmSubject,
          message: dmBody,
        }),
      });
      const data = await r.json();
      if (!r.ok) {
        setDmError(data.error || 'Could not send the message.');
        setDmBusy(false);
        return;
      }
      setDmOpen(false);
      setDmResult(
        data.emailed
          ? `Message sent to ${dmEmail} by email and in their portal.`
          : `Message saved to ${dmEmail}'s portal. Email was not sent (email service not configured).`
      );
      setDmEmail('');
      setDmSubject('');
      setDmBody('');
    } catch {
      setDmError('Connection error. Please try again.');
    } finally {
      setDmBusy(false);
    }
  }

  const selected = conversations.find((c) => c.id === selectedId);

  function handleSelect(id: string) {
    setSelectedId(id);
    markReadForAdmin(id);
    refresh();
  }

  function handleSend() {
    const text = replyText.trim();
    if (!text || !selectedId || !selected) return;
    sendMessageFromAdmin(selectedId, text, selected.staffName);
    setReplyText('');
    refresh();
  }

  const unreadCount = conversations.filter((c) => c.unreadForAdmin).length;

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Mail className="h-8 w-8 text-christina-red" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Parent Messages</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0
                ? `${unreadCount} unread from families`
                : 'All caught up'}
            </p>
          </div>
        </div>

        <Dialog
          open={dmOpen}
          onOpenChange={(o) => {
            setDmOpen(o);
            if (!o) setDmError(null);
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-christina-red hover:bg-christina-red/90">
              <Plus className="h-4 w-4 mr-2" /> New message
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Message a registered parent</DialogTitle>
              <DialogDescription>
                Goes to their email and their parent portal.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {dmError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {dmError}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="dm-parent">Parent</Label>
                <select
                  id="dm-parent"
                  value={dmEmail}
                  onChange={(e) => setDmEmail(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select a registered family…</option>
                  {families.map((f) => (
                    <option key={f.id} value={f.email}>
                      {f.parentName ? `${f.parentName} — ` : ''}
                      {f.email}
                    </option>
                  ))}
                </select>
                {families.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No registered families yet. Add one in User Management.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dm-subject">Subject</Label>
                <Input
                  id="dm-subject"
                  value={dmSubject}
                  onChange={(e) => setDmSubject(e.target.value)}
                  placeholder="e.g. Pickup time change Friday"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dm-body">Message</Label>
                <textarea
                  id="dm-body"
                  value={dmBody}
                  onChange={(e) => setDmBody(e.target.value)}
                  rows={6}
                  placeholder="Write your message to the parent…"
                  className="w-full rounded-md border border-input bg-background p-3 text-sm"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDmOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSendDirect}
                disabled={dmBusy}
                className="bg-christina-red hover:bg-christina-red/90"
              >
                {dmBusy ? 'Sending…' : 'Send message'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {dmResult && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 flex items-center justify-between">
          <span>{dmResult}</span>
          <button
            onClick={() => setDmResult(null)}
            className="text-green-700 hover:underline text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-[350px_1fr] gap-4 min-h-[600px]">
        <Card className={selected ? 'hidden md:block' : ''}>
          <CardHeader>
            <CardTitle className="text-lg">Families</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {conversations.length === 0 && (
                <p className="p-4 text-sm text-muted-foreground">
                  No parent messages yet.
                </p>
              )}
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelect(conv.id)}
                  className="w-full text-left p-4 hover:bg-muted/50"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-christina-blue text-white text-sm">
                        {conv.parentInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">{conv.parentName}</p>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {conv.lastTimestamp}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        to {conv.staffName}
                      </p>
                      <p className="text-sm truncate mt-1 text-muted-foreground">
                        {conv.lastMessage}
                      </p>
                    </div>
                    {conv.unreadForAdmin && (
                      <Badge className="bg-christina-red text-white text-xs flex-shrink-0">
                        New
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {selected ? (
          <Card className="flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setSelectedId(null)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-christina-blue text-white text-sm">
                    {selected.parentInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">{selected.parentName}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {selected.parentEmail} | Thread with {selected.staffName}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {selected.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={msg.fromParent ? 'flex justify-start' : 'flex justify-end'}
                >
                  <div
                    className={
                      msg.fromParent
                        ? 'max-w-[80%] rounded-lg p-3 bg-muted'
                        : 'max-w-[80%] rounded-lg p-3 bg-christina-red text-white'
                    }
                  >
                    <p className="text-xs font-medium mb-1">
                      {msg.fromParent ? selected.parentName : msg.sender}
                    </p>
                    <p className="text-sm">{msg.content}</p>
                    <p
                      className={
                        msg.fromParent
                          ? 'text-xs mt-1 text-muted-foreground'
                          : 'text-xs mt-1 text-white/70'
                      }
                    >
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  placeholder={`Reply as ${selected.staffName}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleSend}
                  disabled={!replyText.trim()}
                  className="bg-christina-red hover:bg-christina-red/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="hidden md:flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Select a family to view their messages</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
