import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET all campaigns for the user
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("campaigns")
      .select(`
        *,
        campaign_schedules (
          id,
          contact_id,
          email_type,
          scheduled_for,
          status,
          email_subject,
          email_body
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Transform the data to include statistics
    const campaigns = data.map((campaign) => {
      const schedules = campaign.campaign_schedules || [];
      const totalContacts = new Set(schedules.map((s: Record<string, unknown>) => s.contact_id)).size;
      const sentEmails = schedules.filter((s: Record<string, unknown>) => s.status === 'sent').length;
      const pendingEmails = schedules.filter((s: Record<string, unknown>) => s.status === 'pending').length;

      return {
        id: campaign.id,
        userId: campaign.user_id,
        name: campaign.name,
        description: campaign.description,
        status: campaign.status,
        createdAt: campaign.created_at,
        updatedAt: campaign.updated_at,
        totalContacts,
        sentEmails,
        pendingEmails,
        schedules: schedules.map((schedule: Record<string, unknown>) => ({
          id: schedule.id,
          campaignId: schedule.campaign_id,
          contactId: schedule.contact_id,
          emailType: schedule.email_type,
          scheduledFor: schedule.scheduled_for,
          status: schedule.status,
          emailSubject: schedule.email_subject,
          emailBody: schedule.email_body,
          createdAt: schedule.created_at
        }))
      };
    });

    return Response.json(campaigns);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return Response.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}

// POST - Create new campaign
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, contactIds, followUpDays = [3, 6] } = body;

    if (!name || !contactIds || contactIds.length === 0) {
      return Response.json(
        { error: "Campaign name and contact IDs are required" },
        { status: 400 }
      );
    }

    // Create the campaign
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .insert({
        user_id: "00000000-0000-0000-0000-000000000000", // Default UUID for now
        name,
        description,
        status: "draft"
      })
      .select()
      .single();

    if (campaignError) {
      console.error("Campaign creation error:", campaignError);
      return Response.json({ error: campaignError.message }, { status: 500 });
    }

    // Create campaign schedules for each contact
    const schedules = [];
    const now = new Date();

    for (const contactId of contactIds) {
      // Initial email (immediate)
      schedules.push({
        campaign_id: campaign.id,
        contact_id: contactId,
        email_type: "initial",
        scheduled_for: now.toISOString(),
        status: "pending"
      });

      // Follow-up emails
      followUpDays.forEach((days: number, index: number) => {
        const followUpDate = new Date(now);
        followUpDate.setDate(followUpDate.getDate() + days);
        
        schedules.push({
          campaign_id: campaign.id,
          contact_id: contactId,
          email_type: `follow_up_${index + 1}` as "follow_up_1" | "follow_up_2" | "follow_up_3" | "follow_up_4" | "follow_up_5",
          scheduled_for: followUpDate.toISOString(),
          status: "pending"
        });
      });
    }

    // Insert all schedules
    const { error: scheduleError } = await supabase
      .from("campaign_schedules")
      .insert(schedules);

    if (scheduleError) {
      console.error("Schedule creation error:", scheduleError);
      return Response.json({ error: scheduleError.message }, { status: 500 });
    }

    return Response.json({
      id: campaign.id,
      userId: campaign.user_id,
      name: campaign.name,
      description: campaign.description,
      status: campaign.status,
      createdAt: campaign.created_at,
      updatedAt: campaign.updated_at,
      totalContacts: contactIds.length,
      sentEmails: 0,
      pendingEmails: schedules.length
    });
  } catch (error) {
    console.error("Error creating campaign:", error);
    return Response.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    );
  }
}

// PATCH - Update campaign
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, name, description, status } = body;

    if (!id) {
      return Response.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("campaigns")
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
      userId: data.user_id,
      name: data.name,
      description: data.description,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    });
  } catch (error) {
    console.error("Error updating campaign:", error);
    return Response.json(
      { error: "Failed to update campaign" },
      { status: 500 }
    );
  }
}

// DELETE - Delete campaign
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("campaigns")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return Response.json(
      { error: "Failed to delete campaign" },
      { status: 500 }
    );
  }
}
