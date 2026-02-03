# Prompt Vault - Project Summary

## Overview
Prompt Vault is a full-stack SaaS application for organizing AI prompts with a freemium business model. Built with Next.js 14, Supabase, and Stripe.

## Architecture

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Forms**: React Hook Form + Zod validation
- **Notifications**: Sonner (toast notifications)

### Backend
- **API**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
  - Email/Password
  - Google OAuth
- **Payments**: Stripe
  - Checkout Sessions
  - Webhooks
  - Customer Portal
- **Storage**: PostgreSQL with full-text search

### Deployment
- **Platform**: Railway
- **Build**: Automatic from GitHub
- **Environment**: Node.js 18+

## Features Implemented

### Core Features
✅ User authentication (email + Google OAuth)
✅ Prompt CRUD operations
✅ Full-text search across prompts
✅ Tag-based organization
✅ Favorites system
✅ Real-time prompt counter

### Free Tier Features
✅ Up to 50 prompts limit (enforced at database level)
✅ Basic tagging
✅ Full-text search
✅ Favorites

### Pro Tier Features ($5/mo)
✅ Unlimited prompts
✅ Folder organization
✅ Export to JSON
✅ Export to CSV
✅ Export to Markdown
✅ Stripe subscription management
✅ Customer portal access

### Security Features
✅ Row Level Security (RLS) policies
✅ User-scoped data access
✅ Secure API routes with authentication
✅ Environment variable protection
✅ Stripe webhook signature verification

## File Structure

```
prompt-vault/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── create-checkout-session/route.ts
│   │   │   ├── create-portal-session/route.ts
│   │   │   ├── export/route.ts
│   │   │   └── webhooks/stripe/route.ts
│   │   ├── auth/callback/route.ts
│   │   ├── dashboard/
│   │   │   ├── folders/page.tsx
│   │   │   └── page.tsx
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── page.tsx (landing page)
│   ├── components/
│   │   ├── ui/ (shadcn components)
│   │   ├── folder-dialog.tsx
│   │   └── prompt-dialog.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── middleware.ts
│   │   ├── stripe.ts
│   │   └── utils.ts
│   ├── types/
│   │   └── database.ts
│   └── middleware.ts
├── supabase/
│   └── schema.sql
├── public/
├── .env.local.example
├── railway.json
├── railway.toml
├── DEPLOYMENT.md
├── QUICKSTART.md
├── README.md
└── package.json
```

## Database Schema

### Tables

**profiles**
- Extends Supabase auth.users
- Stores subscription status and Stripe IDs
- RLS policies for user privacy

**prompts**
- User prompts with full-text search
- Tags stored as PostgreSQL array
- Folder relationship (nullable)
- Automatic search vector generation
- 50 prompt limit for free users (trigger)

**folders**
- Pro feature only
- Unique folder names per user
- Optional descriptions

### Key Features
- Automatic profile creation on signup (trigger)
- Full-text search with weighted fields
- Prompt limit enforcement (trigger)
- Automatic timestamp updates (triggers)
- Comprehensive RLS policies

## API Routes

### Public Routes
- `GET /` - Landing page
- `POST /api/auth/*` - Supabase auth endpoints
- `GET /login` - Login page
- `GET /signup` - Signup page

### Protected Routes
- `GET /dashboard` - Main dashboard
- `GET /dashboard/folders` - Folder management (Pro only)
- `POST /api/create-checkout-session` - Start Stripe checkout
- `POST /api/create-portal-session` - Open billing portal
- `GET /api/export?format=json|csv|md` - Export prompts (Pro only)

### Webhook Routes
- `POST /api/webhooks/stripe` - Stripe webhook handler

## Environment Variables

### Required
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-only)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key
- `STRIPE_SECRET_KEY` - Stripe secret key (server-only)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `STRIPE_PRICE_ID_PRO` - Stripe price ID for Pro plan
- `NEXT_PUBLIC_APP_URL` - Application URL

## Stripe Integration

### Checkout Flow
1. User clicks "Upgrade to Pro"
2. API creates Checkout Session
3. User redirected to Stripe hosted checkout
4. Payment processed
5. Webhook updates user to Pro
6. User redirected to dashboard

### Webhook Events
- `checkout.session.completed` - Initial subscription
- `customer.subscription.updated` - Status changes
- `customer.subscription.deleted` - Cancellations

