// Get current user's profile
// Required env:
// - NEXT_PUBLIC_SUPABASE_URL
// - SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "@supabase/supabase-js";

// Admin client for reading/creating profiles and verifying users
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
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).end("Method Not Allowed");
    return;
  }

  // Get access token from Authorization header
  const authHeader = req.headers.authorization;
  const accessToken = authHeader?.replace("Bearer ", "");

  if (!accessToken) {
    res.status(401).json({ error: "Unauthorized. Please log in." });
    return;
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();

    // Verify the user using the admin client
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);

    if (authError || !user) {
      res.status(401).json({ error: "Unauthorized. Invalid session." });
      return;
    }

    // Get user's profile
    let { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, plan, stripe_customer_id, free_uses_remaining, created_at")
      .eq("id", user.id)
      .single();

    // If no profile exists, create one
    if (profileError && profileError.code === "PGRST116") {
      const { data: newProfile, error: insertError } = await supabaseAdmin
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email,
          plan: "free",
          free_uses_remaining: 3,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating profile:", insertError);
        res.status(500).json({ error: "Failed to create profile." });
        return;
      }

      profile = newProfile;
    } else if (profileError) {
      console.error("Error fetching profile:", profileError);
      res.status(500).json({ error: "Failed to fetch profile." });
      return;
    }

    res.status(200).json(profile);
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ error: "Failed to get profile." });
  }
}
