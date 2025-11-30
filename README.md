```markdown
# Decodr - Next.js (OpenAI + Stripe)

This repo demonstrates a Next.js page that:
- Calls OpenAI server-side (pages/api/analyze) to analyze message conversations and returns structured JSON.
- Uses Stripe Checkout (pages/api/create-checkout-session) to subscribe users to a single monthly premium plan ($9.99 / month).
- Frontend allows guests 3 free analyses, and signed-up users get 10 free analyses before prompting to subscribe.

Setup
1. Copy .env.example to .env.local and set:
   - OPENAI_API_KEY
   - STRIPE_SECRET_KEY
   - STRIPE_PRICE_ID (create a recurring price in Stripe for $9.99/month)
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - (Optional) NEXT_PUBLIC_APP_URL

2. Install dependencies:
   npm install
   npm install stripe lucide-react

3. Run dev:
   npm run dev

Notes
- The analyze API uses the "gpt-3.5-turbo" model and asks the model to return JSON in a specific shape. You can change the model or the system prompt to tune output.
- The Stripe endpoint creates a Checkout session in subscription mode. After a successful purchase Stripe will redirect back to /account?payment=success. User subscription status is stored in the Supabase profiles table.
- For production, secure your environment variables and configure webhook verification if you need server-side confirmation of subscription status (recommended for robust access control).
