import { NextRequest, NextResponse } from 'next/server'
import { syncFacebookNews } from '@/lib/facebook-news-sync'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  const secret = process.env.CRON_SECRET
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await syncFacebookNews()
  return NextResponse.json(result)
}
