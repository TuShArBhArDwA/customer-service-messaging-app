"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SearchBar } from "@/components/search-bar"
import { MessageDetail } from "@/components/message-detail"
import { DashboardNav } from "@/components/dashboard-nav"
import { Badge } from "@/components/ui/badge"
import type { Message } from "@/lib/api-client"
import { Filter } from "lucide-react"

export default function SearchPage() {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [searchResults, setSearchResults] = useState<Message[]>([])
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredResults = searchResults.filter((msg) => {
    if (urgencyFilter !== "all") {
      if (urgencyFilter === "critical" && msg.urgency_score < 80) return false
      if (urgencyFilter === "high" && (msg.urgency_score < 50 || msg.urgency_score >= 80)) return false
      if (urgencyFilter === "normal" && msg.urgency_score >= 50) return false
    }
    if (statusFilter !== "all") {
      if (statusFilter === "assigned" && !msg.assigned_agent_id) return false
      if (statusFilter === "unassigned" && msg.assigned_agent_id) return false
    }
    return true
  })

  return (
    <div className="flex flex-col h-screen">
      <DashboardNav />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 flex-1 overflow-auto">
      {/* Search Panel */}
      <Card className="border-0 h-fit md:sticky md:top-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Search Messages & Customers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SearchBar onSearchResults={setSearchResults} onSelectMessage={setSelectedMessage} />

          {searchResults.length > 0 && (
            <div className="space-y-3 pt-4 border-t">
              <div>
                <label className="text-sm font-medium mb-2 block">Filter by Urgency</label>
                <div className="flex gap-2 flex-wrap">
                  {["all", "critical", "high", "normal"].map((filter) => (
                    <Badge
                      key={filter}
                      variant={urgencyFilter === filter ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setUrgencyFilter(filter)}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Filter by Status</label>
                <div className="flex gap-2 flex-wrap">
                  {["all", "assigned", "unassigned"].map((filter) => (
                    <Badge
                      key={filter}
                      variant={statusFilter === filter ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setStatusFilter(filter)}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </Badge>
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Showing {filteredResults.length} of {searchResults.length} results
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Panel */}
      {selectedMessage ? (
        <MessageDetail message={selectedMessage} />
      ) : (
        <Card className="border-0 flex items-center justify-center">
          <p className="text-muted-foreground">Select a message to view details</p>
        </Card>
      )}
      </div>
    </div>
  )
}
