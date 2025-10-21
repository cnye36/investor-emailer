import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendEmailRequest {
  to: string
  subject: string
  body: string
  contactName: string
  companyName: string
}

export async function POST(request: Request) {
  try {
    const body: SendEmailRequest = await request.json()

    const { to, subject, body: emailBody, contactName, companyName } = body

    if (!to || !subject || !emailBody) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return Response.json({ error: "Invalid email address" }, { status: 400 })
    }

    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to,
      subject,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            ${emailBody
              .split("\n")
              .map((paragraph: string) => `<p style="margin-bottom: 16px;">${paragraph}</p>`)
              .join("")}
            <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
              <p>Sent from ${companyName} via Investor Outreach</p>
            </div>
          </div>
        </div>
      `,
    })

    if (result.error) {
      console.error("Resend error:", result.error)
      await fetch("/api/email-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to,
          contactName,
          subject,
          body: emailBody,
          status: "failed",
        }),
      })
      return Response.json({ error: "Failed to send email" }, { status: 500 })
    }

    await fetch("/api/email-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to,
        contactName,
        subject,
        body: emailBody,
        status: "sent",
        messageId: result.data?.id,
      }),
    })

    return Response.json({
      success: true,
      messageId: result.data?.id,
      sentAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Send email error:", error)
    return Response.json({ error: "Failed to send email" }, { status: 500 })
  }
}
