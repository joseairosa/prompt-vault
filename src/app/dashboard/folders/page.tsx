'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { FolderDialog } from '@/components/folder-dialog'
import { Plus, ArrowLeft, Edit, Trash2, FolderIcon } from 'lucide-react'
import { toast } from 'sonner'
import type { Folder, Profile } from '@/types/database'

export default function FoldersPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null)

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

      // Check if user is pro
      if (!profileData.is_pro) {
        router.push('/dashboard')
        toast.error('Folders are a Pro feature. Please upgrade to access.')
        return
      }

      // Load folders
      const { data: foldersData, error: foldersError } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user.id)
        .order('name')

      if (foldersError) throw foldersError
      setFolders(foldersData || [])
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load folders')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveFolder = async (folderData: Partial<Folder>) => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (folderData.id) {
        // Update existing folder
        const { error } = await supabase
          .from('folders')
          .update({
            name: folderData.name,
            description: folderData.description,
          })
          .eq('id', folderData.id)
          .eq('user_id', user.id)

        if (error) throw error
        toast.success('Folder updated!')
      } else {
        // Create new folder
        const { error } = await supabase
          .from('folders')
          .insert({
            user_id: user.id,
            name: folderData.name!,
            description: folderData.description,
          })

        if (error) throw error
        toast.success('Folder created!')
      }

      loadData()
      setEditingFolder(null)
    } catch (error) {
      console.error('Error saving folder:', error)
      toast.error('Failed to save folder')
      throw error
    }
  }

  const handleDeleteFolder = async (id: string) => {
    if (!confirm('Are you sure? Prompts in this folder will not be deleted, just unassigned.')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Folder deleted')
      loadData()
    } catch (error) {
      console.error('Error deleting folder:', error)
      toast.error('Failed to delete folder')
    }
  }

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
      <header className="border-b bg-white/50 dark:bg-zinc-950/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Manage Folders</h1>
            <p className="text-muted-foreground">
              Organize your prompts into folders for better management.
            </p>
          </div>
          <Button onClick={() => {
            setEditingFolder(null)
            setDialogOpen(true)
          }}>
            <Plus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {folders.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center">
                <FolderIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  No folders yet. Create your first one to organize your prompts!
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Folder
                </Button>
              </CardContent>
            </Card>
          ) : (
            folders.map((folder) => (
              <Card key={folder.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <FolderIcon className="h-5 w-5 text-blue-500" />
                      <CardTitle>{folder.name}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingFolder(folder)
                          setDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteFolder(folder.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {folder.description && (
                    <CardDescription>{folder.description}</CardDescription>
                  )}
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </div>

      <FolderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveFolder}
        folder={editingFolder}
      />
    </div>
  )
}
