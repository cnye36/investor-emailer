import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET all contacts
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("investors")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Map database fields to frontend Contact interface
    const contacts = data.map((investor) => ({
      id: investor.id,
      name: investor.name,
      email: investor.email,
      phone: investor.phone || undefined,
      title: investor.title || undefined,
      company: investor.company || undefined,
      website: investor.website || undefined,
      linkedin: investor.linkedin_url || undefined,
      twitter: investor.twitter || undefined,
      facebook: investor.facebook || undefined,
      country: investor.country || undefined,
      state: investor.state || undefined,
      city: investor.city || undefined,
      markets: investor.markets || undefined,
      pastInvestments: investor.past_investments || undefined,
      types: investor.types || undefined,
      stages: investor.stages || undefined,
      notes: investor.notes || undefined,
      createdAt:
        investor.created_at?.split("T")[0] ||
        new Date().toISOString().split("T")[0],
      researchStatus: investor.research_status || undefined,
      researchData: investor.research_data || undefined,
    }));

    return Response.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return Response.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}

// POST - Create new contact(s)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const contacts = Array.isArray(body) ? body : [body];

    // Check for existing contacts by email
    const emails = contacts.map((contact) => contact.email);
    const { data: existingContacts, error: checkError } = await supabase
      .from("investors")
      .select("email")
      .in("email", emails);

    if (checkError) {
      console.error("Error checking for existing contacts:", checkError);
      return Response.json({ error: checkError.message }, { status: 500 });
    }

    // Filter out duplicates
    const existingEmails = new Set(
      existingContacts?.map((c) => c.email.toLowerCase()) || []
    );
    const uniqueContacts = contacts.filter(
      (contact) => !existingEmails.has(contact.email.toLowerCase())
    );

    if (uniqueContacts.length === 0) {
      return Response.json([]); // No new contacts to insert
    }

    // Map frontend Contact interface to database fields
    const investorsToInsert = uniqueContacts.map((contact) => ({
      name: contact.name,
      email: contact.email,
      phone: contact.phone || null,
      title: contact.title || null,
      company: contact.company || null,
      website: contact.website || null,
      linkedin_url: contact.linkedin || null,
      twitter: contact.twitter || null,
      facebook: contact.facebook || null,
      country: contact.country || null,
      state: contact.state || null,
      city: contact.city || null,
      markets: contact.markets || null,
      past_investments: contact.pastInvestments || null,
      types: contact.types || null,
      stages: contact.stages || null,
      notes: contact.notes || null,
      research_status: contact.researchStatus || "pending",
      research_data: contact.researchData || null,
    }));

    const { data, error } = await supabase
      .from("investors")
      .insert(investorsToInsert)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Map back to frontend format
    const insertedContacts = data.map((investor) => ({
      id: investor.id,
      name: investor.name,
      email: investor.email,
      phone: investor.phone || undefined,
      title: investor.title || undefined,
      company: investor.company || undefined,
      website: investor.website || undefined,
      linkedin: investor.linkedin_url || undefined,
      twitter: investor.twitter || undefined,
      facebook: investor.facebook || undefined,
      country: investor.country || undefined,
      state: investor.state || undefined,
      city: investor.city || undefined,
      markets: investor.markets || undefined,
      pastInvestments: investor.past_investments || undefined,
      types: investor.types || undefined,
      stages: investor.stages || undefined,
      notes: investor.notes || undefined,
      createdAt:
        investor.created_at?.split("T")[0] ||
        new Date().toISOString().split("T")[0],
      researchStatus: investor.research_status || undefined,
      researchData: investor.research_data || undefined,
    }));

    return Response.json(insertedContacts);
  } catch (error) {
    console.error("Error creating contacts:", error);
    return Response.json(
      { error: "Failed to create contacts" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a contact
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json(
        { error: "Contact ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("investors").delete().eq("id", id);

    if (error) {
      console.error("Supabase error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting contact:", error);
    return Response.json(
      { error: "Failed to delete contact" },
      { status: 500 }
    );
  }
}

// PATCH - Update a contact
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return Response.json(
        { error: "Contact ID is required" },
        { status: 400 }
      );
    }

    // Map frontend Contact interface to database fields
    const investorUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) investorUpdates.name = updates.name;
    if (updates.email !== undefined) investorUpdates.email = updates.email;
    if (updates.phone !== undefined) investorUpdates.phone = updates.phone;
    if (updates.title !== undefined) investorUpdates.title = updates.title;
    if (updates.company !== undefined)
      investorUpdates.company = updates.company;
    if (updates.website !== undefined)
      investorUpdates.website = updates.website;
    if (updates.linkedin !== undefined)
      investorUpdates.linkedin_url = updates.linkedin;
    if (updates.twitter !== undefined)
      investorUpdates.twitter = updates.twitter;
    if (updates.facebook !== undefined)
      investorUpdates.facebook = updates.facebook;
    if (updates.country !== undefined)
      investorUpdates.country = updates.country;
    if (updates.state !== undefined) investorUpdates.state = updates.state;
    if (updates.city !== undefined) investorUpdates.city = updates.city;
    if (updates.markets !== undefined)
      investorUpdates.markets = updates.markets;
    if (updates.pastInvestments !== undefined)
      investorUpdates.past_investments = updates.pastInvestments;
    if (updates.types !== undefined) investorUpdates.types = updates.types;
    if (updates.stages !== undefined) investorUpdates.stages = updates.stages;
    if (updates.notes !== undefined) investorUpdates.notes = updates.notes;
    if (updates.researchStatus !== undefined)
      investorUpdates.research_status = updates.researchStatus;
    if (updates.researchData !== undefined)
      investorUpdates.research_data = updates.researchData;

    investorUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("investors")
      .update(investorUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Map back to frontend format
    const updatedContact = {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      title: data.title || undefined,
      company: data.company || undefined,
      website: data.website || undefined,
      linkedin: data.linkedin_url || undefined,
      twitter: data.twitter || undefined,
      facebook: data.facebook || undefined,
      country: data.country || undefined,
      state: data.state || undefined,
      city: data.city || undefined,
      markets: data.markets || undefined,
      pastInvestments: data.past_investments || undefined,
      types: data.types || undefined,
      stages: data.stages || undefined,
      notes: data.notes || undefined,
      createdAt:
        data.created_at?.split("T")[0] ||
        new Date().toISOString().split("T")[0],
      researchStatus: data.research_status || undefined,
      researchData: data.research_data || undefined,
    };

    return Response.json(updatedContact);
  } catch (error) {
    console.error("Error updating contact:", error);
    return Response.json(
      { error: "Failed to update contact" },
      { status: 500 }
    );
  }
}
