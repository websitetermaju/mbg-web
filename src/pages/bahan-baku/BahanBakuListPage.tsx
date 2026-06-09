import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bahanBakuApi } from '@/api/endpoints/bahan-baku'
import { StatusBadge } from '@/components/StatusBadge'
import { Pagination } from '@/components/Pagination'
import type { BahanBaku } from '@/types'

function TambahStokModal({
  item,
  onClose,
  onConfirm,
}: {
  item: BahanBaku
  onClose: () => void
  onConfirm: (jumlah: number, referensi: string) => void
}) {
  const [jumlah, setJumlah] = useState(0)
  const [referensi, setReferensi] = useState('')
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
        <h2 className="font-semibold text-gray-800 mb-4">Tambah Stok — {item.nama}</h2>
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah ({item.satuan})</label>
            <input
              type="number"
              min={1}
              value={jumlah}
              onChange={(e) => setJumlah(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-bgn-green-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Referensi (No. PO / Keterangan)</label>
            <input
              value={referensi}
              onChange={(e) => setReferensi(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-bgn-green-400 focus:outline-none"
              placeholder="Opsional"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onConfirm(jumlah, referensi)}
            disabled={jumlah <= 0}
            className="flex-1 bg-bgn-green-400 text-white py-2 rounded-lg hover:bg-bgn-green-500 disabled:opacity-50"
          >
            Konfirmasi
          </button>
          <button onClick={onClose} className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50">
            Batal
          </button>
        </div>
      </div>
    </div>
  )
}

export function BahanBakuListPage() {
  const [page, setPage] = useState(1)
  const [modalItem, setModalItem] = useState<BahanBaku | null>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['bahan-baku', page],
    queryFn: () => bahanBakuApi.list({ page, limit: 20 }),
  })

  const deleteMutation = useMutation({
    mutationFn: bahanBakuApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bahan-baku'] }),
  })

  const tambahStokMutation = useMutation({
    mutationFn: ({ id, jumlah, referensi }: { id: string; jumlah: number; referensi: string }) =>
      bahanBakuApi.tambahStok(id, jumlah, referensi),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bahan-baku'] })
      setModalItem(null)
    },
  })

  const items = data?.data.data ?? []
  const meta = data?.data.meta

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Bahan Baku</h1>
        <div className="flex items-center gap-2">
          <Link
            to="/stock-opname"
            className="border border-bgn-200 text-bgn-700 px-4 py-2 rounded-lg text-sm hover:bg-bgn-50"
          >
            Stok opname
          </Link>
          <Link
            to="/bahan-baku/baru"
            className="bg-bgn-green-400 text-white px-4 py-2 rounded-lg text-sm hover:bg-bgn-green-500"
          >
            + Tambah Bahan
          </Link>
        </div>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Memuat...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-md border border-bgn-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bgn-200">
              <tr>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Nama</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Satuan</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Stok Akhir</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Stok Min</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Status</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Harga/Satuan</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bgn-100">
              {items.map((b) => (
                <tr key={b.id} className="odd:bg-white even:bg-bgn-50 hover:bg-bgn-100 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    <Link to={`/bahan-baku/${b.id}`} className="text-bgn-800 hover:underline font-medium">
                      {b.nama}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{b.satuan}</td>
                  <td className="px-4 py-3 text-gray-600">{b.stokAkhir}</td>
                  <td className="px-4 py-3 text-gray-600">{b.stokMinimum}</td>
                  <td className="px-4 py-3"><StatusBadge status={b.statusStok} /></td>
                  <td className="px-4 py-3 text-gray-600">Rp {b.hargaSatuan.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => setModalItem(b)}
                        className="text-bgn-800 hover:underline text-sm"
                      >
                        Tambah Stok
                      </button>
                      <Link to={`/bahan-baku/${b.id}/edit`} className="text-blue-600 hover:underline text-sm">
                        Edit
                      </Link>
                      <button
                        onClick={() => { if (confirm('Hapus bahan baku ini?')) deleteMutation.mutate(b.id) }}
                        className="text-red-500 hover:underline text-sm"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Belum ada bahan baku</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} totalPages={meta?.totalPages ?? 1} onPageChange={setPage} />

      {modalItem && (
        <TambahStokModal
          item={modalItem}
          onClose={() => setModalItem(null)}
          onConfirm={(jumlah, referensi) =>
            tambahStokMutation.mutate({ id: modalItem.id, jumlah, referensi })
          }
        />
      )}
    </div>
  )
}
