-- Create email_drafts table for persisting generated emails
CREATE TABLE IF NOT EXISTS email_drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contact_id UUID NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, contact_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_drafts_user_id ON email_drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_email_drafts_contact_id ON email_drafts(contact_id);

-- Add updated_at trigger
CREATE TRIGGER update_email_drafts_updated_at 
    BEFORE UPDATE ON email_drafts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

