# SQL Migrations Guide

## How to Apply Migrations

### Option 1: Via Supabase Dashboard (Recommended for Development)

1. Go to https://app.supabase.com
2. Select your project
3. Go to **SQL Editor**
4. Create a new query
5. Copy the entire content from `supabase/migrations/001_initial_schema.sql`
6. Paste it into the SQL Editor
7. Click **Run**

### Option 2: Via Supabase CLI

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. Push migrations:
   ```bash
   supabase push
   ```

### Option 3: Via Supabase Python CLI

```bash
supabase db push
```

## What Gets Created

### Tables
1. **profiles** - User information and roles
2. **leads** - Lead information from Tally
3. **lead_answers** - Dynamic form answers
4. **notes** - Employee notes on leads
5. **appointments** - Scheduled consultations
6. **google_connections** - Encrypted Google Calendar tokens
7. **webhook_events** - Webhook processing log

### Features
- ✅ UUID primary keys
- ✅ Timestamps with auto `updated_at` triggers
- ✅ Proper indexes for performance
- ✅ Foreign key constraints
- ✅ Check constraints for enum-like statuses
- ✅ RLS enabled on all tables (policies in next step)

## Verify Migration

After applying the migration, verify in Supabase Dashboard:

1. Go to **SQL Editor**
2. Run:
   ```sql
   SELECT tablename FROM pg_tables WHERE schemaname = 'public';
   ```
3. You should see all 7 tables listed

## Next Step

Once migrations are applied, proceed to STEP 3: Row Level Security to create RLS policies.
