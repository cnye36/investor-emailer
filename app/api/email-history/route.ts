interface EmailRecord {
  id: string
  to: string
  contactName: string
  subject: string
  body: string
  sentAt: string
  status: "sent" | "failed"
  messageId?: string
}

// In-memory storage (in production, use a database)
const emailHistory: EmailRecord[] = []

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const record: EmailRecord = {
      id: Date.now().toString(),
      to: body.to,
      contactName: body.contactName,
      subject: body.subject,
      body: body.body,
      sentAt: new Date().toISOString(),
      status: body.status || "sent",
      messageId: body.messageId,
    }

    emailHistory.unshift(record)

    return Response.json({ success: true, record })
  } catch (error) {
    console.error("Email history error:", error)
    return Response.json({ error: "Failed to save email history" }, { status: 500 })
  }
}

export async function GET() {
  try {
    return Response.json({ success: true, emails: emailHistory })
  } catch (error) {
    console.error("Email history error:", error)
    return Response.json({ error: "Failed to fetch email history" }, { status: 500 })
  }
}
