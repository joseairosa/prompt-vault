# Setup Checklist for Prompt Vault

Use this checklist to ensure you've completed all necessary setup steps.

## Prerequisites
- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] Code editor (VS Code recommended)
- [ ] Supabase account created
- [ ] Stripe account created
- [ ] Railway account created (for deployment)
- [ ] GitHub account (for deployment)

## Local Development Setup

### 1. Repository Setup
- [ ] Cloned the repository
- [ ] Installed dependencies with `npm install`
- [ ] Verified build works with `npm run build`

### 2. Supabase Configuration
- [ ] Created new Supabase project
- [ ] Copied Project URL
- [ ] Copied anon (public) key
- [ ] Copied service_role (secret) key
- [ ] Ran `supabase/schema.sql` in SQL Editor
- [ ] Verified tables created: `profiles`, `prompts`, `folders`
- [ ] Enabled Email authentication provider
- [ ] (Optional) Configured Google OAuth provider
- [ ] Added `http://localhost:3000` to Site URL
- [ ] Added `http://localhost:3000/auth/callback` to Redirect URLs

### 3. Stripe Configuration
- [ ] Created "Prompt Vault Pro" product
- [ ] Set price to $5/month recurring
- [ ] Copied Price ID (starts with `price_`)
- [ ] Copied Publishable key (starts with `pk_test_`)
- [ ] Copied Secret key (starts with `sk_test_`)
- [ ] (Optional for local) Set up Stripe CLI for webhook testing

### 4. Environment Variables
- [ ] Copied `.env.local.example` to `.env.local`
- [ ] Set `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Set `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Set `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] Set `STRIPE_SECRET_KEY`
- [ ] Set `STRIPE_PRICE_ID_PRO`
- [ ] Set `NEXT_PUBLIC_APP_URL` to `http://localhost:3000`
- [ ] (Optional) Set `STRIPE_WEBHOOK_SECRET` for local testing

### 5. First Run
- [ ] Started dev server with `npm run dev`
- [ ] Opened `http://localhost:3000` in browser
- [ ] Landing page loads correctly
- [ ] No console errors

## Testing Checklist

### Authentication Testing
- [ ] Created account with email
- [ ] Received verification email
- [ ] Verified email address
- [ ] Logged in successfully
- [ ] (Optional) Logged in with Google OAuth
- [ ] Logged out successfully

### Prompt Management Testing
- [ ] Created first prompt
- [ ] Added tags to prompt
- [ ] Edited prompt
- [ ] Marked prompt as favorite
- [ ] Searched for prompt by title
- [ ] Searched for prompt by tag
- [ ] Deleted prompt

### Free Tier Testing
- [ ] Verified prompt counter shows X/50
- [ ] (Optional) Created 50 prompts
- [ ] (Optional) Verified error when creating 51st prompt

### Pro Features Testing (After Upgrade)
- [ ] Clicked "Upgrade to Pro"
- [ ] Redirected to Stripe checkout
- [ ] Used test card: 4242 4242 4242 4242
- [ ] Completed checkout
- [ ] Redirected to dashboard
- [ ] Pro badge appears in header
- [ ] Created folder
- [ ] Assigned prompt to folder
- [ ] Exported prompts as JSON
- [ ] Exported prompts as CSV
- [ ] Exported prompts as Markdown
- [ ] Opened billing portal
- [ ] Viewed subscription details

## Production Deployment Checklist

### 1. GitHub Setup
- [ ] Created new GitHub repository
- [ ] Pushed code to GitHub
- [ ] Verified all files pushed correctly
- [ ] `.env.local` is NOT in repository (should be in .gitignore)

### 2. Railway Deployment
- [ ] Created new Railway project
- [ ] Connected GitHub repository
- [ ] Added all environment variables
- [ ] Changed `NEXT_PUBLIC_APP_URL` to Railway URL
- [ ] Deployed successfully
- [ ] Opened Railway URL
- [ ] Landing page loads

### 3. Stripe Webhook Setup
- [ ] Created webhook endpoint in Stripe
- [ ] Set endpoint URL to `https://your-app.railway.app/api/webhooks/stripe`
- [ ] Selected events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- [ ] Copied webhook signing secret
- [ ] Updated `STRIPE_WEBHOOK_SECRET` in Railway
- [ ] Redeployed (automatic)

### 4. Supabase Production URLs
- [ ] Added Railway URL to Supabase Site URL
- [ ] Added `https://your-app.railway.app/auth/callback` to Redirect URLs
- [ ] (If using Google OAuth) Updated Google OAuth redirect URIs

