export interface Contact {
  id: string;
  name: string;
  email: string;
  secondaryEmail?: string;
  tertiaryEmail?: string;
  phone?: string;
  title?: string;
  company?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  country?: string;
  state?: string;
  city?: string;
  markets?: string;
  pastInvestments?: string;
  types?: string;
  stages?: string;
  notes?: string;
  createdAt: string;
  researchStatus?:
    | "pending"
    | "researching"
    | "completed"
    | "failed"
    | "ready_for_email"
    | "email_sent";
  researchData?: {
    insights?: string;
    focusAreas?: string[];
    recentInvestments?: string[];
    summary?: string;
    completedAt?: string;
  };
}
