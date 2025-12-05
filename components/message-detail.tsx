"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Message, CustomerProfile } from "@/lib/api-client"
import { getCustomerProfile, getCustomerMessages } from "@/lib/api-client"
import { MessageCompose } from "@/components/message-compose"
import { useRouter } from "next/navigation"
import { CustomerProfileCard } from "@/components/customer-profile-card"
import { createClient } from "@/lib/supabase/client"

interface MessageDetailProps {
  message: Message | null
}

export function MessageDetail({ message }: MessageDetailProps) {
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [allMessages, setAllMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabaseRef = useRef(createClient())
  const customerIdRef = useRef<string | null>(null)

  const loadData = async (customerId: string, showLoading = true) => {
    if (showLoading) {
      setLoading(true)
    }
    try {
      const [profileData, messagesData] = await Promise.all([
        getCustomerProfile(customerId),
        getCustomerMessages(customerId),
      ])
      setProfile(profileData)
      setAllMessages(messagesData)
    } catch (error) {
      console.error("Error loading message data:", error)
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    if (!message) {
      customerIdRef.current = null
      return
    }

    const customerId = message.customer_id
    customerIdRef.current = customerId
    loadData(customerId, true)

    // Set up real-time subscription for thread updates
    const supabase = supabaseRef.current
    const channel = supabase
      .channel(`messages-${customerId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `customer_id=eq.${customerId}`,
        },
        () => {
          // Reload messages in background when new messages arrive
          if (customerIdRef.current === customerId) {
            loadData(customerId, false)
          }
        },
      )
      .subscribe()

    // Fallback polling every 3 seconds for thread updates
    const interval = setInterval(() => {
      if (customerIdRef.current === customerId) {
        loadData(customerId, false)
      }
    }, 3000)

    return () => {
      clearInterval(interval)
      supabase.removeChannel(channel)
    }
  }, [message])

  const handleMessageSent = () => {
    if (message) {
      loadData(message.customer_id, false)
    }
    router.refresh()
  }

  if (!message) {
    return (
      <Card className="h-full flex items-center justify-center border-0">
        <p className="text-muted-foreground">Select a message to view details</p>
      </Card>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {profile && (
        <Card className="flex-none border-0 border-b overflow-hidden">
          <CardHeader className="pb-4">
            <CustomerProfileCard
              profile={profile}
              customerName={message.customer_name}
              customerEmail={message.customer_email}
            />
          </CardHeader>
        </Card>
      )}

      <CardContent className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-3">Conversation</h4>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading messages...</p>
            ) : (
              <div className="space-y-3">
                {allMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-lg ${
                      msg.message_type === "customer"
                        ? "bg-blue-50 border-l-4 border-blue-500"
                        : "bg-gray-50 border-l-4 border-gray-500"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-sm">
                        {msg.message_type === "customer" ? message.customer_name : "Agent"}
                      </span>
                      <span className="text-xs text-muted-foreground">{new Date(msg.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <MessageCompose customerId={message.customer_id} onMessageSent={handleMessageSent} />
    </div>
  )
}
