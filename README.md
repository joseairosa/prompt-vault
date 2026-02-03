# Prompt Vault

A personal organizer for AI prompts. Save, tag, search, and remix your ChatGPT, Claude, and other AI prompts.

## Features

- **Free Tier**: Up to 50 prompts with basic tagging and search
- **Pro Tier ($5/mo)**: Unlimited prompts, folders, and export capabilities
- Full-text search across all prompts
- Tag-based organization
- Favorites system
- Export to JSON, CSV, or Markdown (Pro)
- Folder organization (Pro)

## Tech Stack

- **Frontend**: Next.js 14+ with TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email/Password + Google OAuth)
- **Payments**: Stripe (Checkout, Webhooks, Customer Portal)
- **Deployment**: Railway

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase account and project
- A Stripe account

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd prompt-vault
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file based on `.env.local.example`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_PRICE_ID_PRO=your_stripe_price_id_for_pro_plan

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Set up the database:
   - Go to your Supabase project
   - Run the SQL from `supabase/schema.sql` in the SQL Editor

5. Configure Stripe:
   - Create a product for "Pro Plan" at $5/month
   - Copy the Price ID to `STRIPE_PRICE_ID_PRO`
   - Set up a webhook endpoint pointing to `your-domain/api/webhooks/stripe`
   - Copy the webhook secret to `STRIPE_WEBHOOK_SECRET`

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Deployment to Railway

1. Push your code to GitHub

2. Create a new project on [Railway](https://railway.app)

3. Connect your GitHub repository

4. Add the following environment variables in Railway:
   - All variables from `.env.local`
   - Set `NEXT_PUBLIC_APP_URL` to your Railway deployment URL

5. Deploy! Railway will automatically build and deploy your app.

6. Update your Stripe webhook URL to point to your Railway deployment

## Database Schema

The application uses the following main tables:

- `profiles`: User profiles with subscription information
- `prompts`: User prompts with full-text search
- `folders`: Folder organization (Pro feature)

See `supabase/schema.sql` for the complete schema with RLS policies.

## Features Breakdown

### Free Tier
- Up to 50 prompts
- Basic tagging
- Full-text search
- Favorites

### Pro Tier ($5/mo)
- Unlimited prompts
- Folder organization
- Export to JSON, CSV, Markdown
- Advanced search filters
- Priority support

## Project Structure

```
prompt-vault/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   ├── auth/              # Auth callbacks
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── login/             # Login page
│   │   ├── signup/            # Signup page
│   │   └── page.tsx           # Landing page
│   ├── components/            # React components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── prompt-dialog.tsx  # Prompt creation/edit dialog
│   │   └── folder-dialog.tsx  # Folder management dialog
│   ├── lib/                   # Utility functions
│   │   ├── supabase/          # Supabase client setup
│   │   ├── stripe.ts          # Stripe client
│   │   └── utils.ts           # Helper functions
│   └── types/                 # TypeScript types
├── supabase/
│   └── schema.sql             # Database schema
├── public/                    # Static assets
└── package.json
```

## License

MIT

## Support

For issues and feature requests, please open an issue on GitHub.
