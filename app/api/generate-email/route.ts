import OpenAI from "openai";

interface EmailGenerationRequest {
  contactName: string;
  contactCompany: string;
  contactPosition: string;
  investorFocus: string;
  companyName: string;
  companyDescription: string;
  fundingStage: string;
  userName: string;
  userPosition: string;
  researchSummary?: string;
  tone?: "professional" | "casual" | "friendly" | "formal";
}

export async function POST(request: Request) {
  try {
    const body: EmailGenerationRequest = await request.json();

    const {
      contactName,
      contactCompany,
      contactPosition,
      investorFocus,
      companyName,
      companyDescription,
      fundingStage,
      userName,
      userPosition,
      researchSummary,
      tone = "professional",
    } = body;

    // Validate required fields
    if (
      !contactName ||
      !companyName ||
      !companyDescription ||
      !userName ||
      !userPosition
    ) {
      return Response.json(
        {
          error:
            "Contact name, company name, description, user name, and user position are required",
        },
        { status: 400 }
      );
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const toneInstructions = {
      professional:
        "Use a formal, professional tone appropriate for investor outreach.",
      casual: "Use a friendly but professional tone that feels approachable.",
      friendly:
        "Use a warm, personable tone while maintaining professionalism.",
      formal:
        "Use a very formal, business-appropriate tone for serious investor outreach.",
    };

    // Generate subject line
    const subjectCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Generate a compelling subject line for an email to ${contactName} at ${contactCompany}.
          
          Context:
          - Our company: ${companyName} (${companyDescription})
          - From: ${userName}, ${userPosition} at ${companyName}
          - Funding stage: ${fundingStage}
          - Investor focus: ${investorFocus || "Not specified"}
          
          Requirements:
          - Keep it under 50 characters
          - Make it compelling and personalized
          - Avoid spammy words
          - Be direct and clear
          
          Generate only the subject line, no additional text.`,
        },
      ],
    });

    // Generate email body
    const bodyCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Generate a personalized cold email to ${contactName} at ${contactCompany} (${contactPosition}).
          
          Context about the investor:
          - Focus areas: ${investorFocus || "Not specified"}
          - Research: ${researchSummary || "No additional research available"}
          
          Context about our company:
          - Name: ${companyName}
          - Description: ${companyDescription}
          - Funding stage: ${fundingStage}
          - From: ${userName}, ${userPosition} at ${companyName}
          
          Requirements:
          1. ${toneInstructions[tone]}
          2. Keep it concise (3-4 short paragraphs)
          3. Personalize it based on the investor's focus areas
          4. Include a clear call to action
          5. Make it feel genuine, not templated
          6. Start with a compelling hook
          7. Sign the email as ${userName}, ${userPosition}
          8. Do NOT include subject line, just the email body
          
          Generate only the email body, no additional text.`,
        },
      ],
    });

    const subject =
      subjectCompletion.choices[0]?.message?.content ||
      "Investment Opportunity";
    const emailBody =
      bodyCompletion.choices[0]?.message?.content ||
      "Unable to generate email content.";

    return Response.json({
      success: true,
      email: {
        subject,
        body: emailBody,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Email generation error:", error);
    return Response.json(
      { error: "Failed to generate email" },
      { status: 500 }
    );
  }
}
