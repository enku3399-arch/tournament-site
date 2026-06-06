import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
      <span className="text-6xl">🏆</span>
      <h1 className="text-3xl font-bold">404</h1>
      <p className="text-muted">Хуудас олдсонгүй</p>
      <Link href="/" className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-hover">
        Нүүр хуудас руу буцах
      </Link>
    </div>
  )
}
