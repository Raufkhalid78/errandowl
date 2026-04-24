"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Send } from "lucide-react"

type Message = {
  id: string
  booking_id: string
  sender_id: string
  text: string
  read: boolean
  created_at: string
  profiles?: { name: string, avatar_url?: string }
}

interface ChatInterfaceProps {
  userId: string;
  bookingId: string;
}

export function ChatInterface({ userId, bookingId }: ChatInterfaceProps) {
  const [messages, setMessages] = React.useState<Message[]>([])
  const [newMessage, setNewMessage] = React.useState("")
  const [isSending, setIsSending] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const supabase = createClient()
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    // 1. Fetch initial messages
    const fetchMessages = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("messages")
        .select("*, profiles:sender_id(name, avatar_url)")
        .eq("booking_id", bookingId)
        .order("created_at", { ascending: true })

      if (!error && data) {
        setMessages(data)
      }
      setLoading(false)
    }

    fetchMessages()

    // 2. Subscribe to real-time changes
    const channel = supabase
      .channel(`chat:${bookingId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `booking_id=eq.${bookingId}`,
        },
        async (payload) => {
          const newMsg = payload.new as Message
          // Fetch sender profile for the new message
          const { data: profile } = await supabase
            .from("profiles")
            .select("name, avatar_url")
            .eq("id", newMsg.sender_id)
            .single()
          
          setMessages((prev) => [...prev, { ...newMsg, profiles: profile || undefined }])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, bookingId])

  // Auto-scroll to bottom
  React.useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current
      scrollElement.scrollTop = scrollElement.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setIsSending(true)

    const messageData = {
      booking_id: bookingId,
      sender_id: userId,
      text: newMessage.trim(),
    }

    const { error } = await supabase
      .from("messages")
      .insert(messageData)

    if (error) {
      console.error("Error sending message:", error)
    } else {
      setNewMessage("")
    }

    setIsSending(false)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-owl-violet" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-card/30 backdrop-blur-sm border rounded-2xl overflow-hidden glass shadow-xl">
      <div className="border-b p-4 bg-muted/30">
        <h3 className="font-semibold">Booking Chat</h3>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Booking ID: {bookingId.slice(0, 8)}</p>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-12 italic text-sm">
              Start the conversation...
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === userId
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    isMe ? "items-end" : "items-start"
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    {!isMe && (
                      <span className="text-[10px] font-bold text-owl-violet uppercase">
                        {msg.profiles?.name}
                      </span>
                    )}
                    <span className="text-[9px] text-muted-foreground">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm shadow-sm ${
                      isMe
                        ? "bg-owl-violet text-white rounded-tr-none"
                        : "bg-muted rounded-tl-none border border-border/50"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </ScrollArea>

      <div className="p-4 bg-background/50 border-t">
        <form
          onSubmit={handleSendMessage}
          className="flex w-full items-center space-x-2"
        >
          <Input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isSending}
            className="flex-1 h-11 rounded-xl bg-background border-border/50 focus:ring-owl-violet/20"
          />
          <Button 
            type="submit" 
            disabled={isSending || !newMessage.trim()}
            className="h-11 w-11 rounded-xl bg-owl-violet hover:bg-owl-violet-dark text-white p-0 flex items-center justify-center shadow-lg shadow-owl-violet/20"
          >
            {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </form>
      </div>
    </div>
  )
}
