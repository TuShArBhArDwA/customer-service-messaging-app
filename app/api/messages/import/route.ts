import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { calculateUrgency } from "@/components/urgency-calculator"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages } = body

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 })
    }

    const supabase = await createClient()
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    }

    for (const msg of messages) {
      try {
        const { customer_email, customer_name, content, phone, created_at } = msg

        if (!customer_email || !content) {
          results.failed++
          results.errors.push(`Missing required fields for message: ${content?.substring(0, 50)}...`)
          continue
        }

        // Find or create customer
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
            results.failed++
            results.errors.push(`Failed to create customer ${customer_email}: ${insertError.message}`)
            continue
          }

          customerId = newCustomer!.id
        }

        // Get customer profile for urgency calculation
        const { data: profile } = await supabase
          .from("customer_profiles")
          .select("loan_status")
          .eq("customer_id", customerId)
          .single()

        const urgencyScore = calculateUrgency(content, profile?.loan_status)

        // Insert message
        const { error: messageError } = await supabase.from("messages").insert({
          customer_id: customerId,
          content,
          message_type: "customer",
          urgency_score: urgencyScore,
          created_at: created_at || new Date().toISOString(),
        })

        if (messageError) {
          results.failed++
          results.errors.push(`Failed to insert message: ${messageError.message}`)
          continue
        }

        results.success++
      } catch (error) {
        results.failed++
        results.errors.push(`Error processing message: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    return NextResponse.json(
      {
        message: `Imported ${results.success} messages successfully, ${results.failed} failed`,
        ...results,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("CSV import error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

