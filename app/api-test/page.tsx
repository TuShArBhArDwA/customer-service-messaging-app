"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Code, Copy, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function APITestPage() {
  const [formData, setFormData] = useState({
    customer_email: "test@example.com",
    customer_name: "Test Customer",
    content: "When will my loan be approved?",
    phone: "+1234567890",
  })
  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      setResponse(JSON.stringify(data, null, 2))
    } catch (error) {
      setResponse(JSON.stringify({ error: String(error) }, null, 2))
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(
      JSON.stringify(
        {
          method: "POST",
          url: "/api/messages",
          headers: { "Content-Type": "application/json" },
          body: formData,
        },
        null,
        2,
      ),
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const curlCommand = `curl -X POST ${typeof window !== "undefined" ? window.location.origin : ""}/api/messages \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(formData)}'`

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            API Test - Send Customer Message
          </CardTitle>
          <CardDescription>
            Test the message API endpoint. Use this for Postman or any API client testing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Customer Email *</Label>
                <Input
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Customer Name *</Label>
                <Input
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label>Message Content *</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                rows={4}
              />
            </div>
            <div>
              <Label>Phone (optional)</Label>
              <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Message"}
              </Button>
              <Button type="button" variant="outline" onClick={copyToClipboard}>
                {copied ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy JSON
                  </>
                )}
              </Button>
            </div>
          </form>

          {response && (
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between">
                <Label>API Response</Label>
                <Badge variant="outline">Status: {response.includes("error") ? "Error" : "Success"}</Badge>
              </div>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-96">{response}</pre>
            </div>
          )}

          <div className="mt-6 pt-6 border-t">
            <Label className="mb-2 block">cURL Command</Label>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto">{curlCommand}</pre>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => {
                  navigator.clipboard.writeText(curlCommand)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                }}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
