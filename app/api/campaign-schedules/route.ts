import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET campaign schedules
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaignId");
    const status = searchParams.get("status");
    const due = searchParams.get("due"); // Get schedules due for sending

    let query = supabase
      .from("campaign_schedules")
      .select("*");

    if (campaignId) {
      query = query.eq("campaign_id", campaignId);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (due === "true") {
      const now = new Date().toISOString();
      query = query.lte("scheduled_for", now);
    }

    const { data, error } = await query.order("scheduled_for", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Fetch contact data separately
    const contactIds = [...new Set(data.map(s => s.contact_id))];
    const { data: contacts } = await supabase
      .from("investors")
      .select("id, name, email, company, title")
      .in("id", contactIds);

    const contactMap = new Map(contacts?.map(c => [c.id, c]) || []);

    const schedules = data.map((schedule) => ({
      id: schedule.id,
      campaignId: schedule.campaign_id,
      contactId: schedule.contact_id,
      emailType: schedule.email_type,
      scheduledFor: schedule.scheduled_for,
      status: schedule.status,
      emailSubject: schedule.email_subject,
      emailBody: schedule.email_body,
      createdAt: schedule.created_at,
      contact: contactMap.get(schedule.contact_id) || null
    }));

    return Response.json(schedules);
  } catch (error) {
    console.error("Error fetching campaign schedules:", error);
    return Response.json(
      { error: "Failed to fetch campaign schedules" },
      { status: 500 }
    );
  }
}

// POST - Create campaign schedule
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { campaignId, contactId, emailType, scheduledFor, emailSubject, emailBody } = body;

    if (!campaignId || !contactId || !emailType || !scheduledFor) {
      return Response.json(
        { error: "Campaign ID, contact ID, email type, and scheduled time are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("campaign_schedules")
      .insert({
        campaign_id: campaignId,
        contact_id: contactId,
        email_type: emailType,
        scheduled_for: scheduledFor,
        email_subject: emailSubject,
        email_body: emailBody,
        status: "pending"
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({
      id: data.id,
      campaignId: data.campaign_id,
      contactId: data.contact_id,
      emailType: data.email_type,
      scheduledFor: data.scheduled_for,
      status: data.status,
      emailSubject: data.email_subject,
      emailBody: data.email_body,
      createdAt: data.created_at
    });
  } catch (error) {
    console.error("Error creating campaign schedule:", error);
    return Response.json(
      { error: "Failed to create campaign schedule" },
      { status: 500 }
    );
  }
}

// PATCH - Update campaign schedule
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, emailSubject, emailBody, scheduledFor } = body;

    if (!id) {
      return Response.json(
        { error: "Schedule ID is required" },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {};
    if (status !== undefined) updates.status = status;
    if (emailSubject !== undefined) updates.email_subject = emailSubject;
    if (emailBody !== undefined) updates.email_body = emailBody;
    if (scheduledFor !== undefined) updates.scheduled_for = scheduledFor;

    const { data, error } = await supabase
      .from("campaign_schedules")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({
      id: data.id,
      campaignId: data.campaign_id,
      contactId: data.contact_id,
      emailType: data.email_type,
      scheduledFor: data.scheduled_for,
      status: data.status,
      emailSubject: data.email_subject,
      emailBody: data.email_body,
      createdAt: data.created_at
    });
  } catch (error) {
    console.error("Error updating campaign schedule:", error);
    return Response.json(
      { error: "Failed to update campaign schedule" },
      { status: 500 }
    );
  }
}

// DELETE - Delete campaign schedule
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json(
        { error: "Schedule ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("campaign_schedules")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting campaign schedule:", error);
    return Response.json(
      { error: "Failed to delete campaign schedule" },
      { status: 500 }
    );
  }
}
