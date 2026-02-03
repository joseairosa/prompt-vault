# Prompt Vault - Enhanced Build Specification (Based on QuickInvoice Pro Model)

## Project Overview
Build a personal organizer for AI prompts. Users save, tag, search, and remix prompts. Free tier: 50 prompts; Pro ($5/mo): Unlimited, folders, export. Target: Beginners experimenting with ChatGPT. Deploy to Railway with Stripe payments.

## Tech Stack
- **Frontend**: Next.js 14+, TypeScript, Tailwind CSS, shadcn/ui (table, input, textarea, dialog, card, select, toast, tabs, badge).
- **Backend**: Next.js API Routes, Supabase (PostgreSQL for auth/DB).
- **Auth**: Supabase Auth (email/password, Google OAuth).
- **Payments**: Stripe (Checkout, Webhooks, Customer Portal).
- **Search**: Supabase full-text search on prompt text/tags.
- **Deployment**: Railway (env vars, auto-deploys).
- **Other**: React Hook Form + Zod, date-fns, Lucide React icons.

## Features
### Landing Page (`/`)
**Purpose**: Hero, features, CTA.
**Layout**:
```
┌─────────────────────────────────────────────┐
│ Hero: "Organize Your AI Prompts"            │
│ Sub: "Save, tag, search, remix"             │
│ [Get Started Free] [Pricing]                │
├─────────────────────────────────────────────┤
│ Features: Save/Tag/Search/Remix/Pro         │
│ Templates Showcase (3 examples)             │
│ How It Works (3 steps)                      │
│ Pricing Teaser (Free/Pro)                   │
│ Footer (Links, Copyright)                   │
└─────────────────────────────────────────────┘
```
**Components**: HeroSection, FeaturesGrid, TemplateCarousel, HowItWorks, PricingTeaser, Footer.
**CTA**: Free → /signup, Pro → /pricing.

### Dashboard (`/dashboard`) - Auth Required
**Purpose**: View/manage prompts.
**Layout**:
```
┌─────────────────────────────────────────────┐
│ Header: Logo | Dashboard | Prompts | User   │
├─────────────────────────────────────────────┤
│ Stats: Total Prompts | Used/Free Limit      │
│ Filters: [All] [Tag▼] [Search...]           │
├─────────────────────────────────────────────┤
│ Table: Title | Tags | Created | Actions     │
│ [+ New Prompt] [Export All]                 │
└─────────────────────────────────────────────┘
```
**Features**:
- Stats cards: Total prompts, used vs limit (Free: 50, Pro: Unlimited).
- Search/filter by tags/full-text.
- Table: Prompt title, tags (badges), date, actions (View/Edit/Delete/Duplicate).
- Pagination (25/page).
- Empty state: "No prompts yet. Create one!"
**Components**: DashboardHeader, PromptStats, PromptsTable, PromptRow, StatusBadge, ActionsMenu.
**API**: GET /api/prompts?search&tags&page&limit → {prompts: Prompt[], total: number}.

### Editor (`/prompts/new`, `/prompts/[id]/edit`) - Auth Required
**Purpose**: Create/edit prompt.
**Layout**:
```
┌─────────────────────────────────────────────┐
│ Create Prompt | [Save] [Save & Remix]       │
├──────────────────┬──────────────────────────┤
│ Form: Title, Text │ Preview (markdown)      │
│ Tags (multi-select) │                       │
│ Folder (Pro)       │                       │
└──────────────────┴──────────────────────────┘
```
**Features**:
- Title (input).
- Text (textarea, markdown support).
- Tags (multi-select, add new).
- Folder (Pro: dropdown/create).
- Preview: Real-time markdown render.
- Remix: Duplicate for editing.
- Validation: Title required, text min 10 chars.
**Components**: PromptForm, MarkdownEditor, TagSelector, FolderDropdown, PreviewPane.
**API**:
- POST /api/prompts {title, text, tags, folderId} → {prompt: Prompt}.
- PATCH /api/prompts/[id] {partial} → {prompt: Prompt}.
- POST /api/prompts/[id]/duplicate → {newId: string}.

### Pricing (`/pricing`)
**Layout**:
```
┌─────────────────────────────────────────────┐
│ Choose Plan | [Monthly] [Yearly - Save 20%] │
├──────────────┬──────────────────────────────┤
│ FREE         │ PRO ($5/mo)                  │
│ 50 prompts   │ Unlimited                    │
│ Basic search │ Folders/Export               │
│ [Get Started]│ [Subscribe]                  │
└──────────────┴──────────────────────────────┘
```
**Plans**:
- Free: 50 prompts, basic search/tags.
- Pro: Unlimited, folders, export (JSON/MD), advanced search.
**API**: POST /api/stripe/create-checkout {priceId} → {url: string}.

### Auth Pages (`/login`, `/signup`)
- Login: Email/password, Google, "Forgot?".
- Signup: Email/password/confirm, Google, plan select (?plan=pro).

## Database Schema (Supabase)
### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### subscriptions
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT, -- active, trialing, canceled
  plan_id TEXT, -- free or price_xxx
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
INDEX idx_subscriptions_user_id ON subscriptions(user_id);
```

### prompts
```sql
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  text TEXT NOT NULL,
  tags TEXT[], -- array of strings
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL, -- Pro
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
-- Full-text search
ALTER TABLE prompts ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (to_tsvector('english', title || ' ' || text)) STORED;
CREATE INDEX idx_prompts_search ON prompts USING GIN(search_vector);
-- Indexes
INDEX idx_prompts_user_id ON prompts(user_id);
INDEX idx_prompts_tags ON prompts USING GIN(tags);
```

### folders (Pro)
```sql
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### RLS
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ... (similar for others)
CREATE POLICY "Users manage own prompts" ON prompts FOR ALL USING (user_id = auth.uid());
```

## API Routes
- GET /api/prompts: List with filters/search.
- POST /api/prompts: Create.
- PATCH/DELETE /api/prompts/[id]: Update/delete.
- POST /api/stripe/create-checkout: Stripe session.
- POST /api/stripe/webhooks: Handle events.
- GET /api/user/stats: Usage (prompts count vs limit).

## File Structure
```
prompt-vault/
├── app/
│   ├── (auth)/login/signup/page.tsx
│   ├── (dashboard)/dashboard/invoices/[id]/page.tsx
│   ├── api/prompts/route.ts [id]/route.ts
│   ├── api/stripe/.../route.ts
│   ├── convert/page.tsx
│   ├── pricing/page.tsx
│   ├── layout.tsx page.tsx globals.css
├── components/
│   ├── dashboard/PromptTable.tsx PromptRow.tsx
│   ├── editor/PromptForm.tsx MarkdownPreview.tsx
│   ├── landing/Hero.tsx Features.tsx
│   ├── ui/ (shadcn)
├── lib/
│   ├── supabase/client.ts server.ts
│   ├── stripe/client.ts
│   ├── utils.ts
├── types/index.ts
├── supabase/migrations/001_schema.sql
├── .env.local .env.example
├── next.config.js tailwind.config.js tsconfig.json
├── package.json
```

## Env Vars
```
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_PRO=price_...
APP_URL=railway-app-url
```

## Success Criteria
- Free limit: 50 prompts (count via Supabase).
- Pro: Unlimited, folders.
- Search: Full-text on text/tags.
- Auth: Supabase with limits check.
- Deploy: Railway (pnpm install, build, start).
- Test: CRUD prompts, search, subscribe.

Build with Next.js/Supabase/Stripe on Railway. Use pnpm. --full-auto. When done: openclaw gateway wake --text "Done: Built Prompt Vault" --mode now