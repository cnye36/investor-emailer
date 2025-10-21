-- Create investors table
CREATE TABLE IF NOT EXISTS investors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  title TEXT,
  company TEXT,
  website TEXT,
  linkedin_url TEXT,
  twitter TEXT,
  facebook TEXT,
  country TEXT,
  state TEXT,
  city TEXT,
  markets TEXT,
  past_investments TEXT,
  types TEXT,
  stages TEXT,
  focus_areas TEXT[] DEFAULT '{}',
  investment_range TEXT,
  notes TEXT,
  research_status TEXT DEFAULT 'pending',
  research_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create email campaigns table
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  personalization_data JSONB,
  status TEXT DEFAULT 'draft', -- draft, sent, opened, replied
  sent_at TIMESTAMP,
  opened_at TIMESTAMP,
  replied_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create research cache table
CREATE TABLE IF NOT EXISTS research_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
  website_content TEXT,
  linkedin_summary TEXT,
  key_insights JSONB,
  cached_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_investors_email ON investors(email);
CREATE INDEX idx_campaigns_investor ON email_campaigns(investor_id);
CREATE INDEX idx_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_research_investor ON research_cache(investor_id);
