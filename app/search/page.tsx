"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SearchBar } from "@/components/search-bar"
import { MessageDetail } from "@/components/message-detail"
import { DashboardNav } from "@/components/dashboard-nav"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { Message } from "@/lib/api-client"
import { assignMessage, unassignMessage, getDashboardMessages, getMessageById } from "@/lib/api-client"
import { Filter, X as XIcon, AlertCircle, UserCheck, UserX } from "lucide-react"

export default function SearchPage() {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [searchResults, setSearchResults] = useState<Message[]>([])
  const [searching, setSearching] = useState(false)
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [agentId] = useState(() => {
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

  const filteredResults = searchResults.filter((msg) => {
    if (urgencyFilter !== "all") {
      if (urgencyFilter === "critical" && msg.urgency_score < 80) return false
      if (urgencyFilter === "high" && (msg.urgency_score < 50 || msg.urgency_score >= 80)) return false
      if (urgencyFilter === "normal" && msg.urgency_score >= 50) return false
    }
    if (statusFilter !== "all") {
      // Check if message is assigned (has a valid assigned_agent_id)
      const isAssigned = msg.assigned_agent_id != null && msg.assigned_agent_id !== "" && msg.assigned_agent_id !== undefined
      if (statusFilter === "assigned" && !isAssigned) return false
      if (statusFilter === "unassigned" && isAssigned) return false
    }
    return true
  })

  const hasActiveFilters = urgencyFilter !== "all" || statusFilter !== "all"

  const clearFilters = () => {
    setUrgencyFilter("all")
    setStatusFilter("all")
  }

  const getUrgencyColor = (score: number) => {
    if (score >= 80) return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
    if (score >= 50) return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800"
    return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
  }

  const handleClaimMessage = async (e: React.MouseEvent, message: Message) => {
    e.stopPropagation()
    
    // Optimistically update UI immediately
    const isCurrentlyAssigned = message.assigned_agent_id != null && message.assigned_agent_id !== "" && message.assigned_agent_id !== undefined
    const wasAssigned = isCurrentlyAssigned && message.assigned_agent_id === agentId
    const updatedResults = searchResults.map((msg) =>
      msg.id === message.id
        ? {
            ...msg,
            assigned_agent_id: wasAssigned ? null : agentId,
            assigned_agent_name: wasAssigned ? null : agentName,
          }
        : msg,
    )
    setSearchResults(updatedResults)
    
    // Update selected message if it's the one being claimed
    if (selectedMessage?.id === message.id) {
      setSelectedMessage({
        ...selectedMessage,
        assigned_agent_id: wasAssigned ? null : agentId,
        assigned_agent_name: wasAssigned ? null : agentName,
      })
    }

    try {
      if (wasAssigned) {
        await unassignMessage(message.id)
      } else {
        await assignMessage(message.id, agentId, agentName, "claimed")
      }
      // Wait a moment for the database to commit the transaction
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Reload search results to get fresh assignment data
      // Re-run the search if we have a search query, otherwise reload from dashboard
      const data = await getDashboardMessages()
      console.log(`[handleClaimMessage] Reloaded ${data.length} messages after ${wasAssigned ? 'unclaim' : 'claim'}`)
      
      // Update search results with fresh data
      const updatedData = searchResults.map((msg) => {
        const freshMsg = data.find((m) => m.id === msg.id)
        if (freshMsg) {
          console.log(`[handleClaimMessage] Updated search result for ${msg.id}:`, {
            old_assigned: msg.assigned_agent_id,
            new_assigned: freshMsg.assigned_agent_id,
          })
        }
        return freshMsg || msg
      })
      setSearchResults(updatedData)
      
      // Update selected message if it's the one being claimed
      if (selectedMessage?.id === message.id) {
        const freshSelected = data.find((m) => m.id === message.id)
        if (freshSelected) {
          setSelectedMessage(freshSelected)
        }
      }
    } catch (error) {
      console.error("Error claiming message:", error)
      // On error, try to get fresh data for this message
      try {
        const freshMessage = await getMessageById(message.id)
        if (freshMessage) {
          const updatedData = searchResults.map((msg) =>
            msg.id === message.id ? freshMessage : msg
          )
          setSearchResults(updatedData)
        }
      } catch (refreshError) {
        console.error("Error refreshing message:", refreshError)
      }
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <DashboardNav />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 flex-1 overflow-auto">
        {/* Search Panel */}
        <Card className="border shadow-sm h-fit lg:sticky lg:top-6">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Filter className="w-5 h-5" />
              Search Messages & Customers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <SearchBar onSearchResults={setSearchResults} onSearching={setSearching} />

            {searchResults.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">Filters</h3>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                      >
                        <XIcon className="w-3 h-3" />
                        Clear filters
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium mb-2 block text-foreground">Urgency Level</label>
                      <div className="flex gap-2 flex-wrap">
                        {[
                          { value: "all", label: "All" },
                          { value: "critical", label: "Critical" },
                          { value: "high", label: "High" },
                          { value: "normal", label: "Normal" },
                        ].map((filter) => (
                          <Badge
                            key={filter.value}
                            variant={urgencyFilter === filter.value ? "default" : "outline"}
                            className={`cursor-pointer transition-all hover:scale-105 ${
                              urgencyFilter === filter.value
                                ? "shadow-sm"
                                : "hover:bg-accent"
                            }`}
                            onClick={() => setUrgencyFilter(filter.value)}
                          >
                            {filter.label}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block text-foreground">Assignment Status</label>
                      <div className="flex gap-2 flex-wrap">
                        {[
                          { value: "all", label: "All" },
                          { value: "assigned", label: "Assigned" },
                          { value: "unassigned", label: "Unassigned" },
                        ].map((filter) => (
                          <Badge
                            key={filter.value}
                            variant={statusFilter === filter.value ? "default" : "outline"}
                            className={`cursor-pointer transition-all hover:scale-105 ${
                              statusFilter === filter.value
                                ? "shadow-sm"
                                : "hover:bg-accent"
                            }`}
                            onClick={() => setStatusFilter(filter.value)}
                          >
                            {filter.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">
                      Showing <span className="font-semibold text-foreground">{filteredResults.length}</span> of{" "}
                      <span className="font-semibold text-foreground">{searchResults.length}</span> result
                      {searchResults.length !== 1 ? "s" : ""}
                      {hasActiveFilters && filteredResults.length !== searchResults.length && (
                        <span className="ml-1 text-xs">(filtered)</span>
                      )}
                    </p>
                  </div>
                </div>
              </>
            )}

            {searchResults.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">Results</h3>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                    {filteredResults.length > 0 ? (
                      filteredResults.map((msg) => (
                        <Card
                          key={msg.id}
                          className={`cursor-pointer transition-all hover:shadow-md border ${
                            selectedMessage?.id === msg.id
                              ? "ring-2 ring-primary shadow-md"
                              : "hover:border-primary/50"
                          } ${msg.assigned_agent_id != null && msg.assigned_agent_id !== "" && msg.assigned_agent_id !== undefined ? "border-l-4 border-l-blue-500" : ""}`}
                          onClick={() => setSelectedMessage(msg)}
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3 gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <p className="font-semibold truncate text-foreground">{msg.customer_name}</p>
                                  <Badge variant="outline" className={`text-xs ${getUrgencyColor(msg.urgency_score)}`}>
                                    {msg.urgency_score >= 80 ? "Critical" : msg.urgency_score >= 50 ? "High" : "Normal"}
                                  </Badge>
                                  {msg.assigned_agent_id != null && msg.assigned_agent_id !== "" && msg.assigned_agent_id !== undefined && (
                                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                                        {msg.assigned_agent_id === agentId ? "You" : msg.assigned_agent_name || "Assigned"}
                                      </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground truncate">{msg.customer_email}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => handleClaimMessage(e, msg)}
                                className="shrink-0"
                                title={
                                  msg.assigned_agent_id != null && msg.assigned_agent_id !== "" && msg.assigned_agent_id === agentId
                                    ? "Unclaim message"
                                    : "Claim message"
                                }
                              >
                                {msg.assigned_agent_id != null && msg.assigned_agent_id !== "" && msg.assigned_agent_id === agentId ? (
                                  <UserX className="w-4 h-4 text-blue-600" />
                                ) : (
                                  <UserCheck className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                            <p className="text-sm text-foreground/90 line-clamp-2 mb-3">{msg.content}</p>
                            <div className="flex items-center justify-between pt-2 border-t">
                              <p className="text-xs text-muted-foreground">
                                {new Date(msg.created_at).toLocaleString()}
                              </p>
                              {msg.loan_status && (
                                <Badge variant="outline" className="text-xs">
                                  {msg.loan_status.replace(/_/g, " ")}
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <Card className="border-dashed">
                        <CardContent className="p-6 text-center">
                          <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm font-medium text-foreground mb-1">No results match your filters</p>
                          <p className="text-xs text-muted-foreground">
                            Try adjusting your filter criteria
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </>
            )}

            {!searching && searchResults.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  Enter a search query to find messages and customers
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Panel */}
        <div className="lg:sticky lg:top-6 h-fit">
          {selectedMessage ? (
            <MessageDetail message={selectedMessage} />
          ) : (
            <Card className="border shadow-sm">
              <CardContent className="p-12 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Filter className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">No message selected</p>
                    <p className="text-xs text-muted-foreground">
                      Select a message from the search results to view details
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
