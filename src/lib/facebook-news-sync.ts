import type {
  FacebookSyncSettings,
  NewsArticle,
  PendingNewsItem,
} from '@/lib/site-settings'
import { createServiceClient } from '@/lib/supabase-server'

type FbPost = {
  id: string
  message?: string
  created_time?: string
  full_picture?: string
  permalink_url?: string
  from?: { name?: string }
  attachments?: {
    data?: Array<{
      media?: { image?: { src?: string } }
      subattachments?: { data?: Array<{ media?: { image?: { src?: string } } }> }
    }>
  }
}

function formatDate(iso?: string): string {
  if (!iso) return new Date().toISOString().slice(0, 10).replace(/-/g, '.')
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10).replace(/-/g, '.')
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
}

function splitMessage(message: string): { title: string; excerpt: string; content: string } {
  const text = message.trim()
  if (!text) return { title: 'Шинэ мэдээ', excerpt: '', content: '' }

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const title = (lines[0] ?? text).slice(0, 160)
  const rest = lines.slice(1).join('\n') || text
  const excerpt = rest.slice(0, 280) || title
  return { title, excerpt, content: rest || text }
}

function collectImages(post: FbPost): string[] {
  const urls = new Set<string>()
  if (post.full_picture) urls.add(post.full_picture)
  for (const att of post.attachments?.data ?? []) {
    if (att.media?.image?.src) urls.add(att.media.image.src)
    for (const sub of att.subattachments?.data ?? []) {
      if (sub.media?.image?.src) urls.add(sub.media.image.src)
    }
  }
  return [...urls]
}

function postToPending(post: FbPost): PendingNewsItem {
  const { title, excerpt, content } = splitMessage(post.message ?? '')
  return {
    id: crypto.randomUUID(),
    source: 'facebook',
    sourcePostId: post.id,
    sourceUrl: post.permalink_url,
    fetchedAt: new Date().toISOString(),
    date: formatDate(post.created_time),
    tag: 'Мэдээ',
    tagColor: 'gold',
    author: post.from?.name ?? 'Facebook',
    title,
    excerpt,
    content,
    imagePaths: collectImages(post),
    facebookUrl: post.permalink_url,
  }
}

export function collectKnownPostIds(
  news: NewsArticle[],
  pending: PendingNewsItem[],
): Set<string> {
  const ids = new Set<string>()
  for (const a of news) if (a.sourcePostId) ids.add(a.sourcePostId)
  for (const p of pending) if (p.sourcePostId) ids.add(p.sourcePostId)
  return ids
}

async function fetchFbPosts(
  sync: FacebookSyncSettings,
): Promise<{ posts: FbPost[]; error?: string }> {
  if (!sync.sourceId.trim() || !sync.accessToken.trim()) {
    return { posts: [], error: 'Group/Page ID болон Access Token оруулна уу' }
  }

  const edge = sync.sourceType === 'page' ? 'posts' : 'feed'
  const url = new URL(`https://graph.facebook.com/v21.0/${sync.sourceId}/${edge}`)
  url.searchParams.set(
    'fields',
    'id,message,created_time,full_picture,permalink_url,from,attachments{media,subattachments}',
  )
  url.searchParams.set('limit', '25')
  url.searchParams.set('access_token', sync.accessToken)

  const res = await fetch(url.toString())
  const json = await res.json() as { data?: FbPost[]; error?: { message?: string } }

  if (!res.ok || json.error) {
    const msg = json.error?.message ?? `HTTP ${res.status}`
    return {
      posts: [],
      error: `Facebook API алдаа: ${msg}. Private group-д API ихэвчлэн ажиллахгүй — Page эсвэл гараар импорт ашиглана уу.`,
    }
  }

  return { posts: json.data ?? [] }
}

async function loadSettings(): Promise<{
  news: NewsArticle[]
  pending: PendingNewsItem[]
  sync: FacebookSyncSettings
}> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', ['news', 'news_pending', 'facebook_sync'])

  const map = Object.fromEntries((data ?? []).map(r => [r.key, r.value]))
  return {
    news: (map.news as NewsArticle[]) ?? [],
    pending: (map.news_pending as PendingNewsItem[]) ?? [],
    sync: (map.facebook_sync as FacebookSyncSettings) ?? {
      enabled: false,
      sourceType: 'group',
      sourceId: '',
      accessToken: '',
    },
  }
}

async function saveSettingsKey(key: string, value: unknown) {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('site_settings')
    .upsert({ key, value }, { onConflict: 'key' })
  if (error) throw new Error(error.message)
}

export async function syncFacebookNews(): Promise<{
  ok: boolean
  newCount: number
  pending: PendingNewsItem[]
  error?: string
}> {
  const { news, pending, sync } = await loadSettings()

  if (!sync.enabled) {
    return { ok: false, newCount: 0, pending, error: 'Facebook синк идэвхгүй байна' }
  }

  const { posts, error } = await fetchFbPosts(sync)
  const known = collectKnownPostIds(news, pending)
  const fresh = posts
    .filter(p => p.message?.trim() || p.full_picture)
    .filter(p => !known.has(p.id))
    .map(postToPending)

  const nextPending = [...fresh, ...pending]
  const nextSync: FacebookSyncSettings = {
    ...sync,
    lastSyncAt: new Date().toISOString(),
    lastSyncError: error,
    lastNewCount: fresh.length,
  }

  await saveSettingsKey('news_pending', nextPending)
  await saveSettingsKey('facebook_sync', nextSync)

  return {
    ok: !error || fresh.length > 0,
    newCount: fresh.length,
    pending: nextPending,
    error,
  }
}
