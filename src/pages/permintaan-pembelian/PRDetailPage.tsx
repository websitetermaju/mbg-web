import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { prApi } from '@/api/endpoints/permintaan-pembelian'
import { StatusBadge } from '@/components/StatusBadge'
import { getErrorMessage } from '@/utils/error'

export function PRDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [alasanTolak, setAlasanTolak] = useState('')
  const [error, setError] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['pr', id],
    queryFn: () => prApi.getOne(id!),
    enabled: !!id,
  })

  const approveMutation = useMutation({
    mutationFn: () => prApi.approve(id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pr', id] }),
    onError: (err) => setError(getErrorMessage(err)),
  })

  const rejectMutation = useMutation({
    mutationFn: () => prApi.reject(id!, alasanTolak),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pr', id] }); setShowRejectModal(false) },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const convertMutation = useMutation({
    mutationFn: () => prApi.convert(id!),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['pr', id] })
      navigate(`/pengadaan/${res.data.data.id}`)
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: () => prApi.delete(id!),
    onSuccess: () => navigate('/permintaan-pembelian'),
  })

  if (isLoading) return <p className="text-gray-500">Memuat...</p>
  const pr = data?.data.data
  if (!pr) return <p className="text-red-500">Data tidak ditemukan</p>

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/permintaan-pembelian" className="text-bgn-800 hover:underline text-sm">← Permintaan Pembelian</Link>
        <span className="text-gray-400">/</span>
        <h1 className="text-2xl font-bold text-bgn-900">{pr.nomorPr}</h1>
        <StatusBadge status={pr.status} />
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}

      {/* Info */}
      <div className="bg-white rounded-xl shadow-md border border-bgn-100 p-5 mb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">Tanggal:</span> <span className="font-medium">{pr.tanggal}</span></div>
          <div><span className="text-gray-500">Status:</span> <StatusBadge status={pr.status} /></div>
          {pr.catatan && <div className="col-span-2"><span className="text-gray-500">Catatan:</span> <span>{pr.catatan}</span></div>}
        </div>
      </div>

      {/* Alert status khusus */}
      {pr.status === 'REJECTED' && pr.alasanTolak && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4">
          <p className="font-semibold text-sm mb-1">Alasan Penolakan:</p>
          <p className="text-sm">{pr.alasanTolak}</p>
        </div>
      )}
      {pr.status === 'CONVERTED' && pr.convertedPoId && (
        <div className="bg-bgn-50 border border-bgn-200 rounded-lg p-4 mb-4 text-sm">
          PR ini sudah dikonversi ke PO.{' '}
          <Link to={`/pengadaan/${pr.convertedPoId}`} className="text-bgn-800 font-semibold hover:underline">
            Lihat Purchase Order →
          </Link>
        </div>
      )}

      {/* Items */}
      <div className="bg-white rounded-xl shadow-md border border-bgn-100 overflow-hidden mb-4">
        <div className="px-5 py-4 border-b border-bgn-100">
          <h2 className="font-semibold text-bgn-900">Item Bahan Baku</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-bgn-200">
            <tr>
              <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Bahan Baku</th>
              <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Jumlah</th>
              <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Keterangan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-bgn-100">
            {pr.items.map((item) => (
              <tr key={item.id} className="odd:bg-white even:bg-bgn-50">
                <td className="px-4 py-3 text-gray-800">{item.bahanBaku?.nama ?? item.bahanBakuId}</td>
                <td className="px-4 py-3 text-gray-600">{item.jumlah} {item.bahanBaku?.satuan ?? ''}</td>
                <td className="px-4 py-3 text-gray-500">{item.keterangan ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {pr.status === 'DRAFT' && (
          <>
            <button onClick={() => approveMutation.mutate()} disabled={approveMutation.isPending}
              className="bg-bgn-green-400 text-white px-5 py-2 rounded-lg hover:bg-bgn-green-500 disabled:opacity-50 text-sm">
              Approve
            </button>
            <button onClick={() => setShowRejectModal(true)}
              className="border border-red-500 text-red-500 px-5 py-2 rounded-lg hover:bg-red-50 text-sm">
              Tolak
            </button>
            <button onClick={() => { if (confirm('Hapus PR ini?')) deleteMutation.mutate() }}
              className="text-red-500 hover:underline text-sm ml-auto">
              Hapus
            </button>
          </>
        )}
        {pr.status === 'APPROVED' && (
          <button onClick={() => convertMutation.mutate()} disabled={convertMutation.isPending}
            className="bg-bgn-green-400 text-white px-6 py-2.5 rounded-lg hover:bg-bgn-green-500 disabled:opacity-50 font-semibold">
            {convertMutation.isPending ? 'Mengkonversi...' : '🔄 Convert ke Purchase Order'}
          </button>
        )}
      </div>

      {/* Modal Tolak */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-bold text-bgn-900 mb-3">Tolak Permintaan Pembelian</h3>
            <textarea value={alasanTolak} onChange={(e) => setAlasanTolak(e.target.value)}
              placeholder="Masukkan alasan penolakan (minimal 5 karakter)..." rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:ring-2 focus:ring-bgn-green-400 focus:outline-none" />
            <div className="flex gap-3">
              <button onClick={() => rejectMutation.mutate()} disabled={alasanTolak.length < 5 || rejectMutation.isPending}
                className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm">
                Konfirmasi Tolak
              </button>
              <button onClick={() => { setShowRejectModal(false); setAlasanTolak('') }}
                className="border border-gray-300 px-5 py-2 rounded-lg hover:bg-gray-50 text-sm">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
