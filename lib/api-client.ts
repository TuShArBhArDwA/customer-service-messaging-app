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
  assigned_agent_id?: string | null
  assigned_agent_name?: string | null
  assignment_status?: string | null
  assigned_at?: string | null
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
  external_profile_url?: string | null
  internal_notes?: string | null
  risk_score?: number | null
  last_activity_at?: string | null
}

export interface CannedMessage {
  id: string
  title: string
  content: string
  category: string
}

// Fetch dashboard messages with urgency ranking
// Orders by urgency_score DESC, then by created_at DESC to show newest messages first within same urgency
export async function getDashboardMessages(limit = 50) {
  const supabase = createClient()
  
  // Explicitly select all columns including assignment fields
  const { data, error } = await supabase
    .from("dashboard_messages")
    .select(`
      id,
      content,
      message_type,
      urgency_score,
      created_at,
      agent_id,
      customer_id,
      customer_email,
      customer_name,
      loan_status,
      account_status,
      assigned_agent_id,
      assigned_agent_name,
      assignment_status,
      assigned_at,
      customer_message_count
    `)
    .order("urgency_score", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching dashboard messages:", error)
    console.error("Error details:", JSON.stringify(error, null, 2))
    return []
  }
  
  // Debug: Log assignment data to verify it's being returned
  if (data && data.length > 0) {
    const assignedMessages = data.filter((msg: any) => {
      const hasAssignment = msg.assigned_agent_id != null && 
                           msg.assigned_agent_id !== "" && 
                           msg.assigned_agent_id !== undefined
      return hasAssignment
    })
    console.log(`[getDashboardMessages] Total messages: ${data.length}, Assigned: ${assignedMessages.length}`)
    
    // Log all messages with their assignment status for debugging
    data.forEach((msg: any, index: number) => {
      if (index < 3) { // Log first 3 messages
        console.log(`[getDashboardMessages] Message ${index + 1}:`, {
          id: msg.id?.substring(0, 8) + '...',
          assigned_agent_id: msg.assigned_agent_id,
          assigned_agent_name: msg.assigned_agent_name,
          assignment_status: msg.assignment_status,
          hasAssignment: msg.assigned_agent_id != null && msg.assigned_agent_id !== "" && msg.assigned_agent_id !== undefined,
        })
      }
    })
    
    if (assignedMessages.length > 0) {
      console.log("[getDashboardMessages] Sample assigned message:", {
        id: assignedMessages[0].id,
        assigned_agent_id: assignedMessages[0].assigned_agent_id,
        assigned_agent_name: assignedMessages[0].assigned_agent_name,
        assignment_status: assignedMessages[0].assignment_status,
      })
    } else {
      console.warn("[getDashboardMessages] WARNING: No assigned messages found in results!")
    }
  } else {
    console.warn("[getDashboardMessages] No data returned from view")
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
  
  // Debug: Log assignment data
  if (data && data.length > 0) {
    const assignedMessages = data.filter((msg: any) => msg.assigned_agent_id != null)
    console.log(`[searchMessages] Total results: ${data.length}, Assigned: ${assignedMessages.length}`)
  }
  
  return (data as Message[]) || []
}

// Get a single message with fresh assignment data
export async function getMessageById(messageId: string): Promise<Message | null> {
  const supabase = createClient()
  
  // First try to get from view
  let { data, error } = await supabase
    .from("dashboard_messages")
    .select("*")
    .eq("id", messageId)
    .single()

  // If view doesn't have assignment data, query directly from tables
  if (!error && (!data || !data.assigned_agent_id)) {
    // Query messages with assignment join directly
    const { data: directData, error: directError } = await supabase
      .from("messages")
      .select(`
        *,
        customers!inner(*),
        customer_profiles(*),
        agent_assignments(*)
      `)
      .eq("id", messageId)
      .single()
    
    if (!directError && directData) {
      // Transform to match Message interface
      const customer = directData.customers
      const profile = Array.isArray(directData.customer_profiles) ? directData.customer_profiles[0] : directData.customer_profiles
      const assignment = Array.isArray(directData.agent_assignments) ? directData.agent_assignments[0] : directData.agent_assignments
      
      data = {
        id: directData.id,
        content: directData.content,
        message_type: directData.message_type,
        urgency_score: directData.urgency_score,
        created_at: directData.created_at,
        agent_id: directData.agent_id,
        customer_id: customer.id,
        customer_email: customer.email,
        customer_name: customer.name,
        loan_status: profile?.loan_status || null,
        account_status: profile?.account_status || null,
        customer_message_count: 1, // Would need separate query for accurate count
        assigned_agent_id: assignment?.agent_id || null,
        assigned_agent_name: assignment?.agent_name || null,
        assignment_status: assignment?.status || null,
        assigned_at: assignment?.assigned_at || null,
      }
    }
  }

  if (error && !data) {
    console.error("Error fetching message:", error)
    return null
  }
  
  // Debug: Log assignment data
  if (data) {
    console.log(`[getMessageById] Message ${messageId}:`, {
      assigned_agent_id: data.assigned_agent_id,
      assigned_agent_name: data.assigned_agent_name,
      assignment_status: (data as any).assignment_status,
      raw_data: data,
    })
  }
  
  return (data as Message) || null
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

// Assign message to agent
export async function assignMessage(messageId: string, agentId: string, agentName?: string, status = "claimed") {
  const response = await fetch(`/api/messages/${messageId}/assign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agent_id: agentId, agent_name: agentName, status }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const errorMessage = errorData.error || "Failed to assign message"
    const error = new Error(errorMessage)
    if (errorData.hint) {
      console.error("Hint:", errorData.hint)
      console.error("Details:", errorData.details)
    }
    throw error
  }

  return response.json()
}

// Unassign message
export async function unassignMessage(messageId: string) {
  const response = await fetch(`/api/messages/${messageId}/assign`, {
    method: "DELETE",
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const errorMessage = errorData.error || "Failed to unassign message"
    const error = new Error(errorMessage)
    if (errorData.hint) {
      console.error("Hint:", errorData.hint)
      console.error("Details:", errorData.details)
    }
    throw error
  }

  return response.json()
}
