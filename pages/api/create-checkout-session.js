// Create a Stripe Checkout session for a monthly subscription.
// Required env:
// - STRIPE_SECRET_KEY
// - STRIPE_PRICE_ID  (The price ID you create in Stripe dashboard for $9.99/month)
// Optionally NEXT_PUBLIC_APP_URL or the request origin is used to build success/cancel URLs.

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2022-11-15" });

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

  // Determine origin for redirect
  const origin = req.headers.origin || process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.host}`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        // optional metadata
        metadata: { product: "decodr_premium" },
      },
      success_url: `${origin}/?payment=success`,
      cancel_url: `${origin}/?payment=cancel`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe create session error:", err);
    res.status(500).json({ error: "Failed to create Stripe Checkout session." });
  }
}