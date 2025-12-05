# Branch Customer Service Messaging App


<img width="1918" height="963" alt="image" src="https://github.com/user-attachments/assets/5642658a-31aa-4380-9242-3b8396149e0b" />


A complete customer service messaging application built with Next.js, Supabase, and TypeScript. This system enables multiple customer service agents to efficiently manage and respond to customer inquiries with intelligent urgency ranking, real-time updates, and streamlined workflows.

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
- [Database Schema](#-database-schema)
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
- **Real-Time Updates**: Instant message synchronization using Supabase Realtime
- **Intelligent Urgency Ranking**: Automatic scoring based on keywords, loan status, and message content
- **Agent Assignment**: Agents can claim/unclaim messages with visual indicators
- **Advanced Search**: Full-text search with filters for urgency and assignment status
- **Customer Profiles**: Comprehensive customer context with loan info, account status, and more
- **Canned Messages**: Quick reply templates organized by category
- **CSV Import**: Bulk import customer messages from CSV files
- **Customer Portal**: Beautiful customer-facing message submission form
- **API Testing**: Built-in API testing interface with cURL command generation

### User Interface
- Modern, responsive design with Tailwind CSS
- Split-panel dashboard layout
- Color-coded urgency indicators
- Real-time message updates
- Intuitive navigation

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

3. **Run database migrations**
   - Go to Supabase Dashboard → SQL Editor
   - Run `scripts/001_create_schema.sql`
   - Run `scripts/002_create_materialized_view.sql`
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
├── 001_create_schema.sql              # Database schema
├── 002_create_materialized_view.sql   # Database views
└── 003_seed_sample_data.sql           # Sample data
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
- Uses Supabase Realtime subscriptions for instant updates
- Falls back to 5-second polling if needed
- All agents see updates simultaneously

### Agent Assignment
- Click the claim button to assign a message to yourself
- Visual indicators show which agent is handling which message
- Can unclaim messages to make them available again

### CSV Import
Supports CSV files with columns:
- `email` or `customer_email`
- `name` or `customer_name`
- `content` or `message` or `text`
- `phone` (optional)
- `created_at` (optional)

## Documentation

- [Setup Guide](docs/SETUP.md) - Detailed setup instructions
- [Architecture](docs/ARCHITECTURE.md) - System architecture overview
- [API Documentation](docs/API.md) - API endpoint details
- [Features](docs/FEATURES.md) - Complete feature list
- [PRD](docs/PRD.md) - Product requirements document

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

## Environment Variables

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

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

*Built with [Next.js](https://nextjs.org) and [Supabase](https://supabase.com)*
