import OpenAI from "openai"

export async function POST(request: Request) {
  try {
    const { name, company, linkedinUrl, twitterUrl, websiteUrl } = await request.json()

    // At least one URL should be provided for research
    if (!linkedinUrl && !twitterUrl && !websiteUrl) {
      return Response.json({ error: "At least one URL (LinkedIn, Twitter, or Website) is required for research" }, { status: 400 })
    }

    // Build research context
    const context = []
    if (name) context.push(`Name: ${name}`)
    if (company) context.push(`Company: ${company}`)
    if (linkedinUrl) context.push(`LinkedIn: ${linkedinUrl}`)
    if (twitterUrl) context.push(`Twitter: ${twitterUrl}`)
    if (websiteUrl) context.push(`Website: ${websiteUrl}`)

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Perform web search for additional information
    let webSearchResults = ""
    if (name || company) {
      try {
        const searchQuery = `${name || 'investor'} ${company || ''} investment focus recent investments`.trim()
        const searchResponse = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.TAVILY_API_KEY}`,
          },
          body: JSON.stringify({
            query: searchQuery,
            search_depth: "advanced",
            max_results: 5,
            include_answer: true,
            include_raw_content: true
          })
        })
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json()
          webSearchResults = `\n\nWeb Search Results:\n${
            searchData.answer || "No additional information found."
          }\n\nSources: ${
            searchData.results
              ?.map((r: Record<string, unknown>) => r.title)
              .join(", ") || "N/A"
          }`;
        }
      } catch (error) {
        console.log('Web search failed:', error)
        webSearchResults = "\n\nNote: Web search unavailable, using available information only."
      }
    }

    // Generate research summary using AI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Research and provide a comprehensive professional summary about this investor based on the following information:
          
          ${context.join('\n')}${webSearchResults}
          
          Provide detailed insights about:
          1. Their investment focus areas and sectors of interest
          2. Recent investments or portfolio companies
          3. Key interests, specialties, and expertise
          4. Notable achievements and background
          5. Investment philosophy and approach
          
          Structure your response with clear sections and be specific about recent activity when possible.`,
        },
      ],
    })

    const researchSummary = completion.choices[0]?.message?.content || "Unable to generate research summary."

    return Response.json({
      success: true,
      research: {
        name,
        company,
        summary: researchSummary,
        generatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Research error:", error)
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return Response.json({ error: "Failed to research investor" }, { status: 500 })
  }
}
