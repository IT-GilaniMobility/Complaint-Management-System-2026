# Complete Supabase Setup Guide

This guide will help you set up the full database for the Complaint Management System.

## Prerequisites
- A Supabase project (sign up at https://supabase.com if you don't have one)
- The project URL and keys from your Supabase dashboard

## Step 1: Run the Database Migration

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Copy the entire contents of `supabase/migrations/002_full_schema.sql`
4. Paste it into the SQL Editor
5. Click **Run**

This will create:
- **Tables**: users, categories, complaints, comments, activities
- **Triggers**: Auto-generate complaint numbers, auto-update timestamps
- **Indexes**: For better query performance
- **RLS Policies**: Row-level security (server actions bypass these)
- **Seed Data**: 6 users + 5 categories

## Step 2: Get Your Service Role Key

1. In Supabase dashboard, go to **Settings** > **API**
2. Find the **service_role** key (NOT the anon key)
3. Click the eye icon to reveal it
4. Copy the key

⚠️ **IMPORTANT**: The service role key bypasses ALL security rules. Never expose it to the client or commit it to version control!

## Step 3: Update Environment Variables

Add the service role key to your `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://rsfkygtoqutxelguoqyg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service Role Key (required for server actions)
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
```

## Step 4: Restart the Dev Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

## Step 5: Test the Form

1. Navigate to http://localhost:3000/complaints/new
2. Fill out the form:
   - **Subject**: Test complaint
   - **Description**: Testing Supabase integration
   - **Category**: Select any category
   - **Priority**: Medium
   - **Desired outcome**: Verify it saves to database
3. Click **Submit complaint**
4. You should see a success message with a complaint number like `CMP-20260120-0001`

## Step 6: Verify in Supabase

1. Go to Supabase dashboard
2. Click **Table Editor** in the left sidebar
3. Select the **complaints** table
4. You should see your test complaint!

Run this query in SQL Editor to view all complaints:

```sql
SELECT 
  complaint_number,
  subject,
  status,
  priority,
  category_id,
  desired_outcome,
  created_at
FROM complaints
ORDER BY created_at DESC
LIMIT 10;
```

## Troubleshooting

### "Missing service role key" error
- Make sure you added `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
- Restart the dev server after adding it

### "Cannot insert" or RLS errors
- The server action uses the service role key which bypasses RLS
- Verify the key is correct (starts with `eyJhbGc...` and is much longer than anon key)

### Categories not found
- Run the migration again to ensure seed data was inserted
- Check with: `SELECT * FROM categories;`

### Form doesn't submit
- Check browser console for errors
- Verify `.env.local` has all three keys (URL, anon, service_role)
- Make sure the dev server restarted after env changes

## How It Works

### Server Actions (Secure!)
The app now uses **Next.js Server Actions** to insert data:
- Form submits to `app/actions/complaints.ts`
- Server action uses **service role client** (bypasses RLS)
- Secure: Service role key never exposed to browser
- Production-ready: No need to modify RLS policies

### Database Schema
```
users (seeded with 6 test users)
  ├─ complaints (your form submissions)
  │   ├─ comments
  │   └─ activities
  └─ categories (seeded with 5 + dynamic from "Others")
```

### Category Handling
- **Service Quality**, **Product**, **Technical Support**: Use seeded IDs
- **Provider Conduct**, **Access and Eligibility**, **Privacy Concern**: Created on first use
- **Others**: Creates category with custom name from form input

## Next Steps

- View complaints at `/complaints`
- View dashboard at `/dashboard`
- Manage categories at `/admin/categories`
- Manage users at `/admin/users`

All pages currently use mock data; you can update them to use Supabase queries next!
