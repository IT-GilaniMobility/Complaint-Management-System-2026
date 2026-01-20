# Google OAuth & User Management Setup

This document explains how the user management system works with Google OAuth authentication.

## How It Works

### 1. Google OAuth Login Flow
- Users log in via Google OAuth on the login page (`/login`)
- After successful authentication, `auth.callback` handles the redirect
- Google profile data (email, name, avatar) is stored in Supabase `auth.users`

### 2. Automatic User Sync (via Trigger)
- A database trigger (`on_auth_user_created`) automatically syncs authenticated users to the `public.users` table
- The trigger extracts:
  - **Email**: From Google account
  - **Name**: From `user_metadata.full_name` or defaults to email
  - **Avatar**: From `user_metadata.avatar_url`
  - **Role**: Defaults to `'Agent'` for new OAuth users
  - **ID**: Uses the auth.users UUID

### 3. Role Assignment
- New Google OAuth users start as `'Agent'` by default
- Admins can promote users to other roles via the Admin Users page (`/admin/users`)
- Available roles:
  - **Admin**: Full system access, can manage users and roles
  - **Lead Agent**: Can manage complaints and supervise agents
  - **Agent**: Can view and work on assigned complaints
  - **Staff**: Limited access (read-only)

## Files Modified/Created

### Database Migrations
- **`supabase/migrations/002_full_schema.sql`**: Main schema with users table and RLS policies
- **`supabase/migrations/003_oauth_sync.sql`**: Trigger for syncing OAuth users

### Server Actions
- **`app/actions/seed.ts`**: Contains `seedUsers()` and `seedCategories()` functions
- **`app/actions/admin.ts`**: `updateUserRole()` server action

### API Endpoints
- **`app/api/admin/users/route.ts`**: GET endpoint to fetch all users from Supabase

### Pages
- **`app/admin/users/page.tsx`**: Admin interface to manage user roles

## Setup Instructions

### 1. Run Database Migrations

In your Supabase project:

1. Go to **SQL Editor**
2. Create a new query and copy/paste the contents of `supabase/migrations/002_full_schema.sql`
3. Run the query
4. Create another query and copy/paste `supabase/migrations/003_oauth_sync.sql`
5. Run the query

### 2. Seed Initial Data (Optional)

If you want to pre-populate users and categories:

```typescript
import { seedUsers, seedCategories } from "@/app/actions/seed";

// Call these from a route or page during setup
await seedUsers();
await seedCategories();
```

Or use the Supabase dashboard to insert sample data directly.

### 3. Configure Google OAuth

Ensure your Supabase project has Google OAuth configured:

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Google provider
3. Add your Google Client ID and Secret
4. Set redirect URL: `https://your-domain.com/auth/callback`

### 4. Test the Flow

1. Go to `/login`
2. Click "Sign in with Google"
3. Complete Google authentication
4. You should be automatically synced to the users table
5. Go to `/admin/users` to verify and assign roles

## Row Level Security (RLS)

The following policies are in place:

- **Select**: Authenticated users can read all users and categories
- **Update (users)**: Only Admins can update user roles
- **Update (complaints)**: Authenticated users can update complaints
- **Delete (categories)**: Only Admins can delete categories
- **Insert**: Service role can create records (for server actions)

## Key Tables

### users
```sql
id UUID (from auth.users)
name TEXT
email TEXT
role TEXT ('Admin' | 'Lead Agent' | 'Agent' | 'Staff')
avatar_url TEXT
created_at TIMESTAMPTZ
```

### auth.users (Supabase managed)
```
id UUID (primary key)
email TEXT
user_metadata {
  full_name: string,
  avatar_url: string,
  ...
}
```

## Troubleshooting

### Users not appearing after login
1. Check Supabase logs for trigger errors
2. Verify `auth.users` table has the OAuth user
3. Ensure `public.users` table has RLS enabled
4. Check if the trigger function has proper permissions

### Can't update user roles
1. Verify you're logged in as an Admin
2. Check RLS policy for users table
3. Review server action errors in browser console

### Google OAuth not working
1. Verify Google OAuth is enabled in Supabase
2. Check Redirect URL matches your app
3. Ensure Client ID and Secret are correct
4. Check SUPABASE_URL and SUPABASE_ANON_KEY env vars

## Next Steps

- Set up email notifications for role changes
- Add audit logging for user permission changes
- Implement team/department assignments
- Add two-factor authentication
