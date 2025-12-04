import { createClient } from "@/lib/supabase/client"

export interface Message {
  id: string
  content: string
  message_type: "customer" | "agent"
  urgency_score: number
  created_at: string
  agent_id: string | null
  customer_id: string
  customer_email: string
  customer_name: string
  loan_status: string | null
  account_status: string | null
  customer_message_count: number
}

export interface Customer {
  id: string
  email: string
  name: string
  phone: string | null
  created_at: string
}

export interface CustomerProfile {
  id: string
  customer_id: string
  account_status: string
  account_age_days: number | null
  total_messages: number
  loan_status: string | null
  loan_amount: number | null
}

export interface CannedMessage {
  id: string
  title: string
  content: string
  category: string
}

// Fetch dashboard messages with urgency ranking
export async function getDashboardMessages(limit = 50) {
  const supabase = createClient()
  const { data, error } = await supabase.from("dashboard_messages").select("*").limit(limit)

  if (error) {
    console.error("Error fetching dashboard messages:", error)
    return []
  }
  return (data as Message[]) || []
}

// Fetch conversations for the agent
export async function getConversations() {
  const supabase = createClient()
  const { data, error } = await supabase.from("customer_conversations").select("*")

  if (error) {
    console.error("Error fetching conversations:", error)
    return []
  }
  return data || []
}

// Fetch messages for a specific customer
export async function getCustomerMessages(customerId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching customer messages:", error)
    return []
  }
  return data || []
}

// Fetch customer profile
export async function getCustomerProfile(customerId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("customer_profiles").select("*").eq("customer_id", customerId).single()

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching customer profile:", error)
  }
  return data as CustomerProfile | null
}

// Send a message (agent reply)
export async function sendMessage(customerId: string, content: string, agentId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("messages").insert({
    customer_id: customerId,
    content,
    message_type: "agent",
    agent_id: agentId,
  })

  if (error) {
    console.error("Error sending message:", error)
    throw error
  }
  return data
}

// Search messages and customers
export async function searchMessages(query: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("dashboard_messages")
    .select("*")
    .or(`content.ilike.%${query}%,customer_email.ilike.%${query}%,customer_name.ilike.%${query}%`)
    .limit(50)

  if (error) {
    console.error("Error searching messages:", error)
    return []
  }
  return (data as Message[]) || []
}

// Fetch canned messages
export async function getCannedMessages() {
  const supabase = createClient()
  const { data, error } = await supabase.from("canned_messages").select("*")

  if (error) {
    console.error("Error fetching canned messages:", error)
    return []
  }
  return (data as CannedMessage[]) || []
}
