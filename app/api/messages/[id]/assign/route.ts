import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { agent_id, agent_name, status } = body

    if (!agent_id) {
      return NextResponse.json({ error: "agent_id is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if message exists
    const { data: message, error: messageError } = await supabase
      .from("messages")
      .select("id")
      .eq("id", id)
      .single()

    if (messageError || !message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    // Upsert assignment (insert or update)
    const { data: assignment, error: assignError } = await supabase
      .from("agent_assignments")
      .upsert(
        {
          message_id: id,
          agent_id,
          agent_name: agent_name || `Agent ${agent_id}`,
          status: status || "claimed",
        },
        {
          onConflict: "message_id",
        },
      )
      .select()
      .single()

    if (assignError) {
      console.error("Error assigning message:", assignError)
      return NextResponse.json({ error: "Failed to assign message" }, { status: 500 })
    }

    return NextResponse.json(assignment, { status: 200 })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { error } = await supabase.from("agent_assignments").delete().eq("message_id", id)

    if (error) {
      console.error("Error unassigning message:", error)
      return NextResponse.json({ error: "Failed to unassign message" }, { status: 500 })
    }

    return NextResponse.json({ message: "Message unassigned successfully" }, { status: 200 })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