### 5. Production Testing
- [ ] Created test account on production
- [ ] Verified email works
- [ ] Created prompts
- [ ] Tested search
- [ ] Completed test purchase
- [ ] Verified webhook received in Stripe Dashboard
- [ ] Verified user upgraded to Pro in Supabase
- [ ] Tested Pro features
- [ ] Tested billing portal

## Going Live Checklist

### 1. Stripe Live Mode
- [ ] Switched Stripe to live mode
- [ ] Created new "Prompt Vault Pro" product in live mode
- [ ] Copied new live Price ID
- [ ] Updated environment variables with live keys:
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (live)
  - `STRIPE_SECRET_KEY` (live)
  - `STRIPE_PRICE_ID_PRO` (live)
- [ ] Created new webhook for live mode
- [ ] Updated `STRIPE_WEBHOOK_SECRET` with live webhook secret

### 2. Custom Domain (Optional)
- [ ] Purchased domain
- [ ] Added domain to Railway
- [ ] Updated DNS records
- [ ] SSL certificate provisioned
- [ ] Updated `NEXT_PUBLIC_APP_URL` to custom domain
- [ ] Updated Supabase redirect URLs with custom domain
- [ ] Updated Stripe webhook URL with custom domain

### 3. Monitoring & Analytics
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Set up analytics (PostHog, Mixpanel, etc.)
- [ ] Set up uptime monitoring
- [ ] Configured Railway alerts
- [ ] Set up Supabase alerts

### 4. Legal & Compliance
- [ ] Added Privacy Policy
- [ ] Added Terms of Service
- [ ] Added Refund Policy
- [ ] GDPR compliance review
- [ ] Added cookie consent (if applicable)

### 5. Marketing
- [ ] Updated meta tags and SEO
- [ ] Created favicon and app icons
- [ ] Set up social media sharing images
- [ ] Created landing page copy
- [ ] Set up email templates in Supabase

## Maintenance Checklist

### Daily
- [ ] Check error logs in Railway
- [ ] Monitor Stripe webhook deliveries
- [ ] Review new user signups

### Weekly
- [ ] Check database usage in Supabase
- [ ] Review performance metrics
- [ ] Check for dependency updates

### Monthly
- [ ] Review costs (Railway, Supabase, Stripe)
- [ ] Update dependencies
- [ ] Security patch review
- [ ] Backup database
- [ ] Review user feedback

## Troubleshooting Checklist

### Build Failures
- [ ] All environment variables set?
- [ ] Dependencies installed correctly?
- [ ] TypeScript errors resolved?
- [ ] Checked build logs in Railway

### Authentication Issues
- [ ] Supabase project active?
- [ ] Redirect URLs configured?
- [ ] Environment variables correct?
- [ ] Email verification enabled?

### Payment Issues
- [ ] Stripe keys correct (test vs live)?
- [ ] Webhook secret updated?
- [ ] Webhook endpoint accessible?
- [ ] Event types selected in webhook?

### Database Issues
- [ ] SQL schema executed?
- [ ] RLS policies enabled?
- [ ] Tables exist?
- [ ] Indexes created?

## Security Review Checklist

- [ ] All environment variables in `.env.local` (not committed)
- [ ] Service role key never exposed to client
- [ ] RLS policies tested
- [ ] Webhook signatures verified
- [ ] User input validated
- [ ] SQL injection protection (Supabase handles this)
- [ ] XSS protection (React handles this)
- [ ] HTTPS enforced in production
- [ ] CORS configured correctly

## Performance Review Checklist

- [ ] Database indexes created
- [ ] Images optimized
- [ ] Bundle size reasonable
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals pass
- [ ] API response times < 200ms
- [ ] Database query times < 100ms

## Final Pre-Launch Checklist

- [ ] All features tested thoroughly
- [ ] All documentation complete
- [ ] Error handling in place
- [ ] Loading states implemented
- [ ] Success/error messages displayed
- [ ] Mobile responsive
- [ ] Cross-browser tested
- [ ] Accessibility review completed
- [ ] Security review completed
- [ ] Performance review completed
- [ ] Legal documents in place
- [ ] Support contact information added
- [ ] Backup and recovery plan in place

---

## Quick Reference

### Test Stripe Card Numbers
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Authentication: `4000 0025 0000 3155`

### Useful Commands
```bash
# Development
npm run dev

# Build
npm run build

# Start production server (after build)
npm run start

# Stripe CLI webhook forwarding
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Important URLs
- Supabase Dashboard: https://app.supabase.com
- Stripe Dashboard: https://dashboard.stripe.com
- Railway Dashboard: https://railway.app
- Your App (local): http://localhost:3000
- Your App (prod): [Your Railway URL]
