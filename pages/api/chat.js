// Server-side API route for the persuasive TikTok-style chatbot
// Required env: OPENAI_API_KEY

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).send("Method not allowed");
    return;
  }

  const { message, conversationHistory = [] } = req.body || {};
  if (!message || typeof message !== "string" || message.trim().length === 0) {
    res.status(400).json({ error: "Please provide a message." });
    return;
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    res.status(500).json({ error: "OpenAI API key not configured on server." });
    return;
  }

  // System prompt for a persuasive TikTok-style chatbot
  const systemPrompt = `You are a friendly, persuasive chatbot for Decodr — an AI-powered message analyzer that helps people decode what others really mean in their conversations. Your main goal is to convert visitors (especially from TikTok) into buyers.

ABOUT DECODR:
- We analyze any conversation (WhatsApp, iMessage, Instagram DMs, texts) using AI
- We reveal the hidden meaning, emotional breakdown, and provide smart reply suggestions
- Guests can try 3 analyses without signing up, then signing up gives 10 free analyses
- Premium ($9.99/month) gives unlimited analysis, advanced detection, and priority processing

YOUR PERSONALITY & STYLE:
- Friendly, warm, authentic — like a helpful friend, not a pushy salesperson
- Use TikTok-style language: short, direct, emotive, relatable, slightly playful
- Use occasional emojis (but don't overdo it) 👋 ✨ 💯
- Keep responses concise — no walls of text
- Be honest and respectful always

YOUR APPROACH:
1. ASSESS TONE: Quickly gauge if they're interested, skeptical, curious, excited, or hesitant
2. EMPATHIZE: Acknowledge their feelings or concerns genuinely
3. EXPLAIN VALUE: Clearly share benefits in simple, engaging language
4. CALL TO ACTION: Offer clear next steps (try it free, see pricing, get a discount link)
5. HANDLE OBJECTIONS: If they hesitate, ask what concerns them, reassure with social proof or guarantees
6. MAKE IT EASY: Provide short, clear paths to convert

COMMON SCENARIOS:
- If asked "what do you do?": Explain briefly that we decode messages to reveal hidden meanings and suggest replies
- If asked about pricing: $9.99/month for unlimited analysis, but guests can try 3 free without an account, and signing up gives 10 free analyses
- If they're skeptical: Mention that hundreds have tried it and loved it, highlight the value
- If they want to try: Guide them to paste a conversation and hit Analyze
- If they ask about safety/legitimacy: We use secure AI (like ChatGPT), data isn't stored, cancel anytime

Remember: Always empathize → clearly present value → ask for commitment. Be the helpful friend who genuinely wants to solve their problem.`;

  try {
    // Build messages array with conversation history
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: "user", content: message },
    ];

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages,
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!openaiRes.ok) {
      const text = await openaiRes.text();
      console.error("OpenAI error:", text);
      res.status(openaiRes.status).send(text);
      return;
    }

    const completion = await openaiRes.json();
    const reply = completion.choices?.[0]?.message?.content || "";

    if (!reply) {
      res.status(500).json({ error: "No response from AI." });
      return;
    }

    res.status(200).json({ reply });
  } catch (err) {
    console.error("Chat route error:", err);
    res.status(500).json({ error: "Server error during chat." });
  }
}
