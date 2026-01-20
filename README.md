# Complaint Management System - Neo-Brutalist Edition

A modern complaint management dashboard with **Neo-Brutalist UI design** and **Supabase backend integration**.

## 🎨 Features

- **Neo-Brutalist Design**: Bold borders, hard shadows, bright colors, and Space Grotesk typography
- **Supabase Integration**: Real-time database with PostgreSQL backend
- **Complaint Management**: Track, assign, and resolve complaints with SLA monitoring
- **Admin Controls**: User management, category configuration, and settings
- **Responsive Layout**: Works on desktop and mobile with collapsible sidebar

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Create/update your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the database migration:
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and run the SQL from `supabase/migrations/001_initial_schema.sql`

This will create:
- Tables: `users`, `categories`, `complaints`, `comments`, `activities`
- Auto-generating complaint numbers (CMP-YYYYMMDD-0001)
- Row Level Security policies
- Sample seed data (6 users, 5 categories)

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
├── app/
│   ├── dashboard/          # Main dashboard page
│   ├── complaints/         # Complaints list, detail, and create
│   └── admin/              # Admin pages (users, categories, settings)
├── components/
│   ├── ui/                 # Neo-brutalist UI components
│   ├── layout/             # Sidebar, topbar, app shell
│   └── complaints/         # Complaint-specific components
├── lib/
│   ├── supabase/           # Supabase client, queries, types
│   ├── mock-data.ts        # Fallback mock data
│   └── utils.ts            # Utility functions
└── supabase/
    └── migrations/         # Database schema SQL files
```

## 🎨 Neo-Brutalist Design System

### Colors
- **Primary**: Bold purple (`#9C27B0`)
- **Secondary**: Bright yellow (`#FFEB3B`)
- **Accent**: Hot pink (`#FF4081`)
- **Borders**: Pure black (`#000000`)
- **Background**: Cream/off-white

### Typography
- **Font**: Space Grotesk (grotesque/cursor-style font)
- **Weight**: Bold (500-700) for most text
- **Transform**: Uppercase for headings and labels
- **Tracking**: Wide letter-spacing

### Shadows
- **Brutal Shadow**: `4px 4px 0px 0px rgba(0,0,0,1)`
- **Brutal Shadow Large**: `8px 8px 0px 0px rgba(0,0,0,1)`
- **Brutal Shadow XL**: `12px 12px 0px 0px rgba(0,0,0,1)`

### Borders
- **Thickness**: 3-5px for main elements
- **Color**: Always black
- **Radius**: 0 (sharp corners everywhere)

## 📊 Database Schema

### Tables

**users**
- `id`, `name`, `email`, `role`, `avatar_url`
- Roles: Admin, Lead Agent, Agent, Staff

**categories**
- `id`, `name`, `description`, `sla_hours`

**complaints**
- `id`, `complaint_number`, `subject`, `description`
- `status`, `priority`, `category_id`, `reporter_id`, `assigned_to_id`
- `due_date`, `resolved_at`, `created_at`, `updated_at`
- Customer info: `customer_name`, `customer_email`, `customer_phone`

**comments**
- `id`, `complaint_id`, `user_id`, `content`, `is_internal`

**activities**
- `id`, `complaint_id`, `user_id`, `action`, `details`

### Key Features

- **Auto-generated complaint numbers**: Format `CMP-20260120-0001`
- **Automatic timestamps**: `created_at` and `updated_at`
- **Row Level Security**: Policies for read/write access
- **Foreign key constraints**: Maintain data integrity

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📝 Usage Notes

### Without Supabase
The app will work without Supabase configured (will show empty data). The dashboard gracefully handles missing data.

### With Supabase
Make sure to:
1. Run the migration SQL in your Supabase project
2. Enable Row Level Security (done automatically in migration)
3. Add environment variables to `.env.local`

## 🎯 Key Components

### UI Components (`components/ui/`)
- `button` - Brutalist buttons with shadow animation
- `card` - Cards with thick borders and bold headers
- `input` - Inputs with shadow on focus
- `badge` - Status badges with custom colors
- `table` - Data tables with heavy borders

### Layout Components
- `app-shell` - Main layout wrapper with sidebar
- `sidebar` - Collapsible navigation
- `topbar` - Search, notifications, user menu

### Complaint Components
- `summary-cards` - KPI cards with colorful headers
- `complaint-table` - TanStack table with filtering
- `filter-bar` - Search and filter controls

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project to Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

## 📄 License

MIT
