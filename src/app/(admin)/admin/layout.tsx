export default function AdminSubLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-3 sm:px-4 py-6">
      {children}
    </div>
  )
}
