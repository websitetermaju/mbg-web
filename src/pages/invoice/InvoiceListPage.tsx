import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { invoiceApi } from '@/api/endpoints/invoice'
import { StatusBadge } from '@/components/StatusBadge'
import { Pagination } from '@/components/Pagination'

const formatRp = (n: number) => `Rp ${Number(n).toLocaleString('id-ID')}`

export function InvoiceListPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [showOverdue, setShowOverdue] = useState(false)

  const { data: invoiceData, isLoading } = useQuery({
    queryKey: ['invoice', page, status, showOverdue],
    queryFn: () => showOverdue
      ? invoiceApi.overdue()
      : invoiceApi.list({ page, limit: 20, ...(status ? { status } : {}) }),
  })

  const items = invoiceData?.data.data ?? []
  const meta = invoiceData?.data.meta

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-bgn-900">Invoice</h1>
      </div>

      <div className="flex gap-3 mb-4">
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); setShowOverdue(false) }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none">
          <option value="">Semua Status</option>
          <option value="UNPAID">Belum Dibayar</option>
          <option value="PARTIALLY_PAID">Sebagian Dibayar</option>
          <option value="PAID">Lunas</option>
          <option value="OVERDUE">Jatuh Tempo</option>
        </select>
        <button onClick={() => { setShowOverdue(!showOverdue); setStatus(''); setPage(1) }}
          className={`px-4 py-2 rounded-lg text-sm border transition-colors ${showOverdue ? 'bg-red-100 border-red-400 text-red-700' : 'border-gray-300 hover:bg-gray-50'}`}>
          ⚠ Jatuh Tempo
        </button>
      </div>

      {isLoading ? <p className="text-gray-500">Memuat...</p> : (
        <div className="bg-white rounded-xl shadow-md border border-bgn-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bgn-200">
              <tr>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Nomor Invoice</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">PO</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Total Tagihan</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Dibayar</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Jatuh Tempo</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bgn-100">
              {items.map((inv) => (
                <tr key={inv.id} className="odd:bg-white even:bg-bgn-50 hover:bg-bgn-100 transition-colors cursor-pointer">
                  <td className="px-4 py-3">
                    <Link to={`/invoice/${inv.id}`} className="font-medium text-bgn-800 hover:underline">{inv.nomorInvoice}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{inv.pengadaan?.nomorPo ?? '-'}</td>
                  <td className="px-4 py-3 text-gray-800">{formatRp(inv.totalTagihan)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatRp(inv.totalDibayar)}</td>
                  <td className={`px-4 py-3 text-xs ${inv.status === 'OVERDUE' ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                    {inv.tanggalJatuhTempo}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Belum ada invoice</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {!showOverdue && <Pagination page={page} totalPages={meta?.totalPages ?? 1} onPageChange={setPage} />}
    </div>
  )
}
