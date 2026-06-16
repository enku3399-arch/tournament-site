import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { syncFacebookNews } from '@/lib/facebook-news-sync'
import { importImagesFromUrls } from '@/lib/news-image-import'
import type {
  FacebookSyncSettings,
  NewsArticle,
  PendingNewsItem,
} from '@/lib/site-settings'
import { normalizeNewsArticle, sortNewsByDate } from '@/lib/site-settings'

async function loadAll() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', ['news', 'news_pending', 'facebook_sync'])

  if (error) throw new Error(error.message)

  const map = Object.fromEntries((data ?? []).map(r => [r.key, r.value]))
  return {
    news: sortNewsByDate(((map.news as NewsArticle[]) ?? []).map(normalizeNewsArticle)),
    pending: (map.news_pending as PendingNewsItem[]) ?? [],
    facebook_sync: (map.facebook_sync as FacebookSyncSettings) ?? {
      enabled: false,
      sourceType: 'group',
      sourceId: '',
      accessToken: '',
    },
  }
}

async function saveKey(key: string, value: unknown) {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('site_settings')
    .upsert({ key, value }, { onConflict: 'key' })
  if (error) throw new Error(error.message)
}

export async function GET() {
  try {
    const data = await loadAll()
    return NextResponse.json(data)
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const action = body.action as string

    if (action === 'sync') {
      const result = await syncFacebookNews()
      return NextResponse.json(result)
    }

    if (action === 'save_sync_settings') {
      const settings = body.settings as FacebookSyncSettings
      await saveKey('facebook_sync', settings)
      return NextResponse.json({ ok: true, facebook_sync: settings })
    }

    const { news, pending, facebook_sync } = await loadAll()

    if (action === 'reject') {
      const id = body.id as string
      const nextPending = pending.filter(p => p.id !== id)
      await saveKey('news_pending', nextPending)
      return NextResponse.json({ ok: true, pending: nextPending, news })
    }

    if (action === 'approve') {
      const id = body.id as string
      const item = pending.find(p => p.id === id)
      if (!item) return NextResponse.json({ error: 'Мэдээ олдсонгүй' }, { status: 404 })

      const edits = (body.edits ?? {}) as Partial<PendingNewsItem>
      const merged = { ...item, ...edits }
      const importedImages = merged.imagePaths?.length
        ? await importImagesFromUrls(merged.imagePaths)
        : []

      const article: NewsArticle = normalizeNewsArticle({
        id: crypto.randomUUID(),
        date: merged.date,
        tag: merged.tag || 'Мэдээ',
        tagColor: merged.tagColor || 'gold',
        author: merged.author || 'Facebook',
        title: merged.title,
        excerpt: merged.excerpt,
        content: merged.content ?? '',
        feature: false,
        imagePaths: importedImages,
        facebookUrl: merged.facebookUrl,
        sourcePostId: merged.sourcePostId,
      })

      const nextNews = sortNewsByDate([article, ...news])
      const nextPending = pending.filter(p => p.id !== id)

      await saveKey('news', nextNews)
      await saveKey('news_pending', nextPending)

      return NextResponse.json({ ok: true, news: nextNews, pending: nextPending, facebook_sync })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
