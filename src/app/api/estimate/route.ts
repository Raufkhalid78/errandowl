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

    const apiKey = process.env.GEMINI_API_KEY
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

    // Fetch from Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${systemPrompt}\n\nUser Description: "${description}"`
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      }
    )

    if (!response.ok) {
      const errText = await response.text()
      console.error("Gemini API error text:", errText)
      throw new Error("Failed to fetch Gemini AI response")
    }

    const aiData = await response.json()
    const content = aiData.candidates?.[0]?.content?.parts?.[0]?.text

    if (!content) {
      throw new Error("Empty response from Gemini AI")
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
