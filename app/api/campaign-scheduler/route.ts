import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

// Process due campaign schedules
export async function POST() {
  try {
    const now = new Date().toISOString();
    
    // Get all pending schedules that are due
    const { data: schedules, error: fetchError } = await supabase
      .from("campaign_schedules")
      .select(`
        *,
        investors (
          id,
          name,
          email,
          company,
          title,
          research_data
        ),
        campaigns (
          id,
          name,
          user_id
        )
      `)
      .eq("status", "pending")
      .lte("scheduled_for", now)
      .order("scheduled_for", { ascending: true });

    if (fetchError) {
      console.error("Error fetching schedules:", fetchError);
      return Response.json({ error: fetchError.message }, { status: 500 });
    }

    if (!schedules || schedules.length === 0) {
      return Response.json({ message: "No due schedules found", processed: 0 });
    }

    const results = [];
    
    for (const schedule of schedules) {
      try {
        const contact = schedule.investors;
        const campaign = schedule.campaigns;
        
        if (!contact || !campaign) {
          console.error(`Missing contact or campaign data for schedule ${schedule.id}`);
          continue;
        }

        // Generate email content if not already set
        let emailSubject = schedule.email_subject;
        let emailBody = schedule.email_body;

        if (!emailSubject || !emailBody) {
          const emailContent = await generateEmailContent(
            contact,
            schedule.email_type,
          );
          emailSubject = emailContent.subject;
          emailBody = emailContent.body;
        }

        // Send the email
        const emailResult = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
          replyTo: process.env.RESEND_REPLY_TO_EMAIL || process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
          to: contact.email,
          subject: emailSubject,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; line-height: 1.6; color: #333;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                ${emailBody
                  .split("\n")
                  .map(
                    (paragraph: string) =>
                      `<p style="margin-bottom: 16px;">${paragraph}</p>`
                  )
                  .join("")}
                <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
                  <p>Sent via Investor Outreach Campaign</p>
                  <p>Please reply directly to this email to respond to ${contact.name}.</p>
                </div>
              </div>
            </div>
          `,
        });

        if (emailResult.error) {
          console.error(`Failed to send email for schedule ${schedule.id}:`, emailResult.error);
          
          // Update schedule status to failed
          await supabase
            .from("campaign_schedules")
            .update({ status: "failed" })
            .eq("id", schedule.id);

          results.push({
            scheduleId: schedule.id,
            contactName: contact.name,
            status: "failed",
            error: emailResult.error.message
          });
        } else {
          // Update schedule status to sent
          await supabase
            .from("campaign_schedules")
            .update({ 
              status: "sent",
              email_subject: emailSubject,
              email_body: emailBody
            })
            .eq("id", schedule.id);

          // Record in email history
          await supabase
            .from("email_history")
            .insert({
              contact_id: contact.id,
              user_id: campaign.user_id,
              subject: emailSubject,
              body: emailBody,
              status: "sent"
            });

          results.push({
            scheduleId: schedule.id,
            contactName: contact.name,
            status: "sent",
            emailId: emailResult.data?.id
          });
        }
      } catch (error) {
        console.error(`Error processing schedule ${schedule.id}:`, error);
        
        // Update schedule status to failed
        await supabase
          .from("campaign_schedules")
          .update({ status: "failed" })
          .eq("id", schedule.id);

        results.push({
          scheduleId: schedule.id,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }

    return Response.json({
      message: `Processed ${schedules.length} schedules`,
      processed: schedules.length,
      results
    });
  } catch (error) {
    console.error("Campaign scheduler error:", error);
    return Response.json(
      { error: "Failed to process campaign schedules" },
      { status: 500 }
    );
  }
}

// Generate email content based on email type
async function generateEmailContent(contact: Record<string, unknown>, emailType: string) {
  const isFollowUp = emailType.startsWith("follow_up");
  const followUpNumber = isFollowUp ? emailType.split("_")[2] : null;

  // Get company profile for personalization
  const { data: companyProfile } = await supabase
    .from("company_profiles")
    .select("*")
    .limit(1)
    .single();

  const companyName = companyProfile?.name || "Our Company";
  const userName = companyProfile?.user_name || "Our Team";
  const userPosition = companyProfile?.user_position || "Team Member";

  let subject = "";
  let body = "";

  if (emailType === "initial") {
    subject = `Investment Opportunity - ${companyName}`;
    body = `Hi ${contact.name},

I hope this email finds you well. I'm ${userName}, ${userPosition} at ${companyName}.

${companyProfile?.description || "We are an innovative company"} and we're currently raising our ${companyProfile?.funding_stage || "Series A"} round. Given your focus on ${contact.markets || "innovative investments"}, I thought you might be interested in learning more about our opportunity.

We've built something truly unique in the market, and I'd love to share more details with you. Would you be available for a brief call this week to discuss?

Best regards,
${userName}
${userPosition}
${companyName}`;
  } else if (isFollowUp) {
    const followUpMessages = [
      `Hi ${contact.name},

I wanted to follow up on my previous email about ${companyName}'s investment opportunity. I know you're busy, but I believe this could be a great fit for your portfolio.

Would you have 15 minutes for a quick call this week to discuss?

Best regards,
${userName}`,
      `Hi ${contact.name},

I hope you're doing well. I wanted to reach out one more time about our investment opportunity at ${companyName}.

I understand if the timing isn't right, but I'd hate for you to miss out on what we're building. Would you be open to a brief conversation?

Best regards,
${userName}`,
      `Hi ${contact.name},

I know you're incredibly busy, but I wanted to make one final attempt to connect about ${companyName}.

If you're not interested, I completely understand. If you are, I'd love to share more details.

Best regards,
${userName}`
    ];

    const messageIndex = Math.min(parseInt(followUpNumber || "1") - 1, followUpMessages.length - 1);
    body = followUpMessages[messageIndex];
    subject = `Following up - ${companyName} Investment Opportunity`;
  }

  return { subject, body };
}
