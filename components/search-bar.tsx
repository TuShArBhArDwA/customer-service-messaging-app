"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, X } from "lucide-react"
import type { Message } from "@/lib/api-client"
import { searchMessages } from "@/lib/api-client"

interface SearchBarProps {
  onSearchResults: (results: Message[]) => void
  onSelectMessage: (message: Message) => void
}

export function SearchBar({ onSearchResults, onSelectMessage }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Message[]>([])
  const [searching, setSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setSearching(true)
    const data = await searchMessages(query)
    setResults(data)
    setShowResults(true)
    onSearchResults(data)
    setSearching(false)
  }

  const handleClear = () => {
    setQuery("")
    setResults([])
    setShowResults(false)
    onSearchResults([])
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search messages, customers, or content..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" disabled={searching || !query.trim()}>
          {searching ? "Searching..." : "Search"}
        </Button>
        {query && (
          <Button type="button" variant="outline" onClick={handleClear}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </form>

      {showResults && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Found {results.length} result{results.length !== 1 ? "s" : ""}
          </p>
          {results.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.map((msg) => (
                <Card key={msg.id} className="cursor-pointer hover:bg-accent" onClick={() => onSelectMessage(msg)}>
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">{msg.customer_name}</p>
                        <p className="text-sm text-muted-foreground">{msg.customer_email}</p>
                      </div>
                      <Badge variant="outline">
                        {msg.urgency_score >= 80 ? "Critical" : msg.urgency_score >= 50 ? "High" : "Normal"}
                      </Badge>
                    </div>
                    <p className="text-sm truncate">{msg.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(msg.created_at).toLocaleString()}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No results found for "{query}"
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
