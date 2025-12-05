# System Architecture

## Overview
The Branch Customer Service Messaging App is built with a modern, scalable architecture:

```
┌─────────────────────────────────────────────────────────┐
│                  Web Browser (Agent)                     │
│        ┌────────────────────────────────────┐            │
│        │   Next.js React Components         │            │
│        │  - Dashboard                       │            │
│        │  - Search                          │            │
│        │  - Message Composer                │            │
│        └────────────────────────────────────┘            │
└──────────────┬──────────────────────────────────────────┘
               │ HTTP/JSON
┌──────────────▼──────────────────────────────────────────┐
│           Next.js API Routes (/app/api)                 │
│        ┌────────────────────────────────────┐            │
│        │  POST /api/messages                │            │
│        │  GET /api/messages                 │            │
│        │  POST /api/messages/[id]/reply     │            │
│        └────────────────────────────────────┘            │
└──────────────┬──────────────────────────────────────────┘
               │ SQL
┌──────────────▼──────────────────────────────────────────┐
│                    Supabase                              │
│  ┌──────────────────────────────────────────────┐        │
│  │   PostgreSQL Database                        │        │
│  │  - customers                                 │        │
│  │  - messages                                  │        │
│  │  - customer_profiles                         │        │
│  │  - canned_messages                           │        │
│  └──────────────────────────────────────────────┘        │
│  ┌──────────────────────────────────────────────┐        │
│  │   Realtime (via polling)                     │        │
│  └──────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────┘
```

## Component Architecture

### Client-Side (React Components)

#### Dashboard Page (`app/dashboard/page.tsx`)
- Main entry point for agents
- Manages selected message state
- Renders MessageList and MessageDetail side-by-side

#### MessageList Component
- Displays sorted list of incoming messages
- Shows urgency badges
- Real-time polling every 3 seconds
- Integrates search functionality
- On click: updates selected message

#### MessageDetail Component
- Shows full message thread
- Displays customer profile information
- Integrates MessageCompose for replies
- Loads customer data on mount

#### MessageCompose Component
- Text area for typing replies
- Integrates CannedMessagesDropdown
- Sends messages via API
- Refreshes message thread on send

#### CustomerProfileCard Component
- Displays customer information
- Shows account and loan status with icons
- Color-coded badges for statuses
- Calculates and displays engagement metrics

#### CannedMessagesDropdown Component
- Dropdown menu of pre-written templates
- Organized by category
- Inserts selected message into compose box

### Server-Side

#### API Routes

**POST /api/messages**
- Accepts customer message submission
- Creates or fetches customer
- Calculates urgency score
- Inserts message into database
- Returns urgency score

**GET /api/messages**
- Fetches all dashboard messages
- Ordered by urgency and recency
- Limited to 50 most recent

**POST /api/messages/[id]/reply**
- Accepts agent reply
- Inserts agent message
- Updates conversation thread

### Data Flow

```
Customer Submits Message
        ↓
POST /api/messages
        ↓
Find/Create Customer
        ↓
Calculate Urgency Score
        ↓
Insert Message
        ↓
Database Updated
        ↓
Agent Dashboard Polls (every 3s)
        ↓
GET /api/messages
        ↓
MessageList Updates
        ↓
Agent Sees New Message
        ↓
Agent Clicks to View
        ↓
MessageDetail Loads Thread
        ↓
Agent Types Reply
        ↓
POST /api/messages/[id]/reply
        ↓
Message Inserted
        ↓
Agent Sees Reply in Thread
```

## Urgency Scoring Algorithm

### Calculation
```typescript
score = 20 (base)
+ 25 × (count of critical keywords)
+ 10 × (count of medium keywords)
+ 20 (if loan_status = 'pending_approval')
+ 15 (if loan_status = 'approved')
+ 10 (if loan_status = 'disbursed')
= max(100)
```

### Critical Keywords
- approval, disburse, disbursement
- when, urgent, asap, emergency
- need, must, immediately

### Medium Keywords
- update, change, edit
- application, status, loan

## Real-Time Strategy

### Current Implementation: Polling
- MessageList polls every 3 seconds
- GET /api/messages
- Updates local state
- Minimal server load

### Future: Supabase Realtime
```typescript
// Will replace polling with:
const subscription = supabase
  .from('messages')
  .on('INSERT', (payload) => {
    // Update message list immediately
  })
  .subscribe()
```

## Scalability Considerations

### Database Optimization
- Indexes on `customer_id`, `created_at`, `urgency_score`, `message_type`
- Materialized views for dashboard queries
- Pagination ready (use `.range()` in queries)

### Performance
- Lazy load customer profiles
- Cache canned messages at component level
- Implement SWR for client-side caching (future)

### Load Handling
- Polling can be increased/decreased based on load
- API routes handle concurrent requests
- Supabase auto-scales PostgreSQL

## Security

### Row Level Security (RLS)
- Not implemented for this demo (agents see all messages)
- Production: Add RLS policies per agent

### Authentication
- Currently no auth (agents identified by agent_id)
- Future: Integrate Supabase Auth

### Data Privacy
- Store only necessary PII
- Consider GDPR compliance for EU customers
- Implement data retention policies
