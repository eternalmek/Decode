// Delete user account
// Required env:
// - STRIPE_SECRET_KEY
// - NEXT_PUBLIC_SUPABASE_URL
// - SUPABASE_SERVICE_ROLE_KEY

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

// Admin client for deleting users
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
    // Verify the user
    const supabase = getSupabaseClient(accessToken);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      res.status(401).json({ error: "Unauthorized. Invalid session." });
      return;
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Get user's profile to check for stripe_customer_id
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    // Cancel Stripe subscriptions if customer exists
    if (profile?.stripe_customer_id) {
      try {
        // List and cancel all active subscriptions
        const subscriptions = await stripe.subscriptions.list({
          customer: profile.stripe_customer_id,
          status: "active",
        });

        for (const sub of subscriptions.data) {
          await stripe.subscriptions.cancel(sub.id);
          console.log(`Cancelled subscription ${sub.id} for user ${user.id}`);
        }
      } catch (stripeErr) {
        console.error("Error cancelling Stripe subscriptions:", stripeErr);
        // Continue with account deletion even if Stripe cancellation fails
      }
    }

    // Delete profile from profiles table
    const { error: profileDeleteError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", user.id);

    if (profileDeleteError) {
      console.error("Error deleting profile:", profileDeleteError);
    }

    // Delete user from Supabase Auth
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error("Error deleting user:", deleteError);
      res.status(500).json({ error: "Failed to delete account." });
      return;
    }

    console.log(`User ${user.id} account deleted successfully`);
    res.status(200).json({ success: true, message: "Account deleted successfully." });
  } catch (err) {
    console.error("Delete account error:", err);
    res.status(500).json({ error: "Failed to delete account." });
  }
}
