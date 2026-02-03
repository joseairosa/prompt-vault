export interface Profile {
  id: string
  email: string
  full_name: string | null
  is_pro: boolean
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_status: string | null
  trial_ends_at: string | null
  created_at: string
  updated_at: string
}

export interface Folder {
  id: string
  user_id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface Prompt {
  id: string
  user_id: string
  folder_id: string | null
  title: string
  content: string
  tags: string[]
  is_favorite: boolean
  created_at: string
  updated_at: string
}
