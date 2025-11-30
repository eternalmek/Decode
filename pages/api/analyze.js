// Server-side API route to call OpenAI and return a structured JSON analysis.
// Place this file in pages/api/analyze.js for Next.js (Node environment).
// Required env: OPENAI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "@supabase/supabase-js";

// Admin client for reading/updating profiles
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).send("Method not allowed");
    return;
  }

  const { input } = req.body || {};
  if (!input || typeof input !== "string" || input.trim().length === 0) {
    res.status(400).json({ error: "Please provide an input conversation string." });
    return;
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    res.status(500).json({ error: "OpenAI API key not configured on server." });
    return;
  }

  // Check for authenticated user and enforce usage limits
  const authHeader = req.headers.authorization;
  const accessToken = authHeader?.replace("Bearer ", "");

  let isPremium = false;

  if (accessToken) {
    try {
      const supabaseAdmin = getSupabaseAdmin();

      // Verify the user
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);

      if (!authError && user) {
        // Get user's profile
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("plan, free_uses_remaining")
          .eq("id", user.id)
          .single();

        if (profile) {
          isPremium = profile.plan === "premium";
          const freeUsesRemaining = profile.free_uses_remaining;

          // Check and atomically decrement for non-premium users
          if (!isPremium) {
            if (freeUsesRemaining !== null && freeUsesRemaining <= 0) {
              res.status(403).json({
                error: "Free trial limit reached. Please subscribe to continue.",
                code: "TRIAL_LIMIT_REACHED"
              });
              return;
            }

            // Atomically decrement only if remaining > 0
            // Note: Usage is decremented before the API call to prevent race conditions.
            // If the API call fails, the user still loses the usage to prevent abuse.
            if (freeUsesRemaining !== null && freeUsesRemaining > 0) {
              const { data: updateResult, error: updateError } = await supabaseAdmin
                .from("profiles")
                .update({ free_uses_remaining: freeUsesRemaining - 1 })
                .eq("id", user.id)
                .gt("free_uses_remaining", 0)
                .select("free_uses_remaining")
                .single();

              if (updateError || !updateResult) {
                // Race condition: another request already decremented to 0
                res.status(403).json({
                  error: "Free trial limit reached. Please subscribe to continue.",
                  code: "TRIAL_LIMIT_REACHED"
                });
                return;
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Error checking user:", err);
      // Continue without user verification - will fall back to unauthenticated behavior
    }
  }

  // System prompt instructs the model to return valid JSON and nothing else.
  const systemPrompt = `
You are an assistant that analyzes short message conversations. You MUST return only valid JSON in the exact shape described below (no extra text).
The JSON shape must be:
{
  "emotion_breakdown": { "<label>": "<Low|Moderate|High|None|...>", ... },
  "hidden_meaning": "<short paragraph>",
  "recommended_replies": {
    "calm_reply": "<text>",
    "confident_reply": "<text>",
    "boundaries_reply": "<text>",
    "flirty_reply": "<text>"
  }
}
Respond concisely. Use plain strings for values.
`;

  const userPrompt = `Analyze the following conversation and return the JSON described exactly as instructed above. Conversation:\n\n${input}`;

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 700,
      }),
    });

    if (!openaiRes.ok) {
      const text = await openaiRes.text();
      console.error("OpenAI error:", text);
      res.status(openaiRes.status).send(text);
      return;
    }

    const completion = await openaiRes.json();
    const raw = completion.choices?.[0]?.message?.content || "";

    // Try to extract JSON from the model output (robust against small wrapper text)
    const jsonMatch = raw.match(/({[\s\S]*})/);
    const jsonString = jsonMatch ? jsonMatch[1] : raw;

    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch (err) {
      console.error("Failed to parse model JSON:", err, "raw:", raw);
      res.status(500).json({ error: "Failed to parse OpenAI response. Raw output logged on server." });
      return;
    }

    // Basic validation to ensure expected fields exist
    if (
      !parsed.emotion_breakdown ||
      !parsed.hidden_meaning ||
      !parsed.recommended_replies
    ) {
      res.status(500).json({ error: "OpenAI returned unexpected JSON shape." });
      return;
    }

    res.status(200).json(parsed);
  } catch (err) {
    console.error("Analyze route error:", err);
    res.status(500).json({ error: "Server error during analysis." });
  }
}