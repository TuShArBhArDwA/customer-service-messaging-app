"use client"

import { useState } from "react"
import { MessageList } from "@/components/message-list"
import { MessageDetail } from "@/components/message-detail"
import { DashboardNav } from "@/components/dashboard-nav"
import type { Message } from "@/lib/api-client"

export default function DashboardPage() {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

  return (
    <div className="flex flex-col h-screen bg-background">
      <DashboardNav />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-1/3 border-r border-border overflow-hidden">
          <MessageList onSelectMessage={setSelectedMessage} selectedMessageId={selectedMessage?.id} />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <MessageDetail message={selectedMessage} />
        </div>
      </div>
    </div>
  )
}
