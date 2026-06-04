const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  IN_PRODUCTION: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  PENDING: 'bg-orange-100 text-orange-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  CANCELLED: 'bg-gray-100 text-gray-700',
  ORDERED: 'bg-purple-100 text-purple-700',
  RECEIVED: 'bg-green-100 text-green-700',
  ASSIGNED: 'bg-blue-100 text-blue-700',
  PICKED_UP: 'bg-indigo-100 text-indigo-700',
  IN_TRANSIT: 'bg-yellow-100 text-yellow-700',
  DELIVERED: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
  REVIEWED: 'bg-blue-100 text-blue-700',
  SUBMITTED: 'bg-purple-100 text-purple-700',
  ACCEPTED: 'bg-green-100 text-green-700',
  NORMAL: 'bg-green-100 text-green-700',
  LOW_STOCK: 'bg-yellow-100 text-yellow-700',
  OUT_OF_STOCK: 'bg-red-100 text-red-700',
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  APPROVED: 'Disetujui',
  IN_PRODUCTION: 'Diproduksi',
  COMPLETED: 'Selesai',
  REJECTED: 'Ditolak',
  PENDING: 'Menunggu',
  IN_PROGRESS: 'Berjalan',
  CANCELLED: 'Dibatalkan',
  ORDERED: 'Dipesan',
  RECEIVED: 'Diterima',
  ASSIGNED: 'Ditugaskan',
  PICKED_UP: 'Diambil',
  IN_TRANSIT: 'Dalam Perjalanan',
  DELIVERED: 'Terkirim',
  FAILED: 'Gagal',
  REVIEWED: 'Direview',
  SUBMITTED: 'Disubmit',
  ACCEPTED: 'Diterima BGN',
  NORMAL: 'Normal',
  LOW_STOCK: 'Stok Menipis',
  OUT_OF_STOCK: 'Stok Habis',
}

export function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-700'
  const label = STATUS_LABELS[status] ?? status
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      {label}
    </span>
  )
}
