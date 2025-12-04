import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { content, agent_id } = body

    if (!content) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: message, error: messageError } = await supabase
      .from("messages")
      .insert({
        customer_id: id,
        content,
        message_type: "agent",
        agent_id: agent_id || "system",
      })
      .select()
      .single()

    if (messageError) {
      console.error("Error inserting reply:", messageError)
      return NextResponse.json({ error: "Failed to save reply" }, { status: 500 })
    }

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
