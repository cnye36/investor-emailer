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

export interface Campaign {
  id: string;
  userId: string;
  name: string;
  description?: string;
  status: "draft" | "active" | "paused" | "completed";
  createdAt: string;
  updatedAt: string;
  followUpDays?: number[];
  totalContacts?: number;
  sentEmails?: number;
  pendingEmails?: number;
}

export interface CampaignSchedule {
  id: string;
  campaignId: string;
  contactId: string;
  emailType:
    | "initial"
    | "follow_up_1"
    | "follow_up_2"
    | "follow_up_3"
    | "follow_up_4"
    | "follow_up_5";
  scheduledFor: string;
  status: "pending" | "sent" | "failed" | "cancelled";
  emailSubject?: string;
  emailBody?: string;
  createdAt: string;
  contact?: Contact;
}

export interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  followUpDays: number[];
  initialSubject: string;
  initialBody: string;
  followUpSubjects: string[];
  followUpBodies: string[];
  isDefault?: boolean;
}