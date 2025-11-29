// Create a Stripe Checkout session for a monthly subscription.
// Required env:
// - STRIPE_SECRET_KEY
// - STRIPE_PRICE_ID  (The price ID you create in Stripe dashboard for $9.99/month)
// - NEXT_PUBLIC_SUPABASE_URL
// - SUPABASE_SERVICE_ROLE_KEY
// Optionally NEXT_PUBLIC_APP_URL or the request origin is used to build success/cancel URLs.

import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2022-11-15" });

// Create a Supabase client with the user's access token for auth verification
function getSupabaseClient(accessToken) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  );
}

// Admin client for updating profiles
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

  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) {
    res.status(500).json({ error: "Stripe price ID not configured." });
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
    // Verify the user
    const supabase = getSupabaseClient(accessToken);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      res.status(401).json({ error: "Unauthorized. Invalid session." });
      return;
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Check if user has a profile with stripe_customer_id
    let { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    let stripeCustomerId = profile?.stripe_customer_id;

    // If no profile exists, create one
    if (profileError && profileError.code === "PGRST116") {
      const { error: insertError } = await supabaseAdmin
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email,
          plan: "free",
        });

      if (insertError) {
        console.error("Error creating profile:", insertError);
      }
    }

    // Create Stripe customer if not exists
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      stripeCustomerId = customer.id;

      // Save the stripe_customer_id to the profile
      await supabaseAdmin
        .from("profiles")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("id", user.id);
    }

    // Determine origin for redirect
    const origin = req.headers.origin || process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.host}`;

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        metadata: {
          product: "decodr_premium",
          supabase_user_id: user.id,
        },
      },
      success_url: `${origin}/account?payment=success`,
      cancel_url: `${origin}/account?payment=cancel`,
      metadata: {
        supabase_user_id: user.id,
      },
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe create session error:", err);
    res.status(500).json({ error: "Failed to create Stripe Checkout session." });
  }
}