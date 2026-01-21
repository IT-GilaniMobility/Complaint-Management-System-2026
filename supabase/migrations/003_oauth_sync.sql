-- Add RLS policies for Google OAuth users
-- Users are synced in the app code after OAuth callback, not via database triggers

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS policy: Users can read all users (for agent assignment dropdowns)
CREATE POLICY "users_read_all" ON public.users
  FOR SELECT USING (true);

-- RLS policy: Users can update their own profile
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);
