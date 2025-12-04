import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { calculateUrgency } from "@/components/urgency-calculator"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customer_email, customer_name, content, phone } = body

    if (!customer_email || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    let customerId: string
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("email", customer_email)
      .single()

    if (existingCustomer) {
      customerId = existingCustomer.id
    } else {
      const { data: newCustomer, error: insertError } = await supabase
        .from("customers")
        .insert({
          email: customer_email,
          name: customer_name || "Unknown",
          phone: phone || null,
        })
        .select("id")
        .single()

      if (insertError) {
        console.error("Error creating customer:", insertError)
        return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
      }

      customerId = newCustomer!.id
    }

    const { data: profile } = await supabase
      .from("customer_profiles")
      .select("loan_status")
      .eq("customer_id", customerId)
      .single()

    const urgencyScore = calculateUrgency(content, profile?.loan_status)

    const { data: message, error: messageError } = await supabase
      .from("messages")
      .insert({
        customer_id: customerId,
        content,
        message_type: "customer",
        urgency_score: urgencyScore,
      })
      .select()
      .single()

    if (messageError) {
      console.error("Error inserting message:", messageError)
      return NextResponse.json({ error: "Failed to save message" }, { status: 500 })
    }

    return NextResponse.json({ message, urgencyScore }, { status: 201 })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("dashboard_messages").select("*").limit(50)

    if (error) {
      throw error
    }

    return NextResponse.json({ messages: data })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}
