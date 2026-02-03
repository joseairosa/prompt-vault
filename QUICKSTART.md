# Quick Start Guide

Get Prompt Vault running locally in under 10 minutes.

## Prerequisites

- Node.js 18 or higher
- A Supabase account (free tier works)
- A Stripe account (test mode is fine)

## 1. Clone and Install

```bash
git clone <your-repo-url>
cd prompt-vault
npm install
```

## 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the entire `supabase/schema.sql` file
3. Go to Settings > API and copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key

## 3. Set Up Stripe

1. Get your test API keys from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Create a product:
   - Go to Products > Add Product
   - Name: "Prompt Vault Pro"
   - Price: $5/month recurring
   - Copy the Price ID (starts with `price_`)

## 4. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx  # Optional for local dev
STRIPE_PRICE_ID_PRO=price_xxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 6. Test the App

### Test Authentication
1. Click "Get Started"
2. Create an account with email
3. Check your email for verification (Supabase will send it)
4. Log in

### Test Prompt Management
1. Create a new prompt
2. Add tags
3. Search for prompts
4. Mark prompts as favorites

### Test Stripe (Optional for local dev)
To test payments locally, you need to set up Stripe webhooks:

1. Install Stripe CLI:
   ```bash
   brew install stripe/stripe-cli/stripe  # macOS
   # or download from stripe.com/docs/stripe-cli
   ```

2. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

3. Copy the webhook signing secret to your `.env.local`

4. In another terminal, trigger a test payment:
   - Use test card: `4242 4242 4242 4242`
   - Any future date, any CVC
   - Complete the checkout flow

## Common Issues

### "Supabase URL is required"
- Make sure you've copied the `.env.local.example` to `.env.local`
- Check that all environment variables are set

### Authentication not working
- Verify your Supabase project is active
- Check that the SQL schema was executed
- Ensure redirect URLs are configured in Supabase:
  - Go to Authentication > URL Configuration
  - Add `http://localhost:3000` to Site URL
  - Add `http://localhost:3000/auth/callback` to Redirect URLs

### Can't create more than 50 prompts
- This is expected for free tier users
- Upgrade to Pro to test unlimited prompts

### Stripe webhook errors
- For local development, you can skip webhook testing
- The app will work without webhooks, but Pro upgrades won't work
- Use Stripe CLI to forward webhooks for full testing

## Next Steps

- Read the full [README.md](./README.md) for detailed information
- Check out [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
- Customize the app to your needs

## Development Tips

### Database Changes
If you modify the schema:
1. Update `supabase/schema.sql`
2. Run the new SQL in Supabase SQL Editor
3. Or use Supabase migrations (see Supabase docs)

### Adding Features
The codebase is organized as:
- `/src/app` - Pages and API routes
- `/src/components` - React components
- `/src/lib` - Utilities and configurations
- `/src/types` - TypeScript types

### Testing Payments
Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Authentication required: `4000 0025 0000 3155`

More test cards: [stripe.com/docs/testing](https://stripe.com/docs/testing)

## Need Help?

- Check the [README.md](./README.md)
- Review [DEPLOYMENT.md](./DEPLOYMENT.md)
- Open an issue on GitHub
