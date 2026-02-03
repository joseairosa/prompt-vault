# Deployment Guide for Prompt Vault

This guide will walk you through deploying Prompt Vault to Railway with Supabase and Stripe integration.

## Prerequisites

Before you begin, make sure you have:
- A [GitHub](https://github.com) account
- A [Supabase](https://supabase.com) account
- A [Stripe](https://stripe.com) account
- A [Railway](https://railway.app) account

## Step 1: Set Up Supabase

1. **Create a new Supabase project:**
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Click "New Project"
   - Fill in project details and wait for setup to complete

2. **Run the database schema:**
   - In your Supabase project, go to the SQL Editor
   - Copy the contents of `supabase/schema.sql` from this repository
   - Paste and execute the SQL in the editor
   - Verify tables were created in the Table Editor

3. **Configure Authentication:**
   - Go to Authentication > Providers
   - Enable "Email" provider
   - Enable "Google" provider:
     - Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com)
     - Add authorized redirect URI: `https://[your-project-ref].supabase.co/auth/v1/callback`
     - Add the Client ID and Secret to Supabase

4. **Get your API keys:**
   - Go to Project Settings > API
   - Copy the following:
     - Project URL (`NEXT_PUBLIC_SUPABASE_URL`)
     - `anon` public key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
     - `service_role` secret key (`SUPABASE_SERVICE_ROLE_KEY`) - Keep this secure!

## Step 2: Set Up Stripe

1. **Create a product:**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com)
   - Navigate to Products > Add Product
   - Create "Prompt Vault Pro" product
   - Set recurring price to $5/month
   - Copy the Price ID (starts with `price_`) - this is your `STRIPE_PRICE_ID_PRO`

2. **Get API keys:**
   - Go to Developers > API Keys
   - Copy your Publishable key (`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`)
   - Copy your Secret key (`STRIPE_SECRET_KEY`) - Keep this secure!

3. **Set up webhook (after deploying to Railway):**
   - We'll come back to this in Step 4

## Step 3: Deploy to Railway

1. **Push code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin your-github-repo-url
   git push -u origin main
   ```

2. **Create Railway project:**
   - Go to [Railway Dashboard](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will automatically detect it's a Next.js project

3. **Add environment variables:**
   - In Railway, click on your service
   - Go to "Variables" tab
   - Add all the following variables:

   ```
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Stripe
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_placeholder  # We'll update this after webhook setup
   STRIPE_PRICE_ID_PRO=your_stripe_price_id

   # App URL - Use your Railway domain
   NEXT_PUBLIC_APP_URL=https://your-app.up.railway.app
   ```

4. **Deploy:**
   - Railway will automatically deploy your app
   - Once deployed, note your app URL (e.g., `https://your-app.up.railway.app`)

## Step 4: Configure Stripe Webhook

1. **Create webhook endpoint:**
   - In Stripe Dashboard, go to Developers > Webhooks
   - Click "Add endpoint"
   - Endpoint URL: `https://your-app.up.railway.app/api/webhooks/stripe`
   - Select events to listen to:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Click "Add endpoint"

2. **Get webhook secret:**
   - Click on your newly created webhook
   - Click "Reveal" under "Signing secret"
   - Copy the webhook secret (starts with `whsec_`)

3. **Update Railway environment variable:**
   - Go back to Railway dashboard
   - Update `STRIPE_WEBHOOK_SECRET` with the actual webhook secret
   - The app will automatically redeploy

## Step 5: Update Supabase Redirect URLs

1. **Add Railway URL to Supabase:**
   - Go to Supabase Dashboard > Authentication > URL Configuration
   - Add your Railway URL to "Site URL"
   - Add `https://your-app.up.railway.app/auth/callback` to "Redirect URLs"

2. **Update Google OAuth (if using):**
   - Go to Google Cloud Console
   - Update authorized redirect URIs to include:
     - `https://[your-project-ref].supabase.co/auth/v1/callback`

## Step 6: Test Your Deployment

1. **Test signup/login:**
   - Visit your Railway URL
   - Try creating an account with email
   - Try logging in with Google OAuth

2. **Test prompt creation:**
   - Create a test prompt (should work for free tier)
   - Try creating 51 prompts (should hit free tier limit)

3. **Test Stripe integration:**
   - Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date and any CVC
   - Complete checkout flow
   - Verify webhook receives events in Stripe Dashboard
   - Verify user is upgraded to Pro in Supabase

4. **Test Pro features:**
   - Create folders
   - Export prompts
   - Create unlimited prompts

## Troubleshooting

### Build fails on Railway
- Check that all environment variables are set correctly
- View build logs in Railway dashboard
- Ensure your `.env.local` file is in `.gitignore`

### Authentication not working
- Verify Supabase redirect URLs include your Railway domain
- Check that Google OAuth credentials have correct redirect URIs
- Check browser console for errors

### Stripe webhooks not working
- Verify webhook URL is correct
- Check webhook secret is set in Railway
- View webhook attempts in Stripe Dashboard
- Check Railway logs for webhook processing

### Database errors
- Verify SQL schema was executed successfully in Supabase
- Check Row Level Security policies are enabled
- Verify service role key is correct

## Monitoring

1. **Railway logs:**
   - View application logs in Railway dashboard
   - Monitor for errors and performance issues

2. **Supabase logs:**
   - Monitor database queries and auth events
   - Check for RLS policy violations

3. **Stripe webhook logs:**
   - Monitor webhook delivery in Stripe Dashboard
   - Check for failed webhook deliveries

## Updating

To deploy updates:
```bash
git add .
git commit -m "Your update message"
git push
```

Railway will automatically detect the changes and redeploy.

## Going to Production

Before going live:
1. Switch Stripe from test mode to live mode
2. Update all Stripe keys to production keys
3. Update webhook endpoint to use production keys
4. Test thoroughly with real payment methods
5. Set up proper error monitoring (e.g., Sentry)
6. Configure custom domain in Railway (optional)
7. Review Supabase usage and upgrade plan if needed

## Support

For issues:
- Check Railway logs
- Check Supabase logs
- Check Stripe webhook logs
- Open an issue on GitHub

## Cost Estimation

- **Railway**: Free tier available, then ~$5-10/month for hobby projects
- **Supabase**: Free tier includes 500MB database, 50MB file storage
- **Stripe**: 2.9% + 30¢ per successful charge
- **Total estimated monthly cost**: $0-15 for small user base
