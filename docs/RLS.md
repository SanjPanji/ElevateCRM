# Row Level Security (RLS) Guide

## Overview

All business tables have RLS enabled to enforce fine-grained access control at the database level.

## Security Model

### Roles
- **admin** - Full access to all data, can manage employees
- **manager** - Can view/manage all leads and appointments
- **employee** - Can only view/manage leads assigned to them

## Table Policies

### profiles
- **SELECT**: Anyone authenticated can view all profiles
- **UPDATE**: Users can only update their own profile
- **INSERT/DELETE**: Admin only

### leads
- **SELECT**: 
  - Employees: Can view leads assigned to them
  - Managers/Admins: Can view all leads
- **UPDATE**: Same visibility as SELECT
- **INSERT/DELETE**: Managers and Admins only

### lead_answers
- **SELECT/INSERT**: Visible/manageable like parent leads
- Can only be inserted by managers/admins

### notes
- **SELECT**: Can view notes on accessible leads
- **INSERT**: Can create notes on accessible leads (but must be author)
- **UPDATE**: Can only update own notes (or admins can update any)

### appointments
- **SELECT**: 
  - Employees: Can see their appointments and appointments on assigned leads
  - Managers/Admins: Can see all appointments
- **INSERT**: 
  - Employees: Can create appointments for themselves on assigned leads
  - Managers/Admins: Can create for any employee
- **UPDATE**: Same rules as INSERT

### google_connections
- **SELECT/UPDATE/DELETE**: Users can only access their own connection
- Never expose `encrypted_refresh_token` in queries
- Use `google_connections_safe` view instead

### webhook_events
- **ALL**: Blocked for authenticated users
- Only service role (via Edge Functions) can access

## Important Security Notes

1. **Service Role Never Exposed**: SUPABASE_SERVICE_ROLE_KEY only used in Edge Functions
2. **Google Tokens Encrypted**: encrypted_refresh_token stored separately
3. **Idempotent Webhooks**: Webhook events use (provider, event_id) unique constraint
4. **No Direct Token Access**: View `google_connections_safe` instead of table directly

## How to Apply RLS Policies

Follow same steps as migrations:

1. Go to Supabase SQL Editor
2. Copy content from `supabase/migrations/002_rls_policies.sql`
3. Paste and run

## Verify RLS is Working

1. Sign in as different users with different roles
2. Test viewing/editing leads:
   - Employee should only see assigned leads
   - Manager should see all leads
3. Test notes on leads:
   - Employee should not see notes on other leads
4. Test Google connections:
   - Users should only see their own connection

## Testing RLS (For Developers)

### Test as Employee (limited access)
```sql
SET ROLE authenticated;
SET app.current_user_id = 'employee-uuid';

SELECT * FROM leads; -- Should only see assigned leads
```

### Test as Admin (full access)
```sql
SET ROLE authenticated;
SET app.current_user_id = 'admin-uuid';

SELECT * FROM leads; -- Should see all leads
```
