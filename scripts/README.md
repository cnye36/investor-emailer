# Database Setup

This directory contains SQL scripts for initializing your Supabase database.

## Setup Instructions

### 1. Run the Database Initialization Script

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor** section (in the left sidebar)
3. Click **New Query**
4. Copy the contents of `01-init-database.sql` and paste it into the SQL editor
5. Click **Run** to execute the script

This will create the following tables:
- `investors` - Stores contact information for investors
- `email_campaigns` - Tracks email campaigns sent to investors
- `research_cache` - Caches research data about investors

### 2. Verify Environment Variables

Make sure your `.env` file contains the following Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

You can find these values in your Supabase project settings:
1. Go to your project dashboard
2. Click on **Settings** (gear icon)
3. Navigate to **API** section
4. Copy the **Project URL** and **anon/public key**

### 3. Test the Connection

After running the SQL script and setting up environment variables:

1. Start your development server: `pnpm dev`
2. Navigate to the dashboard at `http://localhost:3000/dashboard`
3. Try importing a CSV file with investor contacts
4. The contacts should now be stored in your Supabase database

## Troubleshooting

### "Missing required columns: name, email" Error

This error occurs when:
1. The database tables haven't been created yet (run `01-init-database.sql`)
2. The Supabase credentials in your `.env` file are incorrect
3. The Supabase project is not accessible

### Connection Errors

If you're getting connection errors:
1. Verify your Supabase project is active and not paused
2. Check that the environment variables are correctly set
3. Restart your development server after updating `.env`

## Database Schema

### Investors Table

The `investors` table stores all contact information with the following fields:

- `id` (UUID) - Primary key
- `name` (TEXT) - Required
- `email` (TEXT) - Required, unique
- `phone` (TEXT) - Optional
- `title` (TEXT) - Optional
- `company` (TEXT) - Optional
- `website` (TEXT) - Optional
- `linkedin_url` (TEXT) - Optional
- `twitter` (TEXT) - Optional
- `facebook` (TEXT) - Optional
- `country` (TEXT) - Optional
- `state` (TEXT) - Optional
- `city` (TEXT) - Optional
- `markets` (TEXT) - Optional
- `past_investments` (TEXT) - Optional
- `types` (TEXT) - Optional
- `stages` (TEXT) - Optional
- `focus_areas` (TEXT[]) - Array field
- `investment_range` (TEXT) - Optional
- `notes` (TEXT) - Optional
- `research_status` (TEXT) - Default: 'pending'
- `research_data` (JSONB) - Optional
- `created_at` (TIMESTAMP) - Auto-generated
- `updated_at` (TIMESTAMP) - Auto-generated

## CSV Import Format

When importing contacts via CSV, ensure your file has at minimum these columns:
- `name` (required)
- `email` (required)

Optional columns that will be imported if present:
- `phone`, `title`, `company`, `website`, `linkedin`, `twitter`, `facebook`
- `country`, `state`, `city`, `markets`, `pastInvestments`, `types`, `stages`, `notes`

