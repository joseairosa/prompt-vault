'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PromptDialog } from '@/components/prompt-dialog'
import { Plus, Search, Star, Folder as FolderIcon, LogOut, Crown, Copy, Trash2, Edit, Download, Settings } from 'lucide-react'
import { toast } from 'sonner'
import type { Prompt, Profile, Folder } from '@/types/database'
import { format } from 'date-fns'

export default function DashboardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)
  const [selectedFolder, setSelectedFolder] = useState<string>('all')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const supabase = createClient()

      // Check auth
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        router.push('/login')
        return
      }

      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError
      setProfile(profileData)

      // Load prompts
      const { data: promptsData, error: promptsError } = await supabase
        .from('prompts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (promptsError) throw promptsError
      setPrompts(promptsData || [])

      // Load folders if pro
      if (profileData.is_pro) {
        const { data: foldersData, error: foldersError } = await supabase
          .from('folders')
          .select('*')
          .eq('user_id', user.id)
          .order('name')

        if (foldersError) throw foldersError
        setFolders(foldersData || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSavePrompt = async (promptData: Partial<Prompt>) => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (promptData.id) {
        // Update existing prompt
        const { error } = await supabase
          .from('prompts')
          .update({
            title: promptData.title,
            content: promptData.content,
            folder_id: promptData.folder_id,
            tags: promptData.tags,
          })
          .eq('id', promptData.id)
          .eq('user_id', user.id)

        if (error) throw error
        toast.success('Prompt updated!')
      } else {
        // Create new prompt
        const { error } = await supabase
          .from('prompts')
          .insert({
            user_id: user.id,
            title: promptData.title!,
            content: promptData.content!,
            folder_id: promptData.folder_id,
            tags: promptData.tags || [],
          })

        if (error) {
          if (error.message.includes('limit')) {
            toast.error('Free tier limit reached! Upgrade to Pro for unlimited prompts.')
            return
          }
          throw error
        }
        toast.success('Prompt created!')
      }

      loadData()
      setEditingPrompt(null)
    } catch (error) {
      console.error('Error saving prompt:', error)
      toast.error('Failed to save prompt')
      throw error
    }
  }

  const handleDeletePrompt = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Prompt deleted')
      loadData()
    } catch (error) {
      console.error('Error deleting prompt:', error)
      toast.error('Failed to delete prompt')
    }
  }

  const handleToggleFavorite = async (prompt: Prompt) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('prompts')
        .update({ is_favorite: !prompt.is_favorite })
        .eq('id', prompt.id)

      if (error) throw error
      loadData()
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Failed to update favorite')
    }
  }

  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success('Copied to clipboard!')
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleUpgradeToPro = async () => {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
      })
      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      toast.error('Failed to start checkout')
    }
  }

  const handleManageBilling = async () => {
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
      })
      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error creating portal session:', error)
      toast.error('Failed to open billing portal')
    }
  }

  const handleExport = (format: 'json' | 'csv' | 'md') => {
    const url = `/api/export?format=${format}`
    const link = document.createElement('a')
    link.href = url
    link.download = `prompt-vault-export.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success(`Exporting prompts as ${format.toUpperCase()}...`)
  }

  const filteredPrompts = prompts.filter((prompt) => {
    const matchesSearch =
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesFolder =
      selectedFolder === 'all' ||
      (selectedFolder === 'favorites' && prompt.is_favorite) ||
      (selectedFolder === 'no-folder' && !prompt.folder_id) ||
      prompt.folder_id === selectedFolder

    return matchesSearch && matchesFolder
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-zinc-950/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600" />
            <span className="text-xl font-bold">Prompt Vault</span>
          </div>
          <div className="flex items-center gap-2">
            {profile?.is_pro && (
              <>
                <Badge className="gap-1">
                  <Crown className="h-3 w-3" />
                  Pro
                </Badge>
                <div className="relative group">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <div className="absolute right-0 mt-2 w-40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all bg-white dark:bg-zinc-950 border rounded-lg shadow-lg py-1 z-10">
                    <button
                      onClick={() => handleExport('json')}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
                    >
                      Export as JSON
                    </button>
                    <button
                      onClick={() => handleExport('csv')}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
                    >
                      Export as CSV
                    </button>
                    <button
                      onClick={() => handleExport('md')}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
                    >
                      Export as Markdown
                    </button>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href="/dashboard/folders">
                    <FolderIcon className="h-4 w-4 mr-2" />
                    Manage Folders
                  </a>
                </Button>
                <Button variant="outline" size="sm" onClick={handleManageBilling}>
                  <Settings className="h-4 w-4 mr-2" />
                  Billing
                </Button>
              </>
            )}
            {!profile?.is_pro && (
              <Button size="sm" onClick={handleUpgradeToPro}>
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Pro
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Prompts</CardDescription>
              <CardTitle className="text-3xl">{prompts.length}</CardTitle>
            </CardHeader>
            {!profile?.is_pro && (
              <CardFooter className="text-sm text-muted-foreground">
                {prompts.length} / 50 (Free tier)
              </CardFooter>
            )}
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Favorites</CardDescription>
              <CardTitle className="text-3xl">
                {prompts.filter(p => p.is_favorite).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Folders</CardDescription>
              <CardTitle className="text-3xl">{folders.length}</CardTitle>
            </CardHeader>
            {!profile?.is_pro && (
              <CardFooter className="text-sm text-muted-foreground">
                Upgrade to Pro for folders
              </CardFooter>
            )}
          </Card>
        </div>

        {/* Search and Actions */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prompts by title, content, or tags..."
              className="pl-10"
            />
          </div>
          <Button onClick={() => {
            setEditingPrompt(null)
            setDialogOpen(true)
          }}>
            <Plus className="h-4 w-4 mr-2" />
            New Prompt
          </Button>
        </div>

        {/* Folder Tabs */}
        <Tabs value={selectedFolder} onValueChange={setSelectedFolder} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Prompts</TabsTrigger>
            <TabsTrigger value="favorites">
              <Star className="h-4 w-4 mr-2" />
              Favorites
            </TabsTrigger>
            {profile?.is_pro && (
              <>
                <TabsTrigger value="no-folder">
                  <FolderIcon className="h-4 w-4 mr-2" />
                  No Folder
                </TabsTrigger>
                {folders.map((folder) => (
                  <TabsTrigger key={folder.id} value={folder.id}>
                    <FolderIcon className="h-4 w-4 mr-2" />
                    {folder.name}
                  </TabsTrigger>
                ))}
              </>
            )}
          </TabsList>
        </Tabs>

        {/* Prompts Grid */}
        <div className="grid gap-4">
          {filteredPrompts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? 'No prompts found matching your search.' : 'No prompts yet. Create your first one!'}
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Prompt
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredPrompts.map((prompt) => (
              <Card key={prompt.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{prompt.title}</CardTitle>
                        <button
                          onClick={() => handleToggleFavorite(prompt)}
                          className="text-muted-foreground hover:text-yellow-500 transition-colors"
                        >
                          <Star
                            className={`h-4 w-4 ${prompt.is_favorite ? 'fill-yellow-500 text-yellow-500' : ''}`}
                          />
                        </button>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {prompt.content}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyContent(prompt.content)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingPrompt(prompt)
                          setDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePrompt(prompt.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardFooter className="flex justify-between items-center">
                  <div className="flex flex-wrap gap-2">
                    {prompt.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(prompt.created_at), 'MMM d, yyyy')}
                  </span>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>

      <PromptDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSavePrompt}
        prompt={editingPrompt}
        folders={folders}
        isPro={profile?.is_pro || false}
      />
    </div>
  )
}
