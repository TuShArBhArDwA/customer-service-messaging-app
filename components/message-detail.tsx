"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Message, CustomerProfile } from "@/lib/api-client"
import { getCustomerProfile, getCustomerMessages } from "@/lib/api-client"
import { MessageCompose } from "@/components/message-compose"
import { useRouter } from "next/navigation"
import { CustomerProfileCard } from "@/components/customer-profile-card"

interface MessageDetailProps {
  message: Message | null
}

export function MessageDetail({ message }: MessageDetailProps) {
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [allMessages, setAllMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const loadData = async (msg: Message) => {
    setLoading(true)
    const [profileData, messagesData] = await Promise.all([
      getCustomerProfile(msg.customer_id),
      getCustomerMessages(msg.customer_id),
    ])
    setProfile(profileData)
    setAllMessages(messagesData)
    setLoading(false)
  }

  useEffect(() => {
    if (!message) return
    loadData(message)
  }, [message])

  const handleMessageSent = () => {
    if (message) {
      loadData(message)
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
      <Card className="flex-none border-0 border-b overflow-hidden">
        <CardHeader className="pb-4">
          <div className="space-y-4">
            <CustomerProfileCard
              profile={profile}
              customerName={message.customer_name}
              customerEmail={message.customer_email}
            />
            <Separator />
            <div className="space-y-3">
              {profile && (
                <>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Account Status</p>
                      <Badge variant="outline" className="mt-1">
                        {profile.account_status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Account Age</p>
                      <p className="font-medium mt-1">{profile.account_age_days} days</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Loan Status</p>
                      <Badge variant="outline" className="mt-1">
                        {profile.loan_status || "N/A"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Loan Amount</p>
                      <p className="font-medium mt-1">${profile.loan_amount?.toFixed(2) || "N/A"}</p>
                    </div>
                  </div>
                  <Separator />
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

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
