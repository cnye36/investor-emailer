import { generateText } from "ai"

interface EmailGenerationRequest {
  contactName: string
  contactCompany: string
  contactPosition: string
  investorFocus: string
  companyName: string
  companyDescription: string
  fundingStage: string
  researchSummary?: string
  tone?: "professional" | "casual" | "friendly"
}

export async function POST(request: Request) {
  try {
    const body: EmailGenerationRequest = await request.json()

    const {
      contactName,
      contactCompany,
      contactPosition,
      investorFocus,
      companyName,
      companyDescription,
      fundingStage,
      researchSummary,
      tone = "professional",
    } = body

    // Validate required fields
    if (!contactName || !companyName || !companyDescription) {
      return Response.json({ error: "Contact name, company name, and description are required" }, { status: 400 })
    }

    const toneInstructions = {
      professional: "Use a formal, professional tone appropriate for investor outreach.",
      casual: "Use a friendly but professional tone that feels approachable.",
      friendly: "Use a warm, personable tone while maintaining professionalism.",
    }

    const { text: emailContent } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `Generate a personalized cold email to ${contactName} at ${contactCompany} (${contactPosition}).
      
      Context about the investor:
      - Focus areas: ${investorFocus || "Not specified"}
      - Research: ${researchSummary || "No additional research available"}
      
      Context about our company:
      - Name: ${companyName}
      - Description: ${companyDescription}
      - Funding stage: ${fundingStage}
      
      Requirements:
      1. ${toneInstructions[tone]}
      2. Keep it concise (3-4 short paragraphs)
      3. Personalize it based on the investor's focus areas
      4. Include a clear call to action
      5. Make it feel genuine, not templated
      6. Start with a compelling hook
      7. Do NOT include subject line, just the email body
      
      Generate only the email body, no additional text.`,
      maxTokens: 400,
    })

    return Response.json({
      success: true,
      email: {
        body: emailContent,
        generatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Email generation error:", error)
    return Response.json({ error: "Failed to generate email" }, { status: 500 })
  }
}
