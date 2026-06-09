import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { lokasiGudangApi } from '@/api/endpoints/lokasi-gudang'
import { getErrorMessage } from '@/utils/error'
import { SuhuLokasiCard } from './SuhuLokasiCard'
import type { TipeLokasiGudang } from '@/types'

const TIPE_ICONS: Record<TipeLokasiGudang, string> = { KERING: '📦', DINGIN: '❄️', BEKU: '🧊' }

export function LokasiGudangPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [nama, setNama] = useState('')
  const [tipe, setTipe] = useState<TipeLokasiGudang>('KERING')
  const [keterangan, setKeterangan] = useState('')
  const [error, setError] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['lokasi-gudang'],
    queryFn: () => lokasiGudangApi.list(),
  })

  const saveMutation = useMutation({
    mutationFn: () => editId
      ? lokasiGudangApi.update(editId, { nama, tipe, keterangan: keterangan || undefined })
      : lokasiGudangApi.create({ nama, tipe, keterangan: keterangan || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lokasi-gudang'] })
      setShowForm(false); setEditId(null); setNama(''); setTipe('KERING'); setKeterangan('')
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: lokasiGudangApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lokasi-gudang'] }),
  })

  const openEdit = (item: { id: string; nama: string; tipe: TipeLokasiGudang; keterangan: string | null }) => {
    setEditId(item.id); setNama(item.nama); setTipe(item.tipe); setKeterangan(item.keterangan ?? '')
    setShowForm(true)
  }

  const items = data?.data.data ?? []
  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none"

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-bgn-900">Lokasi Gudang</h1>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setNama(''); setTipe('KERING'); setKeterangan('') }}
          className="bg-bgn-green-400 text-white px-4 py-2 rounded-lg text-sm hover:bg-bgn-green-500">
          + Tambah Lokasi
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}

      {/* Pemantauan suhu harian — hanya lokasi dingin/beku (rantai dingin) */}
      {items.some(i => i.tipe !== 'KERING') && (
        <div className="mb-6">
          <h2 className="font-semibold text-bgn-900 mb-1">Pemantauan suhu hari ini</h2>
          <p className="text-xs text-gray-500 mb-3">Catat suhu chiller & freezer tiap hari sebagai bukti rantai dingin.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {items.filter(i => i.tipe !== 'KERING').map(item => (
              <SuhuLokasiCard key={item.id} lokasi={{ id: item.id, nama: item.nama, tipe: item.tipe }} />
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl border border-bgn-200 p-5 shadow-md mb-4">
          <h3 className="font-semibold text-bgn-900 mb-3">{editId ? 'Edit Lokasi' : 'Tambah Lokasi Baru'}</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="col-span-2"><label className="block text-xs font-medium text-gray-700 mb-1">Nama Lokasi *</label>
              <input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Kulkas Sayuran" className={inputCls} /></div>
            <div><label className="block text-xs font-medium text-gray-700 mb-1">Tipe *</label>
              <select value={tipe} onChange={(e) => setTipe(e.target.value as TipeLokasiGudang)} className={inputCls}>
                <option value="KERING">📦 Kering</option>
                <option value="DINGIN">❄️ Dingin (Kulkas)</option>
                <option value="BEKU">🧊 Beku (Freezer)</option>
              </select></div>
            <div><label className="block text-xs font-medium text-gray-700 mb-1">Keterangan (opsional)</label>
              <input value={keterangan} onChange={(e) => setKeterangan(e.target.value)} placeholder="Suhu 4°C" className={inputCls} /></div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => saveMutation.mutate()} disabled={!nama || saveMutation.isPending}
              className="bg-bgn-green-400 text-white px-4 py-2 rounded-lg text-sm hover:bg-bgn-green-500 disabled:opacity-50">
              {saveMutation.isPending ? 'Menyimpan...' : editId ? 'Simpan' : 'Tambah'}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null) }} className="border border-gray-300 px-4 py-2 rounded-lg text-sm">Batal</button>
          </div>
        </div>
      )}

      {isLoading ? <p className="text-gray-500">Memuat...</p> : (
        <div className="bg-white rounded-xl shadow-md border border-bgn-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bgn-200">
              <tr>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Nama</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Tipe</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Keterangan</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bgn-100">
              {items.map(item => (
                <tr key={item.id} className="odd:bg-white even:bg-bgn-50">
                  <td className="px-4 py-3 font-medium text-bgn-900">{item.nama}</td>
                  <td className="px-4 py-3 text-gray-600">{TIPE_ICONS[item.tipe]} {item.tipe}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{item.keterangan ?? '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(item)} className="text-bgn-800 hover:underline text-xs">Edit</button>
                      <button onClick={() => { if (confirm('Hapus lokasi?')) deleteMutation.mutate(item.id) }}
                        className="text-red-500 hover:underline text-xs">Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Belum ada lokasi gudang</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
