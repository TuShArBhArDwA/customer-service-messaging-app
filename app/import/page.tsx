"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileText, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { DashboardNav } from "@/components/dashboard-nav"

interface ImportResult {
  success: number
  failed: number
  errors: string[]
  message: string
}

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
    }
  }

  const parseCSV = (text: string): any[] => {
    const lines = text.split("\n").filter((line) => line.trim())
    if (lines.length < 2) return []

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""))
    const messages = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""))
      if (values.length < headers.length) continue

      const message: any = {}
      headers.forEach((header, index) => {
        message[header] = values[index] || ""
      })

      // Normalize field names
      const normalized: any = {
        customer_email: message.email || message.customer_email || message["customer email"],
        customer_name: message.name || message.customer_name || message["customer name"],
        content: message.content || message.message || message.text || message.body,
        phone: message.phone || message.phone_number || message["phone number"] || null,
        created_at: message.created_at || message["created at"] || message.timestamp || null,
      }

      if (normalized.customer_email && normalized.content) {
        messages.push(normalized)
      }
    }

    return messages
  }

  const handleImport = async () => {
    if (!file) return

    setLoading(true)
    setResult(null)

    try {
      const text = await file.text()
      const messages = parseCSV(text)

      if (messages.length === 0) {
        setResult({
          success: 0,
          failed: 0,
          errors: ["No valid messages found in CSV file"],
          message: "No messages to import",
        })
        setLoading(false)
        return
      }

      const res = await fetch("/api/messages/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      })

      const data = await res.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: 0,
        failed: 0,
        errors: [error instanceof Error ? error.message : "Unknown error"],
        message: "Failed to import messages",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <DashboardNav />
      <div className="p-6 max-w-3xl mx-auto space-y-6 flex-1 overflow-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Import Customer Messages from CSV
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="csv-file">CSV File</Label>
            <div className="flex items-center gap-4">
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={loading}
                className="flex-1"
              />
              {file && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  {file.name}
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              CSV should contain columns: email (or customer_email), name (or customer_name), content (or message),
              phone (optional), created_at (optional)
            </p>
          </div>

          <Button onClick={handleImport} disabled={!file || loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import Messages
              </>
            )}
          </Button>

          {result && (
            <Card className={result.failed === 0 ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  {result.failed === 0 ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-yellow-600" />
                  )}
                  <p className="font-semibold">{result.message}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Successfully imported</p>
                    <p className="font-semibold text-green-600">{result.success}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Failed</p>
                    <p className="font-semibold text-red-600">{result.failed}</p>
                  </div>
                </div>
                {result.errors.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold mb-2">Errors:</p>
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {result.errors.slice(0, 10).map((error, idx) => (
                        <p key={idx} className="text-xs text-red-600">
                          {error}
                        </p>
                      ))}
                      {result.errors.length > 10 && (
                        <p className="text-xs text-muted-foreground">... and {result.errors.length - 10} more errors</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="pt-4 border-t">
            <Button variant="outline" onClick={() => router.push("/dashboard")} className="w-full">
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">CSV Format Example</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
            {`email,customer_name,content,phone,created_at
john@example.com,John Doe,When will my loan be approved?,+1234567890,2024-01-15T10:00:00Z
jane@example.com,Jane Smith,How do I update my account information?,+0987654321,2024-01-15T11:00:00Z
bob@example.com,Bob Wilson,When will my loan be disbursed?,+1122334455,2024-01-15T12:00:00Z`}
          </pre>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}

