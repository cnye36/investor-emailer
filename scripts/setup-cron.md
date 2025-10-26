# Campaign Scheduler Setup

The campaign system includes automated email scheduling that requires a cron job to process due emails. Here are several ways to set this up:

## Option 1: Vercel Cron (Recommended for Vercel deployments)

If you're deploying to Vercel, you can use Vercel Cron:

1. Create a `vercel.json` file in your project root:

```json
{
  "crons": [
    {
      "path": "/api/process-campaigns",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

This will run every 5 minutes. You can adjust the schedule as needed.

## Option 2: GitHub Actions (For any deployment)

Create `.github/workflows/campaign-processor.yml`:

```yaml
name: Campaign Processor
on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes
  workflow_dispatch:  # Allow manual triggering

jobs:
  process-campaigns:
    runs-on: ubuntu-latest
    steps:
      - name: Process Campaigns
        run: |
          curl -X POST "${{ secrets.APP_URL }}/api/process-campaigns" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET_TOKEN }}"
```

## Option 3: External Cron Service

Use services like:
- **Cron-job.org** (Free)
- **EasyCron** (Paid)
- **SetCronJob** (Free tier available)

Set up a cron job to call: `https://your-domain.com/api/process-campaigns`

## Option 4: Server Cron (For VPS/Dedicated servers)

Add to your server's crontab:

```bash
# Run every 5 minutes
*/5 * * * * curl -X POST https://your-domain.com/api/process-campaigns
```

## Environment Variables

Make sure to set these environment variables:

```env
# Optional: For security
CRON_SECRET_TOKEN=your-secret-token

# Required: Your app URL
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Required: Email service
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=your-email@domain.com
RESEND_REPLY_TO_EMAIL=your-reply-email@domain.com

# Required: Database
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-key
```

## Testing

You can manually trigger the campaign processor by calling:

```bash
curl -X POST https://your-domain.com/api/process-campaigns
```

Or visit the URL in your browser: `https://your-domain.com/api/process-campaigns`

## Monitoring

The processor will return JSON responses showing:
- Number of schedules processed
- Success/failure status for each email
- Any errors encountered

Check your application logs to monitor the campaign processing.
