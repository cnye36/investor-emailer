import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // For now, we'll use a default user_id since we don't have auth set up
    // In a real app, you'd get this from the authenticated user
    const userId = '00000000-0000-0000-0000-000000000000'

    const { data, error } = await supabase
      .from("email_drafts")
      .select("*")
      .eq("user_id", userId)

    if (error) throw error

    return Response.json({ drafts: data || [] })
  } catch (error) {
    console.error("Error fetching email drafts:", error)
    return Response.json({ error: "Failed to fetch email drafts" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // For now, we'll use a default user_id since we don't have auth set up
    // In a real app, you'd get this from the authenticated user
    const userId = '00000000-0000-0000-0000-000000000000'

    const body = await request.json()
    const { contactId, subject, body: emailBody } = body

    if (!contactId || !subject || !emailBody) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Upsert the draft (insert or update if exists)
    const { data, error } = await supabase
      .from("email_drafts")
      .upsert({
        user_id: userId,
        contact_id: contactId,
        subject,
        body: emailBody,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,contact_id'
      })
      .select()
      .single()

    if (error) throw error

    return Response.json({ draft: data })
  } catch (error) {
    console.error("Error saving email draft:", error)
    return Response.json({ error: "Failed to save email draft" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    // For now, we'll use a default user_id since we don't have auth set up
    // In a real app, you'd get this from the authenticated user
    const userId = '00000000-0000-0000-0000-000000000000'

    const { searchParams } = new URL(request.url)
    const contactId = searchParams.get("contactId")

    if (!contactId) {
      return Response.json(
        { error: "Contact ID is required" },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from("email_drafts")
      .delete()
      .eq("user_id", userId)
      .eq("contact_id", contactId)

    if (error) throw error

    return Response.json({ success: true })
  } catch (error) {
    console.error("Error deleting email draft:", error)
    return Response.json({ error: "Failed to delete email draft" }, { status: 500 })
  }
}

