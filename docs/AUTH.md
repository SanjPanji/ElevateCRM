# Supabase Authentication Guide

## Overview

The app uses Supabase Auth with email/password authentication. User profiles are automatically created in the `profiles` table.

## Authentication Flow

1. User enters email and password on `/login`
2. Supabase Auth validates credentials
3. Session token is stored in browser (handled by Supabase JS client)
4. User is redirected to `/dashboard`
5. Middleware protects private routes

## User Profile Creation

When a user is created in Supabase Auth, you need to create a corresponding profile record:

### Option 1: Via Supabase Auth Hook (Recommended)

Create a trigger in Supabase that creates a profile when auth.users record is inserted:

```sql
CREATE FUNCTION public.handle_new_user()
RETURNS trigger
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, is_active)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    'employee',
    true
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Option 2: Via Edge Function

When you need more control, create a user via Edge Function that handles profile creation.

## Key Files

- `lib/api/auth.ts` - Authentication helpers
- `lib/supabase/client.ts` - Supabase client setup
- `hooks/useCurrentUser.ts` - React hook for current user
- `middleware.ts` - Route protection
- `app/login/page.tsx` - Login page

## Using Auth in Components

### Get Current User
```tsx
import { useCurrentUser } from '@/hooks/useCurrentUser';

export function MyComponent() {
  const { user, loading, error } = useCurrentUser();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not authenticated</div>;

  return <div>Hello {user.profile?.full_name}</div>;
}
```

### Sign Out
```tsx
import { signOut } from '@/lib/api/auth';

export function LogoutButton() {
  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

## Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Security Notes

- Passwords are never handled by the frontend directly
- Session tokens are stored securely by Supabase SDK
- All authenticated API calls include auth token in headers
- RLS policies enforce row-level access control
- Service role key is never exposed to frontend

## Creating Test Users

In Supabase Dashboard:

1. Go to **Authentication** → **Users**
2. Click **Add user**
3. Enter email and password
4. Check **Auto confirm user**
5. Create user
6. Manually insert profile record:

```sql
INSERT INTO profiles (id, full_name, email, role, is_active)
VALUES (
  'user-uuid-from-auth',
  'Employee Name',
  'employee@example.com',
  'employee',
  true
);
```

## Reset Password (Future Implementation)

When you need password reset functionality:

```tsx
import { supabase } from '@/lib/supabase/client';

const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${location.origin}/auth/callback?next=/update-password`,
});
```
