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
import { MessageSquarePlus, Loader2, Sparkles } from "lucide-react"

interface CannedMessagesDropdownProps {
  onSelectMessage: (content: string) => void
}

export function CannedMessagesDropdown({ onSelectMessage }: CannedMessagesDropdownProps) {
  const [messages, setMessages] = useState<CannedMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

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

  const handleSelect = (content: string) => {
    onSelectMessage(content)
    setOpen(false)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={loading} className="gap-2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Quick Reply
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80 max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Loading templates...</span>
          </div>
        ) : Object.keys(groupedByCategory).length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-sm text-muted-foreground">No templates available</p>
          </div>
        ) : (
          <>
            <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Quick Reply Templates
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Object.entries(groupedByCategory).map(([category, msgs], categoryIndex) => (
              <div key={category}>
                <DropdownMenuLabel className="px-3 py-2 text-xs font-medium text-foreground sticky top-0 bg-background z-10">
                  {category}
                </DropdownMenuLabel>
                {msgs.map((msg) => (
                  <DropdownMenuItem
                    key={msg.id}
                    onClick={() => handleSelect(msg.content)}
                    className="cursor-pointer px-3 py-2.5 focus:bg-accent"
                  >
                    <div className="flex flex-col gap-1.5 w-full">
                      <span className="text-sm font-semibold text-foreground leading-tight">{msg.title}</span>
                      <span className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{msg.content}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
                {categoryIndex < Object.keys(groupedByCategory).length - 1 && <DropdownMenuSeparator />}
              </div>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
