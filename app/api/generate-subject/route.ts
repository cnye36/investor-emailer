import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    const { contactName, companyName, investorFocus } = await request.json()

    if (!contactName || !companyName) {
      return Response.json({ error: "Contact name and company name are required" }, { status: 400 })
    }

    const { text: subject } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `Generate a compelling, personalized email subject line for reaching out to ${contactName} about ${companyName}.
      
      Investor focus: ${investorFocus || "Not specified"}
      
      Requirements:
      1. Keep it under 50 characters
      2. Make it specific and personalized (not generic)
      3. Create curiosity or relevance to their investment focus
      4. Avoid spam trigger words
      5. Return ONLY the subject line, nothing else`,
    });

    return Response.json({
      success: true,
      subject: subject.trim(),
    })
  } catch (error) {
    console.error("Subject generation error:", error)
    return Response.json({ error: "Failed to generate subject" }, { status: 500 })
  }
}
