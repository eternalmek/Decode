// pages/api/create-checkout-session.js
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, priceId } = req.body;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription", // or "payment" for one-time
      payment_method_types: ["card"],
      customer_email: email, // 👈 how we "remember" the user
      line_items: [
        {
          price: priceId, // from your Stripe Dashboard
          quantity: 1,
        },
      ],
      success_url: "https://decode-jade.vercel.app/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://decode-jade.vercel.app/cancel",
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    return res.status(500).json({ error: "Error creating checkout session" });
  }
}
