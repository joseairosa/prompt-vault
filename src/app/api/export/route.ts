import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is pro
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_pro')
      .eq('id', user.id)
      .single()

    if (!profile?.is_pro) {
      return NextResponse.json(
        { error: 'Export is a Pro feature' },
        { status: 403 }
      )
    }

    // Get format from query params
    const format = req.nextUrl.searchParams.get('format') || 'json'

    // Load prompts with folder info
    const { data: prompts, error: promptsError } = await supabase
      .from('prompts')
      .select(`
        *,
        folder:folders(name)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (promptsError) throw promptsError

    let content: string
    let contentType: string
    let filename: string

    switch (format) {
      case 'json': {
        content = JSON.stringify(prompts, null, 2)
        contentType = 'application/json'
        filename = `prompt-vault-export-${new Date().toISOString().split('T')[0]}.json`
        break
      }

      case 'csv': {
        // CSV header
        const header = ['Title', 'Content', 'Tags', 'Folder', 'Favorite', 'Created At']
        const rows = prompts?.map((prompt) => [
          `"${prompt.title.replace(/"/g, '""')}"`,
          `"${prompt.content.replace(/"/g, '""')}"`,
          `"${prompt.tags.join(', ')}"`,
          `"${(prompt.folder as any)?.name || ''}"`,
          prompt.is_favorite ? 'Yes' : 'No',
          new Date(prompt.created_at).toISOString(),
        ])

        content = [header, ...(rows || [])].map(row => row.join(',')).join('\n')
        contentType = 'text/csv'
        filename = `prompt-vault-export-${new Date().toISOString().split('T')[0]}.csv`
        break
      }

      case 'markdown':
      case 'md': {
        content = `# Prompt Vault Export\n\nExported on ${new Date().toLocaleDateString()}\n\n`
        content += `Total Prompts: ${prompts?.length || 0}\n\n---\n\n`

        prompts?.forEach((prompt) => {
          content += `## ${prompt.title}\n\n`
          content += `${prompt.content}\n\n`

          if (prompt.tags.length > 0) {
            content += `**Tags:** ${prompt.tags.map((t: string) => `\`${t}\``).join(', ')}\n\n`
          }

          if ((prompt.folder as any)?.name) {
            content += `**Folder:** ${(prompt.folder as any).name}\n\n`
          }

          if (prompt.is_favorite) {
            content += `⭐ **Favorite**\n\n`
          }

          content += `*Created: ${new Date(prompt.created_at).toLocaleDateString()}*\n\n`
          content += `---\n\n`
        })

        contentType = 'text/markdown'
        filename = `prompt-vault-export-${new Date().toISOString().split('T')[0]}.md`
        break
      }

      default:
        return NextResponse.json(
          { error: 'Invalid format. Use json, csv, or md' },
          { status: 400 }
        )
    }

    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error exporting prompts:', error)
    return NextResponse.json(
      { error: 'Failed to export prompts' },
      { status: 500 }
    )
  }
}