### Security
- Webhook signature verification
- Metadata validation
- Idempotent operations

## Authentication Flow

### Email/Password
1. User signs up with email
2. Supabase sends verification email
3. User verifies email
4. Profile created automatically (trigger)
5. User can log in

### Google OAuth
1. User clicks "Continue with Google"
2. Redirected to Google consent screen
3. Google redirects to Supabase callback
4. Supabase redirects to app callback
5. App callback redirects to dashboard

## Search Implementation

### Full-Text Search
- PostgreSQL tsvector with GIN index
- Weighted search across:
  - Title (weight A)
  - Content (weight B)
  - Tags (weight C)
- Real-time client-side filtering
- Search across title, content, and tags

### Filters
- All prompts
- Favorites only
- By folder (Pro)
- No folder
- Search query

## Business Logic

### Free Tier Limits
- Enforced at database level (trigger)
- 50 prompts maximum
- Error thrown on 51st prompt
- User prompted to upgrade

### Pro Features
- Checked on client and server
- Conditional UI rendering
- Server-side enforcement
- Badge display for Pro users

## Security Considerations

### Implemented
✅ Row Level Security on all tables
✅ Server-side authentication checks
✅ Environment variable protection
✅ Webhook signature verification
✅ User-scoped queries
✅ HTTPS enforcement (production)
✅ Secure cookie handling

### Best Practices
- Never expose service role key to client
- Validate user input (Zod schemas)
- Sanitize database queries (Supabase)
- Rate limiting (Railway/Supabase)

## Performance Optimizations

### Database
- Indexes on user_id columns
- GIN index for full-text search
- Efficient RLS policies
- Connection pooling (Supabase)

### Frontend
- Next.js automatic code splitting
- Image optimization
- Static page generation where possible
- React Server Components

## Testing Recommendations

### Manual Testing Checklist
- [ ] User signup (email)
- [ ] User signup (Google)
- [ ] Login (email)
- [ ] Login (Google)
- [ ] Create prompt
- [ ] Edit prompt
- [ ] Delete prompt
- [ ] Search prompts
- [ ] Tag prompts
- [ ] Favorite prompts
- [ ] Hit 50 prompt limit
- [ ] Upgrade to Pro
- [ ] Create folders
- [ ] Assign prompts to folders
- [ ] Export to JSON
- [ ] Export to CSV
- [ ] Export to Markdown
- [ ] Manage billing
- [ ] Cancel subscription
- [ ] Logout

### Test Accounts
- Use Stripe test cards
- Create multiple test accounts
- Test both free and Pro users

## Known Limitations

1. **No offline support** - Requires internet connection
2. **No prompt sharing** - Each user's prompts are private
3. **No prompt versioning** - Edits overwrite previous version
4. **No bulk operations** - Must manage prompts one at a time
5. **No mobile app** - Web-only (responsive design)
6. **Email verification required** - Can't use app without verifying email

## Future Enhancement Ideas

### Features
- Prompt templates
- Prompt sharing/marketplace
- Collaboration features
- Prompt versioning/history
- Bulk import/export
- Prompt analytics
- API access
- Browser extension
- Mobile apps

### Technical
- End-to-end tests (Playwright)
- Unit tests (Jest/Vitest)
- Performance monitoring (Sentry)
- Analytics (PostHog/Mixpanel)
- A/B testing
- CDN for static assets
- Redis caching

## Maintenance

### Regular Tasks
- Monitor error logs (Railway)
- Check webhook deliveries (Stripe)
- Review database usage (Supabase)
- Update dependencies
- Security patches
- Backup database

### Scaling Considerations
- Supabase connection pooling
- Railway resource allocation
- Database indexing optimization
- CDN for static assets
- Background job processing (if needed)

## Support & Documentation

- ✅ README.md - Project overview
- ✅ QUICKSTART.md - Local development guide
- ✅ DEPLOYMENT.md - Production deployment guide
- ✅ PROJECT_SUMMARY.md - This file
- ✅ Inline code comments
- ✅ TypeScript types for documentation

## License
MIT

## Contributors
Built as a demo SaaS application showcasing:
- Modern Next.js architecture
- Supabase integration
- Stripe payments
- Full-stack TypeScript
- Production-ready deployment
