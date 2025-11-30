# Stripe & Supabase Integration Setup

This document explains how to set up the user authentication, subscription, and account management features.

## Environment Variables

### Required Environment Variables

Set these in `.env.local` for local development and in Vercel → Project → Settings → Environment Variables for production:

```bash
# Supabase (public - used by client)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Supabase (private - server only)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe (server only)
STRIPE_SECRET_KEY=sk_live_... or sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_... (your existing Premium plan price ID)

# OpenAI (for analyze feature)
OPENAI_API_KEY=sk-...
```

### Where to Find These Values

1. **Supabase Keys**: Go to your Supabase project → Settings → API
   - `NEXT_PUBLIC_SUPABASE_URL`: Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `anon` public key
   - `SUPABASE_SERVICE_ROLE_KEY`: `service_role` secret key

2. **Stripe Keys**: Go to Stripe Dashboard → Developers → API keys
   - `STRIPE_SECRET_KEY`: Secret key (use test key for development)
   - `STRIPE_PRICE_ID`: Go to Products → Your Premium Plan → Pricing → Copy the Price ID

3. **Stripe Webhook Secret**: See webhook setup below

## Supabase Setup

### 1. Create the Profiles Table

Run the SQL script in `supabase-profiles.sql` in your Supabase SQL Editor:

1. Go to Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Paste the contents of `supabase-profiles.sql`
4. Click "Run"

This creates:
- `profiles` table with columns: `id`, `email`, `plan`, `stripe_customer_id`, `created_at`
- Row Level Security policies
- Automatic profile creation trigger on user signup

### 2. Configure Authentication

1. Go to Authentication → Providers
2. Enable Email provider (it's enabled by default)
3. Optionally configure email confirmation settings

## Stripe Setup

### 1. Use Your Existing Premium Plan

1. Go to Stripe Dashboard → Products
2. Find your existing Premium plan
3. Copy the Price ID (starts with `price_`)
4. Set it as `STRIPE_PRICE_ID` in your environment variables

### 2. Configure the Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter your endpoint URL:
   - Local development: Use Stripe CLI (see below)
   - Production: `https://your-domain.com/api/stripe-webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click "Add endpoint"
6. Copy the "Signing secret" and set it as `STRIPE_WEBHOOK_SECRET`

### 3. Configure Customer Portal (for subscription management)

1. Go to Stripe Dashboard → Settings → Billing → Customer portal
2. Enable features you want (cancel subscription, update payment method, etc.)
3. Save changes

## Local Development with Stripe CLI

For testing webhooks locally:

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe-webhook
   ```
4. Copy the webhook signing secret shown and set it as `STRIPE_WEBHOOK_SECRET`
5. Run your dev server: `npm run dev`

## Testing the Full Flow

1. **Sign Up**: Go to `/login` and create an account
2. **Check Profile**: Go to `/account` to see your free plan status
3. **Subscribe**: Click "Go Premium" and complete Stripe Checkout (use test card `4242 4242 4242 4242`)
4. **Verify Premium**: After payment, you should be redirected back and see "Premium" status
5. **Manage Subscription**: Click "Manage Subscription" to access the Stripe billing portal
6. **Delete Account**: Test the account deletion flow

## API Routes

| Route                          | Method | Description                                        |
| ------------------------------ | ------ | -------------------------------------------------- |
| `/api/create-checkout-session` | POST   | Creates a Stripe Checkout session for subscription |
| `/api/create-portal-session`   | POST   | Creates a Stripe Customer Portal session           |
| `/api/stripe-webhook`          | POST   | Handles Stripe webhook events                      |
| `/api/get-profile`             | GET    | Gets the current user's profile                    |
| `/api/delete-account`          | POST   | Deletes the user's account                         |

## Pages

| Page       | Description                              |
| ---------- | ---------------------------------------- |
| `/`        | Home page with analyze feature           |
| `/login`   | Sign up / Sign in page                   |
| `/app`     | Main app page (requires authentication)  |
| `/account` | Account management page                  |

## Gating Premium Features

To check if a user has a premium plan, fetch their profile:

```javascript
const res = await fetch('/api/get-profile', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});
const profile = await res.json();

if (profile.plan === 'premium') {
  // Show premium features
} else {
  // Show free features or paywall
}
```

## Troubleshooting

1. **"Unauthorized" errors**: Make sure you're passing the access token in the Authorization header
2. **Webhook not updating profile**: Check that `STRIPE_WEBHOOK_SECRET` is correct and the webhook URL is accessible
3. **Profile not created**: Run the SQL script to create the trigger, or the profile will be created on first `/api/get-profile` call
4. **Stripe errors**: Check that all Stripe environment variables are set correctly
