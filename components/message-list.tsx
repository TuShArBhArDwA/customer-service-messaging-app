"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Message } from "@/lib/api-client"
import { getDashboardMessages } from "@/lib/api-client"
import { Search } from "lucide-react"

interface MessageListProps {
  onSelectMessage: (message: Message) => void
  selectedMessageId?: string
}

export function MessageList({ onSelectMessage, selectedMessageId }: MessageListProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true)
      const data = await getDashboardMessages()
      setMessages(data)
      setLoading(false)
    }

    loadMessages()
    const interval = setInterval(loadMessages, 3000)
    return () => clearInterval(interval)
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
      <CardContent className="flex-1 overflow-y-auto space-y-2 p-0 px-6">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading messages...</div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No messages found</div>
        ) : (
          filteredMessages.map((msg) => (
            <Button
              key={msg.id}
              variant="outline"
              className="w-full h-auto py-3 px-4 justify-start text-left bg-transparent"
              onClick={() => onSelectMessage(msg)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold truncate">{msg.customer_name}</span>
                  <Badge variant="outline" className={getUrgencyColor(msg.urgency_score)}>
                    {getUrgencyLabel(msg.urgency_score)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">{msg.customer_email}</p>
                <p className="text-sm truncate mt-1">{msg.content}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(msg.created_at).toLocaleString()}</p>
              </div>
            </Button>
          ))
        )}
      </CardContent>
    </Card>
  )
}
