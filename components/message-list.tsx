"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Message } from "@/lib/api-client"
import { getDashboardMessages, assignMessage, unassignMessage } from "@/lib/api-client"
import { createClient } from "@/lib/supabase/client"
import { Search, UserCheck, UserX } from "lucide-react"

interface MessageListProps {
  onSelectMessage: (message: Message) => void
  selectedMessageId?: string
}

export function MessageList({ onSelectMessage, selectedMessageId }: MessageListProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [agentId] = useState(() => {
    // Generate or retrieve agent ID from localStorage
    if (typeof window !== "undefined") {
      let id = localStorage.getItem("agent_id")
      if (!id) {
        id = `agent-${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem("agent_id", id)
      }
      return id
    }
    return "agent-001"
  })
  const [agentName] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("agent_name") || `Agent ${agentId.slice(-4)}`
    }
    return `Agent ${agentId.slice(-4)}`
  })
  const supabaseRef = useRef(createClient())

  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true)
      const data = await getDashboardMessages()
      setMessages(data)
      setLoading(false)
    }

    loadMessages()

    // Set up real-time subscription
    const supabase = supabaseRef.current
    const channel = supabase
      .channel("messages-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: "message_type=eq.customer",
        },
        () => {
          // Reload messages when changes occur
          loadMessages()
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "agent_assignments",
        },
        () => {
          // Reload messages when assignments change
          loadMessages()
        },
      )
      .subscribe()

    // Fallback polling every 5 seconds (in case realtime doesn't work)
    const interval = setInterval(loadMessages, 5000)

    return () => {
      clearInterval(interval)
      supabase.removeChannel(channel)
    }
  }, [])

  const filteredMessages = messages.filter(
    (msg) =>
      msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.customer_name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getUrgencyColor = (score: number) => {
    if (score >= 80) return "bg-red-100 text-red-800 border-red-300"
    if (score >= 50) return "bg-yellow-100 text-yellow-800 border-yellow-300"
    return "bg-green-100 text-green-800 border-green-300"
  }

  const getUrgencyLabel = (score: number) => {
    if (score >= 80) return "Critical"
    if (score >= 50) return "High"
    return "Normal"
  }

  const handleClaimMessage = async (e: React.MouseEvent, message: Message) => {
    e.stopPropagation()
    try {
      if (message.assigned_agent_id === agentId) {
        // Unclaim if already claimed by this agent
        await unassignMessage(message.id)
      } else {
        // Claim message
        await assignMessage(message.id, agentId, agentName, "claimed")
      }
      // Reload messages
      const data = await getDashboardMessages()
      setMessages(data)
    } catch (error) {
      console.error("Error claiming message:", error)
    }
  }

  return (
    <Card className="h-full flex flex-col border-0">
      <CardHeader className="space-y-4 pb-4">
        <CardTitle>Incoming Messages</CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search messages or customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-2 p-0 px-4">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading messages...</div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No messages found</div>
        ) : (
          filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className={`border rounded-lg p-3 cursor-pointer hover:bg-accent transition-colors ${
                selectedMessageId === msg.id ? "bg-accent border-primary" : ""
              } ${msg.assigned_agent_id ? "border-l-4 border-l-blue-500" : ""}`}
              onClick={() => onSelectMessage(msg)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-semibold truncate">{msg.customer_name}</span>
                    <Badge variant="outline" className={getUrgencyColor(msg.urgency_score)}>
                      {getUrgencyLabel(msg.urgency_score)}
                    </Badge>
                    {msg.assigned_agent_id && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-300">
                        {msg.assigned_agent_id === agentId ? "You" : msg.assigned_agent_name || msg.assigned_agent_id}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{msg.customer_email}</p>
                  <p className="text-sm truncate mt-1">{msg.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(msg.created_at).toLocaleString()}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleClaimMessage(e, msg)}
                  className="flex-shrink-0"
                  title={msg.assigned_agent_id === agentId ? "Unclaim message" : "Claim message"}
                >
                  {msg.assigned_agent_id === agentId ? (
                    <UserX className="w-4 h-4 text-blue-600" />
                  ) : (
                    <UserCheck className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
