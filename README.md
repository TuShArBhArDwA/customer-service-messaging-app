# Branch Customer Service Messaging App

<img width="1891" height="972" alt="image" src="https://github.com/user-attachments/assets/c0324903-4cef-4abc-8dab-8e21ccdb347f" />

A complete, production-ready customer service messaging application built with Next.js, Supabase, and TypeScript. This system enables multiple customer service agents to efficiently manage and respond to customer inquiries with intelligent urgency ranking, real-time updates, and streamlined workflows.

## Table of Contents

- [Features](#features)
  - [Core Functionality](#core-functionality)
  - [User Interface](#user-interface)
- [Quick Start](#quick-start)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
  - [Customer Messages](#customer-messages)
  - [Agent Actions](#agent-actions)
  - [Bulk Operations](#bulk-operations)
- [Database Schema](#database-schema)
  - [Tables](#tables)
  - [Views](#views)
- [Key Features Explained](#key-features-explained)
  - [Urgency Ranking](#urgency-ranking)
  - [Real-Time Updates](#real-time-updates)
  - [Agent Assignment](#agent-assignment)
  - [CSV Import](#csv-import)
- [Documentation](#documentation)
- [Development](#development)
  - [Running the Development Server](#running-the-development-server)
  - [Building for Production](#building-for-production)
  - [Linting](#linting)
- [Environment Variables](#environment-variables)
- [License](#license)
- [Contact](#contact)

## Features

### Core Functionality

- **Multi-Agent Support**: Multiple agents can work simultaneously without authentication
- **Real-Time Updates**: Instant message synchronization using Supabase Realtime with fallback polling
- **Intelligent Urgency Ranking**: Automatic scoring (0-100) based on keywords, loan status, and message content
- **Agent Assignment System**:
  - Claim/unclaim messages with visual indicators
  - Assignment badges showing which agent is handling each message
  - Real-time assignment updates across all agents
  - Filter messages by assigned/unassigned status
- **Advanced Search**:
  - Full-text search across message content, customer names, and emails
  - Filter by urgency level (Critical/High/Normal)
  - Filter by assignment status (Assigned/Unassigned)
  - Dedicated search page with comprehensive filtering
- **Customer Profiles**: Comprehensive customer context with loan info, account status, and message history
- **Canned Messages**: Quick reply templates organized by category with improved UI
- **CSV Import**: Bulk import customer messages from CSV files
- **Customer Portal**: Beautiful customer-facing message submission form
- **API Testing**: Built-in API testing interface with cURL command generation
- **Message Threading**: Full conversation history per customer with real-time updates

### User Interface

- Modern, responsive design with Tailwind CSS and shadcn/ui components
- Split-panel dashboard layout with message list and detail view
- Color-coded urgency indicators (Critical/High/Normal)
- Real-time message updates without visible reloading
- Intuitive navigation with dashboard, search, and import pages
- Dark mode support
- Optimistic UI updates for instant feedback
- Background refresh without UI disruption

## Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account (free tier works)
- Git

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up Supabase**

   - Create a new Supabase project
   - Copy your project URL and anon key
   - Create a `.env.local` file:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

3. **Run database migrations** (in order):

   - Go to Supabase Dashboard → SQL Editor
   - Run `scripts/001_create_schema.sql` - Creates all tables
   - Run `scripts/004_create_agent_assignments_table.sql` - Creates assignment tracking table
   - Run `scripts/002_create_materialized_view.sql` - Creates dashboard views
   - **Important**: If you get "column assigned_agent_id does not exist" error, run `FIX_VIEW_NOW.sql` to refresh the view
   - (Optional) Run `scripts/003_seed_sample_data.sql` for sample data

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open the application**
   - Visit `http://localhost:3000` for the agent dashboard
   - Visit `http://localhost:3000/customer` for customer message form
   - Visit `http://localhost:3000/api-test` for API testing
   - Visit `http://localhost:3000/import` for CSV import

## Project Structure

```
app/
├── dashboard/          # Main agent dashboard
├── search/            # Advanced search interface
├── import/            # CSV import page
├── customer/          # Customer-facing form
├── api-test/          # API testing interface
└── api/               # API endpoints
    └── messages/      # Message handling endpoints

components/
├── message-list.tsx           # Message list with real-time updates
├── message-detail.tsx         # Message detail and conversation view
├── message-compose.tsx        # Message reply composer
├── customer-profile-card.tsx  # Customer information display
├── canned-messages-dropdown.tsx # Quick reply templates
├── search-bar.tsx             # Search component
├── dashboard-nav.tsx           # Navigation bar
└── urgency-calculator.ts      # Urgency scoring algorithm

lib/
├── api-client.ts      # API helper functions
└── supabase/          # Supabase client setup

scripts/
├── 001_create_schema.sql              # Database schema (tables)
├── 002_create_materialized_view.sql   # Database views
├── 003_seed_sample_data.sql           # Sample data
├── 004_create_agent_assignments_table.sql  # Agent assignment tracking table
├── 005_refresh_dashboard_view.sql     # View refresh script
└── FIX_VIEW_NOW.sql                   # Quick fix for view issues
```

## API Endpoints

### Customer Messages

- `POST /api/messages` - Submit a customer message
- `GET /api/messages` - Get all dashboard messages

### Agent Actions

- `POST /api/messages/[id]/reply` - Send agent reply
- `POST /api/messages/[id]/assign` - Assign message to agent
- `DELETE /api/messages/[id]/assign` - Unassign message

### Bulk Operations

- `POST /api/messages/import` - Import messages from CSV

See `docs/API.md` for detailed API documentation.

## Database Schema

### Tables

- `customers` - Customer information
- `messages` - All messages (customer and agent)
- `customer_profiles` - Extended customer data
- `agent_assignments` - Message assignment tracking
- `canned_messages` - Response templates

### Views

- `dashboard_messages` - Optimized view for agent dashboard
- `customer_conversations` - Customer conversation summaries

## Key Features Explained

### Urgency Ranking

Messages are automatically scored (0-100) based on:

- Critical keywords (approval, disbursement, urgent, etc.)
- Loan status (pending_approval, approved, disbursed)
- Message patterns (questions about timing, exclamation marks)
- Content analysis (phrases, capitalization)

### Real-Time Updates

- **Supabase Realtime**: Uses postgres_changes subscriptions for instant updates
- **Background Refresh**: Updates happen silently without showing loading states
- **Fallback Polling**: 5-second polling as backup if realtime fails
- **Multi-Table Subscriptions**: Listens to changes in both `messages` and `agent_assignments` tables
- **Thread Updates**: Conversation threads update in real-time when new messages arrive
- **All agents see updates simultaneously** without page refresh

### Agent Assignment

- **Claim/Unclaim Messages**: Click the claim button (✓) to assign a message to yourself
- **Visual Indicators**:
  - Blue left border on assigned messages
  - "You" badge for messages you've claimed
  - Agent name badge for messages assigned to others
- **Real-Time Sync**: Assignment changes appear instantly across all agent screens
- **Filtering**: Filter messages by assigned/unassigned status in both dashboard and search
- **Optimistic Updates**: UI updates immediately before API confirmation for better UX
- **Assignment Tracking**: All assignments stored in `agent_assignments` table with timestamps

### CSV Import

Supports CSV files with columns:

- `email` or `customer_email`
- `name` or `customer_name`
- `content` or `message` or `text`
- `phone` (optional)
- `created_at` (optional)

## Troubleshooting

### View Missing Assignment Columns

If you get the error `column dashboard_messages.assigned_agent_id does not exist`:

1. Run `FIX_VIEW_NOW.sql` in Supabase SQL Editor
2. This recreates the view with proper assignment columns
3. Refresh your browser (hard refresh: `Ctrl+Shift+R`)

### Assignment Not Showing

- Ensure `agent_assignments` table exists (run `scripts/004_create_agent_assignments_table.sql`)
- Verify the view includes assignment columns (run `FIX_VIEW_NOW.sql`)
- Check browser console for debug logs showing assignment data

### Real-Time Not Working

- Check Supabase Realtime is enabled for your tables
- Verify your Supabase project has Realtime enabled
- The app falls back to polling automatically if realtime fails

## Documentation

- [Setup Guide](docs/SETUP.md) - Detailed setup instructions
- [Architecture](docs/ARCHITECTURE.md) - System architecture overview
- [API Documentation](docs/API.md) - API endpoint details
- [Features](docs/FEATURES.md) - Complete feature list
- [PRD](docs/PRD.md) - Product requirements document
- [Deployment](docs/DEPLOYMENT.md) - Deployment guide

## Development

### Running the Development Server

```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime subscriptions
- **Styling**: Tailwind CSS + shadcn/ui components
- **UI Components**: Radix UI primitives
- **State Management**: React hooks + localStorage
- **Deployment**: Vercel-ready

## Environment Variables

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

Optional (for production):

- `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` - For server-side operations (if needed)


## License

This project is part of a customer service messaging application for Branch.

## Contact

- **Meet T-Bot** - [Discover My Work](https://t-bot-blush.vercel.app/)
- **Tushar Bhardwaj** - [Portfolio](https://tushar-bhardwaj.vercel.app/)
- **Connect 1:1** - [Topmate](https://topmate.io/tusharbhardwaj)
- **GitHub:** [TuShArBhArDwA](https://github.com/TuShArBhArDwA)
- **LinkedIn:** [Tushar Bhardwaj](https://www.linkedin.com/in/bhardwajtushar2004/)
- **Email:** [tusharbhardwaj2617@example.com](mailto:tusharbhardwaj2617@example.com)

---

_Built with [Next.js](https://nextjs.org) and [Supabase](https://supabase.com)_
