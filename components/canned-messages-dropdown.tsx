"use client"

import { useEffect, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { getCannedMessages } from "@/lib/api-client"
import type { CannedMessage } from "@/lib/api-client"
import { MessageSquarePlus } from "lucide-react"

interface CannedMessagesDropdownProps {
  onSelectMessage: (content: string) => void
}

export function CannedMessagesDropdown({ onSelectMessage }: CannedMessagesDropdownProps) {
  const [messages, setMessages] = useState<CannedMessage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMessages = async () => {
      const data = await getCannedMessages()
      setMessages(data)
      setLoading(false)
    }

    loadMessages()
  }, [])

  const groupedByCategory = messages.reduce(
    (acc, msg) => {
      const category = msg.category || "General"
      if (!acc[category]) acc[category] = []
      acc[category].push(msg)
      return acc
    },
    {} as Record<string, CannedMessage[]>,
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={loading}>
          <MessageSquarePlus className="mr-2 h-4 w-4" />
          Quick Reply
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {loading ? (
          <DropdownMenuItem disabled>Loading templates...</DropdownMenuItem>
        ) : Object.keys(groupedByCategory).length === 0 ? (
          <DropdownMenuItem disabled>No templates available</DropdownMenuItem>
        ) : (
          Object.entries(groupedByCategory).map(([category, msgs]) => (
            <div key={category}>
              <DropdownMenuLabel className="text-xs">{category}</DropdownMenuLabel>
              {msgs.map((msg) => (
                <DropdownMenuItem key={msg.id} onClick={() => onSelectMessage(msg.content)} className="cursor-pointer">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">{msg.title}</span>
                    <span className="text-xs text-muted-foreground truncate">{msg.content}</span>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </div>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
