// Create a Stripe Customer Portal session for subscription management
// Required env:
// - STRIPE_SECRET_KEY
// - NEXT_PUBLIC_SUPABASE_URL
// - SUPABASE_SERVICE_ROLE_KEY

import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2022-11-15" });

// Admin client for verifying users and reading profiles
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
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
    return;
  }

  // Get access token from Authorization header or cookie
  const authHeader = req.headers.authorization;
  const accessToken = authHeader?.replace("Bearer ", "") || req.cookies?.["sb-access-token"];

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

    // Get user's stripe_customer_id
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.stripe_customer_id) {
      res.status(400).json({ error: "No subscription found for this account." });
      return;
    }

    // Determine origin for redirect
    const origin = req.headers.origin || process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.host}`;

    // Create a portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${origin}/account`,
    });

    res.status(200).json({ url: portalSession.url });
  } catch (err) {
    console.error("Stripe portal session error:", err);
    res.status(500).json({ error: "Failed to create portal session." });
  }
}
