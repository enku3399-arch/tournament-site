'use client'
export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
    >
      🖨️ Хэвлэх
    </button>
  )
}
