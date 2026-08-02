import { NextResponse } from "next/server"

// Expected response structure:
// {
//   category_id: "cleaning",
//   estimated_hours: 3,
//   min_price: 1500,
//   max_price: 3000,
//   reasoning: "Deep cleaning a 2-bed apartment usually takes..."
// }

export async function POST(request: Request) {
  try {
    const { description } = await request.json()

    if (!description || description.length < 10) {
      return NextResponse.json(
        { error: "Description too short for estimation" },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY
    if (!apiKey) {
      // Mock response if API key is missing
      return NextResponse.json({
        estimated_hours: Math.max(1, Math.floor(description.length / 50)),
        min_price: 1000,
        max_price: 3500,
        reasoning: "This is a mock estimate because the AI key is not configured.",
        category_id: "general_help" // Fallback
      })
    }

    const systemPrompt = `You are a pricing and categorization AI for ErrandOwl Pakistan, a home services marketplace. 
Available categories are: "cleaning", "plumbing", "electrical", "delivery", "general_help", "assembly".
Based on the user's task description, estimate:
1. The best category_id.
2. Estimated hours required.
3. Minimum total price in PKR (Rs).
4. Maximum total price in PKR (Rs).
5. A 1-sentence reasoning.
Return ONLY a valid JSON object with keys: category_id, estimated_hours, min_price, max_price, reasoning.`

    // Fetch from OpenRouter API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://errandowl.com",
        "X-Title": "ErrandOwl"
      },
      body: JSON.stringify({
        model: "google/gemini-1.5-flash",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `User Description: "${description}"` }
        ]
      })
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error("OpenRouter API error text:", errText)
      throw new Error("Failed to fetch OpenRouter AI response")
    }

    const aiData = await response.json()
    const content = aiData.choices?.[0]?.message?.content

    if (!content) {
      throw new Error("Empty response from OpenRouter AI")
    }

    const parsed = JSON.parse(content)
    return NextResponse.json(parsed)

  } catch (error: any) {
    console.error("AI Estimator Error:", error)
    return NextResponse.json(
      { error: "Failed to generate estimate" },
      { status: 500 }
    )
  }
}
