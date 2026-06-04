interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center gap-2 mt-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-1 text-sm border rounded disabled:opacity-40 hover:bg-gray-50"
      >
        ‹ Sebelumnya
      </button>
      <span className="text-sm text-gray-600">
        Halaman {page} dari {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-1 text-sm border rounded disabled:opacity-40 hover:bg-gray-50"
      >
        Berikutnya ›
      </button>
    </div>
  )
}
