"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { sendMessage } from "@/lib/api-client"
import { Loader2 } from "lucide-react"
import { CannedMessagesDropdown } from "@/components/canned-messages-dropdown"

interface MessageComposeProps {
  customerId: string
  onMessageSent: () => void
  agentId?: string
}

export function MessageCompose({ customerId, onMessageSent, agentId }: MessageComposeProps) {
  const [currentAgentId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("agent_id") || agentId || "agent-001"
    }
    return agentId || "agent-001"
  })
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSend = async () => {
    if (!content.trim()) {
      setError("Message cannot be empty")
      return
    }

    setLoading(true)
    setError("")

    try {
      await sendMessage(customerId, content, currentAgentId)
      setContent("")
      onMessageSent()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message")
    } finally {
      setLoading(false)
    }
  }

  const handleCannedMessage = (content: string) => {
    setContent(content)
  }

  return (
    <Card className="border-0 border-t">
      <CardContent className="p-4">
        <div className="space-y-3">
          <Textarea
            placeholder="Type your response here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            disabled={loading}
            className="resize-none"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-2 justify-between">
            <CannedMessagesDropdown onSelectMessage={handleCannedMessage} />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setContent("")} disabled={loading}>
                Clear
              </Button>
              <Button onClick={handleSend} disabled={loading || !content.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reply"
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
