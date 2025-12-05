"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X, Loader2 } from "lucide-react"
import type { Message } from "@/lib/api-client"
import { searchMessages } from "@/lib/api-client"

interface SearchBarProps {
  onSearchResults: (results: Message[]) => void
  onSearching?: (searching: boolean) => void
}

export function SearchBar({ onSearchResults, onSearching }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [searching, setSearching] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setSearching(true)
    onSearching?.(true)
    try {
      const data = await searchMessages(query)
      onSearchResults(data)
    } catch (error) {
      console.error("Search error:", error)
      onSearchResults([])
    } finally {
      setSearching(false)
      onSearching?.(false)
    }
  }

  const handleClear = () => {
    setQuery("")
    onSearchResults([])
  }

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search messages, customers, or content..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10 h-11 text-base"
          disabled={searching}
        />
        {query && !searching && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {searching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
        )}
      </div>
      <Button 
        type="submit" 
        disabled={searching || !query.trim()}
        className="h-11 px-6"
      >
        {searching ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Searching...
          </>
        ) : (
          "Search"
        )}
      </Button>
    </form>
  )
}
