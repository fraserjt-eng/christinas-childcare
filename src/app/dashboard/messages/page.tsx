'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, ArrowLeft } from 'lucide-react';
import { getCurrentFamily } from '@/lib/family-storage';
import {
  seedParentConversations,
  getConversationsForParent,
  sendMessageFromParent,
  markReadForParent,
  ParentConversation,
} from '@/lib/parent-messages-storage';

export default function MessagesPage() {
  const [conversations, setConversations] = useState<ParentConversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [parentEmail, setParentEmail] = useState<string>('');
  const [parentName, setParentName] = useState<string>('Parent');
  const [centerMessages, setCenterMessages] = useState<
    {
      id: string;
      subject: string;
      body: string;
      from_name: string;
      created_at: string;
    }[]
  >([]);

  const refresh = useCallback((email: string) => {
    setConversations(getConversationsForParent(email));
  }, []);

  useEffect(() => {
    const family = getCurrentFamily();
    if (!family) return;
    const email = family.email;
    const name = family.parents[0]?.name || 'Parent';
    setParentEmail(email);
    setParentName(name);
    seedParentConversations(email, name);
    refresh(email);
  }, [refresh]);

  // Direct messages from the center (server-backed; uses the signed-in
  // session, so it works regardless of this device's local data).
  useEffect(() => {
    fetch('/api/parent/messages')
      .then((r) => (r.ok ? r.json() : { messages: [] }))
      .then((d) => setCenterMessages(d.messages || []))
      .catch(() => {});
  }, []);

  const selected = conversations.find((c) => c.id === selectedId);

  function handleSelect(id: string) {
    setSelectedId(id);
    markReadForParent(id);
    refresh(parentEmail);
  }

  function handleSend() {
    const text = replyText.trim();
    if (!text || !selectedId) return;
    sendMessageFromParent(selectedId, text, parentName);
    setReplyText('');
    refresh(parentEmail);
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-4">
      <div className="flex items-center gap-3">
        <MessageCircle className="h-8 w-8 text-christina-red" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Communication with staff</p>
        </div>
      </div>

      {centerMessages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Messages from Christina&rsquo;s Child Care Center
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {centerMessages.map((m) => (
              <div
                key={m.id}
                className="rounded-lg border border-[#e5e0d8] p-4 bg-white"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">{m.subject}</p>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {new Date(m.created_at).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-sm mt-2 whitespace-pre-wrap">{m.body}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  From {m.from_name}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-[350px_1fr] gap-4 min-h-[600px]">
        <Card className={selected ? 'hidden md:block' : ''}>
          <CardHeader>
            <CardTitle className="text-lg">Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {conversations.length === 0 && (
                <p className="p-4 text-sm text-muted-foreground">No messages yet.</p>
              )}
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelect(conv.id)}
                  className="w-full text-left p-4 hover:bg-muted/50"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-christina-red text-white text-sm">
                        {conv.staffInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{conv.staffName}</p>
                        <span className="text-xs text-muted-foreground">{conv.lastTimestamp}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{conv.staffRole}</p>
                      <p className="text-sm truncate mt-1 text-muted-foreground">{conv.lastMessage}</p>
                    </div>
                    {conv.unreadForParent && (
                      <Badge className="bg-christina-red text-white text-xs">New</Badge>
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
                  <AvatarFallback className="bg-christina-red text-white text-sm">
                    {selected.staffInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">{selected.staffName}</CardTitle>
                  <p className="text-xs text-muted-foreground">{selected.staffRole}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {selected.messages.map((msg) => (
                <div key={msg.id} className={msg.fromParent ? 'flex justify-end' : 'flex justify-start'}>
                  <div
                    className={
                      msg.fromParent
                        ? 'max-w-[80%] rounded-lg p-3 bg-christina-red text-white'
                        : 'max-w-[80%] rounded-lg p-3 bg-muted'
                    }
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p
                      className={
                        msg.fromParent
                          ? 'text-xs mt-1 text-white/70'
                          : 'text-xs mt-1 text-muted-foreground'
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
                  placeholder="Type a message..."
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
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Select a conversation to view messages</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
