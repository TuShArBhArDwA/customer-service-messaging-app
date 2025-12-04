# Branch Customer Service Messaging App - Setup Guide

## Overview
This is a complete customer service messaging application built with Next.js, Supabase, and TypeScript. It allows customer service agents to manage incoming customer inquiries with intelligent urgency ranking, customer profiling, and quick response templates.

## Prerequisites
- Node.js 18+ and npm/yarn
- Supabase account
- Git

## Environment Variables
The app uses the following Supabase environment variables (automatically set up):
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - For server-side operations (optional for this project)

## Initial Setup

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Run Database Migration
The database schema is pre-defined in `scripts/001_create_schema.sql`. To create the database:

1. Go to the Supabase dashboard
2. Navigate to SQL Editor
3. Create a new query and paste the contents of `scripts/001_create_schema.sql`
4. Execute the query

Alternatively, you can run it from the scripts folder in the v0 environment.

### 3. Seed Sample Data
Run `scripts/003_seed_sample_data.sql` to populate the database with sample customers and canned messages.

### 4. Run Development Server
\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to see the application.

## Project Structure

\`\`\`
app/
├── dashboard/          # Main agent dashboard
├── search/            # Search interface
├── api/
│   └── messages/      # API endpoints for message handling
├── api-test/          # Testing page for API
└── layout.tsx         # Root layout

components/
├── message-list.tsx           # Displays incoming messages
├── message-detail.tsx         # Shows message details and conversation
├── message-compose.tsx        # Message reply composer
├── customer-profile-card.tsx  # Customer information display
├── canned-messages-dropdown.tsx # Quick response templates
├── search-bar.tsx             # Global search component
└── urgency-calculator.ts      # Urgency scoring algorithm

lib/
├── api-client.ts      # Supabase query helper functions
├── supabase/
│   ├── client.ts      # Browser client initialization
│   └── server.ts      # Server-side client initialization
└── utils.ts           # Utility functions

docs/
├── PRD.md             # Product requirements document
├── SETUP.md           # This file
├── ARCHITECTURE.md    # System architecture
└── API.md             # API documentation
\`\`\`

## Key Features

### 1. Intelligent Urgency Ranking
Messages are scored based on:
- Keywords (approval, disbursement, urgent, etc.)
- Customer loan status
- Message recency
- Score: 0-100 (80+ = Critical, 50-79 = High, <50 = Normal)

### 2. Agent Dashboard
- Split-panel interface with message list and detail view
- Real-time polling (updates every 3 seconds)
- Quick search across messages and customers
- Urgency badges with color coding

### 3. Customer Profile Context
Displays:
- Account status and age
- Loan status and amount
- Message history
- Total messages from customer

### 4. Quick Reply Templates
Pre-defined responses organized by category:
- Loan Status
- Account Information
- Payment Instructions
- Approval Timeline
- Disbursement Status

### 5. Message API
- POST `/api/messages` - Submit customer messages
- GET `/api/messages` - Fetch all dashboard messages
- POST `/api/messages/[id]/reply` - Send agent replies

## Database Schema

### Customers Table
- `id` - UUID primary key
- `email` - Customer email
- `name` - Customer name
- `phone` - Optional phone number
- `created_at` - Timestamp

### Messages Table
- `id` - UUID primary key
- `customer_id` - FK to customers
- `content` - Message text
- `message_type` - 'customer' or 'agent'
- `urgency_score` - 0-100 score
- `agent_id` - Which agent replied (if applicable)
- `created_at` - Timestamp

### Customer Profiles Table
- `id` - UUID primary key
- `customer_id` - FK to customers
- `account_status` - 'active', 'suspended', 'inactive'
- `account_age_days` - Days since account creation
- `loan_status` - 'pending_approval', 'approved', 'disbursed', etc.
- `loan_amount` - Loan amount in decimal

### Canned Messages Table
- `id` - UUID primary key
- `title` - Display title
- `content` - Message template
- `category` - Organization category

## Testing

### Using the API Test Page
Navigate to `http://localhost:3000/api-test` to manually test the message API:
1. Fill in customer details
2. Enter message content
3. Click "Send Message"
4. View the API response

### Using Postman/cURL
\`\`\`bash
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "customer_email": "customer@example.com",
    "customer_name": "John Doe",
    "content": "When will my loan be approved?",
    "phone": "+1234567890"
  }'
\`\`\`

## Deployment

### Deploy to Vercel
1. Push code to GitHub
2. Connect repository to Vercel
3. Add Supabase environment variables
4. Deploy

\`\`\`bash
vercel --prod
\`\`\`

## Troubleshooting

### Messages Not Appearing
- Check Supabase connection
- Verify database schema is created
- Check browser console for errors

### Real-time Updates Not Working
- Verify polling interval in `message-list.tsx`
- Check network requests in browser DevTools
- Ensure API endpoints are accessible

### Urgency Score Always Low
- Review `urgency-calculator.ts` keyword list
- Update keywords based on your business needs
- Check customer profile data is populated

## Next Steps

1. **Import Real Data**: Replace sample data with actual customer messages from CSV
2. **Customize Urgency**: Adjust keywords and scoring in `urgency-calculator.ts`
3. **Add Authentication**: Implement agent authentication with Supabase Auth
4. **Real WebSockets**: Replace polling with Supabase Realtime subscription
5. **Analytics**: Add message metrics and agent performance tracking
6. **Email Notifications**: Send alerts for critical messages

## Support
For issues or questions, refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
