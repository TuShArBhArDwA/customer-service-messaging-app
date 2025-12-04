"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SearchBar } from "@/components/search-bar"
import { MessageDetail } from "@/components/message-detail"
import type { Message } from "@/lib/api-client"

export default function SearchPage() {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [searchResults, setSearchResults] = useState<Message[]>([])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 h-screen overflow-auto">
      {/* Search Panel */}
      <Card className="border-0 h-fit md:sticky md:top-6">
        <CardHeader>
          <CardTitle>Search Messages & Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <SearchBar onSearchResults={setSearchResults} onSelectMessage={setSelectedMessage} />
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
  )
}
