-- Add OAuth sync trigger for Google authentication

-- Function to sync Google OAuth users to users table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.user_metadata ->> 'full_name', NEW.email),
    'Agent',
    NEW.user_metadata ->> 'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = NEW.email,
    name = COALESCE(NEW.user_metadata ->> 'full_name', NEW.email),
    avatar_url = NEW.user_metadata ->> 'avatar_url';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users to sync to public.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger on auth.users update to sync changes
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS policy: Users can read all users (for agent assignment dropdowns)
CREATE POLICY "users_read_all" ON public.users
  FOR SELECT USING (true);

-- RLS policy: Users can update their own profile
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- RLS policy: Admins can update any user role
CREATE POLICY "admins_update_roles" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );
