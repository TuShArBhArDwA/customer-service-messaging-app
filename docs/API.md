# API Documentation

## Base URL
\`\`\`
http://localhost:3000/api
\`\`\`

## Endpoints

### 1. Submit Customer Message
**POST** `/messages`

Creates or updates a customer and inserts their message.

#### Request Body
\`\`\`json
{
  "customer_email": "john@example.com",
  "customer_name": "John Doe",
  "content": "When will my loan be approved?",
  "phone": "+1234567890"  // optional
}
\`\`\`

#### Response (201 Created)
\`\`\`json
{
  "message": {
    "id": "uuid",
    "customer_id": "uuid",
    "content": "When will my loan be approved?",
    "message_type": "customer",
    "urgency_score": 85,
    "agent_id": null,
    "created_at": "2025-01-15T10:30:00Z"
  },
  "urgencyScore": 85
}
\`\`\`

#### Error Responses
\`\`\`json
// 400 Bad Request
{
  "error": "Missing required fields"
}

// 500 Internal Server Error
{
  "error": "Failed to create customer"
}
\`\`\`

### 2. Fetch Dashboard Messages
**GET** `/messages`

Retrieves all incoming messages sorted by urgency and recency.

#### Query Parameters
- None (currently)

#### Response (200 OK)
\`\`\`json
{
  "messages": [
    {
      "id": "uuid",
      "content": "When will my loan be disbursed?",
      "message_type": "customer",
      "urgency_score": 95,
      "created_at": "2025-01-15T10:30:00Z",
      "agent_id": null,
      "customer_id": "uuid",
      "customer_email": "john@example.com",
      "customer_name": "John Doe",
      "loan_status": "approved",
      "account_status": "active",
      "customer_message_count": 3
    }
  ]
}
\`\`\`

### 3. Send Agent Reply
**POST** `/messages/[id]/reply`

Sends an agent reply to a customer.

#### Path Parameters
- `id` - Customer ID (UUID)

#### Request Body
\`\`\`json
{
  "content": "Your loan has been approved and will be disbursed within 1-2 business days.",
  "agent_id": "agent-001"  // optional
}
\`\`\`

#### Response (201 Created)
\`\`\`json
{
  "id": "uuid",
  "customer_id": "uuid",
  "content": "Your loan has been approved...",
  "message_type": "agent",
  "urgency_score": 0,
  "agent_id": "agent-001",
  "created_at": "2025-01-15T10:35:00Z"
}
\`\`\`

#### Error Responses
\`\`\`json
// 400 Bad Request
{
  "error": "Message content is required"
}

// 500 Internal Server Error
{
  "error": "Failed to save reply"
}
\`\`\`

## Client Library Functions

### getDashboardMessages(limit = 50)
Fetches messages for the dashboard.

\`\`\`typescript
import { getDashboardMessages, type Message } from '@/lib/api-client'

const messages: Message[] = await getDashboardMessages()
\`\`\`

### getCustomerMessages(customerId: string)
Fetches all messages for a specific customer.

\`\`\`typescript
const messages = await getCustomerMessages('customer-uuid')
\`\`\`

### getCustomerProfile(customerId: string)
Fetches customer profile information.

\`\`\`typescript
import { getCustomerProfile, type CustomerProfile } from '@/lib/api-client'

const profile: CustomerProfile | null = await getCustomerProfile('customer-uuid')
\`\`\`

### sendMessage(customerId: string, content: string, agentId: string)
Sends an agent reply.

\`\`\`typescript
import { sendMessage } from '@/lib/api-client'

await sendMessage('customer-uuid', 'Reply text', 'agent-001')
\`\`\`

### searchMessages(query: string)
Searches messages by content, customer email, or customer name.

\`\`\`typescript
import { searchMessages, type Message } from '@/lib/api-client'

const results: Message[] = await searchMessages('loan approval')
\`\`\`

### getCannedMessages()
Fetches all pre-defined response templates.

\`\`\`typescript
import { getCannedMessages, type CannedMessage } from '@/lib/api-client'

const templates: CannedMessage[] = await getCannedMessages()
\`\`\`

## Example Usage

### Submit Customer Message via cURL
\`\`\`bash
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "customer_email": "alice@example.com",
    "customer_name": "Alice Smith",
    "content": "How do I update my account information?",
    "phone": "+1987654321"
  }'
\`\`\`

### Submit Customer Message via JavaScript
\`\`\`typescript
const response = await fetch('/api/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customer_email: 'alice@example.com',
    customer_name: 'Alice Smith',
    content: 'How do I update my account information?',
    phone: '+1987654321'
  })
})

const data = await response.json()
console.log('Urgency Score:', data.urgencyScore)
\`\`\`

### Send Agent Reply
\`\`\`typescript
const response = await fetch('/api/messages/[CUSTOMER_ID]/reply', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: 'You can update your account info in the Profile settings.',
    agent_id: 'agent-001'
  })
})

const message = await response.json()
console.log('Reply sent:', message.id)
\`\`\`

## Rate Limiting
Currently no rate limiting. Consider implementing:
- 100 requests per minute per IP
- 1000 requests per hour per customer

## Authentication
Currently no authentication. Production implementation should use:
- API keys for customer message submission
- JWT tokens for agent dashboard access
- Rate limiting per API key
