'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Send, ArrowLeft } from 'lucide-react'

interface Message { id: string; sender: string; content: string; timestamp: string; isMe: boolean }
interface Conversation { id: string; name: string; initials: string; role: string; lastMessage: string; timestamp: string; unread: boolean; messages: Message[] }

const conversations: Conversation[] = [
  {
    id: "1", name: "Ophelia Zeogar", initials: "OZ", role: "Director",
    lastMessage: "Exciting news about our Spring Family Event!", timestamp: "10:30 AM", unread: true,
    messages: [
      { id: "1a", sender: "Ophelia Zeogar", content: "Good morning! Announcing our Spring Family Event on March 21st with games, potluck, and art showcase.", timestamp: "10:30 AM", isMe: false },
      { id: "1b", sender: "Ophelia Zeogar", content: "Please RSVP by March 7th. Looking forward to seeing everyone!", timestamp: "10:31 AM", isMe: false },
    ],
  },
  {
    id: "2", name: "Maria Santos", initials: "MS", role: "Lead Teacher - Infants",
    lastMessage: "Sofia reached a wonderful milestone today!", timestamp: "2:15 PM", unread: true,
    messages: [
      { id: "2a", sender: "Maria Santos", content: "Sofia pulled herself up to standing today! She was so proud with the biggest smile.", timestamp: "2:15 PM", isMe: false },
      { id: "2b", sender: "Maria Santos", content: "I took a video if you want to see it. She has been working hard on balance.", timestamp: "2:16 PM", isMe: false },
      { id: "2c", sender: "You", content: "Amazing! We noticed her trying at home too. Would love to see the video!", timestamp: "3:00 PM", isMe: true },
    ],
  },
  {
    id: "3", name: "James Robinson", initials: "JR", role: "Lead Teacher - Toddlers",
    lastMessage: "Field trip permission slip reminder", timestamp: "Yesterday", unread: false,
    messages: [
      { id: "3a", sender: "James Robinson", content: "Reminder: permission slip for Children Museum trip Feb 5th due Friday Jan 30th.", timestamp: "Yesterday 9:00 AM", isMe: false },
      { id: "3b", sender: "James Robinson", content: "Trip costs  per child. Include payment with signed form.", timestamp: "Yesterday 9:01 AM", isMe: false },
      { id: "3c", sender: "You", content: "Thanks James! Will have it ready by Wednesday. Emma is so excited!", timestamp: "Yesterday 11:30 AM", isMe: true },
      { id: "3d", sender: "James Robinson", content: "Great! She has been talking about the dinosaurs all week.", timestamp: "Yesterday 11:45 AM", isMe: false },
    ],
  },
]

export default function MessagesPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const selected = conversations.find((c) => c.id === selectedId)

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-4">
      <div className="flex items-center gap-3">
        <MessageCircle className="h-8 w-8 text-christina-red" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Communication with staff</p>
        </div>
      </div>
      <div className="grid md:grid-cols-[350px_1fr] gap-4 min-h-[600px]">
        <Card className={selected ? 'hidden md:block' : ''}>
          <CardHeader><CardTitle className="text-lg">Conversations</CardTitle></CardHeader>
          <CardContent className="p-0"><div className="divide-y">
              {conversations.map((conv) => (
                <button key={conv.id} onClick={() => setSelectedId(conv.id)} className="w-full text-left p-4 hover:bg-muted/50">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10"><AvatarFallback className="bg-christina-red text-white text-sm">{conv.initials}</AvatarFallback></Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{conv.name}</p>
                        <span className="text-xs text-muted-foreground">{conv.timestamp}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{conv.role}</p>
                      <p className="text-sm truncate mt-1 text-muted-foreground">{conv.lastMessage}</p>
                    </div>
                    {conv.unread && <Badge className="bg-christina-red text-white text-xs">New</Badge>}
                  </div>
                </button>))}
          </div></CardContent>
        </Card>
        {selected ? (
          <Card className="flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setSelectedId(null)}><ArrowLeft className="h-4 w-4" /></Button>
                <Avatar className="h-10 w-10"><AvatarFallback className="bg-christina-red text-white text-sm">{selected.initials}</AvatarFallback></Avatar>
                <div><CardTitle className="text-base">{selected.name}</CardTitle><p className="text-xs text-muted-foreground">{selected.role}</p></div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {selected.messages.map((msg) => (
                <div key={msg.id} className={msg.isMe ? "flex justify-end" : "flex justify-start"}>
                  <div className={msg.isMe ? "max-w-[80%] rounded-lg p-3 bg-christina-red text-white" : "max-w-[80%] rounded-lg p-3 bg-muted"}>
                    <p className="text-sm">{msg.content}</p>
                    <p className={msg.isMe ? "text-xs mt-1 text-white/70" : "text-xs mt-1 text-muted-foreground"}>{msg.timestamp}</p>
                  </div>
                </div>))}
            </CardContent>
            <div className="border-t p-4"><div className="flex gap-2">
              <Input placeholder="Type a message..." value={replyText} onChange={(e) => setReplyText(e.target.value)} className="flex-1" />
              <Button className="bg-christina-red hover:bg-christina-red/90"><Send className="h-4 w-4" /></Button>
            </div></div>
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
  )
}
