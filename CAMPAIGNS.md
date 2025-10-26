# Email Campaign System

The campaign system allows you to create automated email sequences that send initial emails and follow-up emails at scheduled intervals.

## Features

### 🎯 Campaign Management
- Create campaigns with custom names and descriptions
- Select multiple contacts for each campaign
- Set custom follow-up schedules (e.g., 3 days, 6 days later)
- Pause, resume, or delete campaigns
- View campaign statistics and progress

### 📧 Automated Email Sequences
- **Initial Email**: Sent immediately when campaign starts
- **Follow-up Emails**: Sent at scheduled intervals (3, 6, 9+ days)
- **Smart Content**: AI-generated personalized emails for each contact
- **Status Tracking**: Monitor sent, pending, and failed emails

### 📊 Campaign Analytics
- View campaign progress by contact
- Timeline view of all scheduled emails
- Success/failure tracking
- Real-time statistics

## How It Works

### 1. Create a Campaign
1. Go to the **Campaigns** page
2. Click **Create Campaign**
3. Enter campaign name and description
4. Set follow-up schedule (e.g., 3 and 6 days)
5. Select contacts to include
6. Click **Create Campaign**

### 2. Campaign Execution
- **Initial emails** are sent immediately when you activate the campaign
- **Follow-up emails** are scheduled and sent automatically by the cron job
- Each email is personalized using AI based on contact research data

### 3. Monitoring Progress
- View campaign statistics on the main campaigns page
- Click on any campaign to see detailed progress
- Monitor individual contact progress
- Track email delivery status

## Database Schema

The campaign system uses these database tables:

### `campaigns`
- Stores campaign metadata (name, description, status)
- Tracks campaign creation and updates

### `campaign_schedules`
- Stores individual email schedules for each contact
- Tracks email content, timing, and status
- Links to both campaigns and contacts

### `email_history`
- Records all sent emails for tracking
- Links to contacts and campaigns

## API Endpoints

### Campaign Management
- `GET /api/campaigns` - List all campaigns
- `POST /api/campaigns` - Create new campaign
- `PATCH /api/campaigns` - Update campaign
- `DELETE /api/campaigns` - Delete campaign

### Campaign Schedules
- `GET /api/campaign-schedules` - List schedules (with filters)
- `POST /api/campaign-schedules` - Create schedule
- `PATCH /api/campaign-schedules` - Update schedule
- `DELETE /api/campaign-schedules` - Delete schedule

### Automation
- `POST /api/campaign-scheduler` - Process due emails
- `GET /api/process-campaigns` - Cron endpoint

## Setup Requirements

### 1. Database Tables
The required tables are already created in the migration files:
- `supabase/migrations/20241220_create_email_tracking_tables.sql`

### 2. Cron Job Setup
Set up a cron job to process scheduled emails every 5 minutes:

**For Vercel**: Use the included `vercel.json` file
**For other platforms**: See `scripts/setup-cron.md`

### 3. Environment Variables
```env
# Email service
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=your-email@domain.com
RESEND_REPLY_TO_EMAIL=your-reply-email@domain.com

# Database
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-key

# Optional: Cron security
CRON_SECRET_TOKEN=your-secret-token
```

## Usage Examples

### Creating a Campaign
```typescript
// API call to create campaign
const response = await fetch('/api/campaigns', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Q1 2024 Investor Outreach',
    description: 'Outreach to Series A investors',
    contactIds: ['contact-1', 'contact-2', 'contact-3'],
    followUpDays: [3, 6] // 3 days and 6 days later
  })
})
```

### Manual Campaign Processing
```bash
# Trigger campaign processing manually
curl -X POST https://your-domain.com/api/process-campaigns
```

## Campaign Statuses

- **draft**: Campaign created but not started
- **active**: Campaign is running and sending emails
- **paused**: Campaign is temporarily stopped
- **completed**: All emails in campaign have been sent

## Email Statuses

- **pending**: Email is scheduled but not yet sent
- **sent**: Email was successfully sent
- **failed**: Email failed to send
- **cancelled**: Email was cancelled

## Troubleshooting

### Campaigns Not Sending Emails
1. Check that the cron job is running
2. Verify environment variables are set correctly
3. Check the campaign status (should be 'active')
4. Verify contact emails are valid

### Cron Job Issues
1. Check the cron job logs
2. Test the `/api/process-campaigns` endpoint manually
3. Verify the cron job is hitting the correct URL
4. Check for authentication issues

### Database Issues
1. Verify Supabase connection
2. Check that all required tables exist
3. Verify service role key has proper permissions

## Best Practices

1. **Start Small**: Test with a few contacts first
2. **Monitor Closely**: Check campaign progress regularly
3. **Personalize Content**: Use the AI email generation for better results
4. **Set Reasonable Intervals**: Don't spam contacts with too frequent follow-ups
5. **Track Results**: Monitor open rates and responses
6. **Clean Data**: Ensure contact information is accurate and up-to-date
