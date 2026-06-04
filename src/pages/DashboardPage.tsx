import { useQuery } from '@tanstack/react-query'
import { bahanBakuApi } from '@/api/endpoints/bahan-baku'
import { keuanganApi } from '@/api/endpoints/keuangan'
import { useAuthStore } from '@/store/auth.store'
import { StatusBadge } from '@/components/StatusBadge'

function StatCard({ label, value, sub, warning }: { label: string; value: string | number; sub?: string; warning?: boolean }) {
  return (
    <div className={`bg-white rounded-xl p-5 shadow-sm border ${warning ? 'border-red-200' : 'border-gray-100'}`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${warning ? 'text-red-600' : 'text-gray-800'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  const today = new Date()
  const bulanIni = {
    mulai: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`,
    akhir: today.toISOString().slice(0, 10),
  }

  const { data: stokMenipis } = useQuery({
    queryKey: ['bahan-baku', 'low-stock'],
    queryFn: () => bahanBakuApi.list({ statusStok: 'LOW_STOCK', limit: 5 }),
    enabled: !!user,
  })

  const { data: stokHabis } = useQuery({
    queryKey: ['bahan-baku', 'out-of-stock'],
    queryFn: () => bahanBakuApi.list({ statusStok: 'OUT_OF_STOCK', limit: 5 }),
    enabled: !!user,
  })

  const { data: costData } = useQuery({
    queryKey: ['keuangan', 'cost-per-porsi', bulanIni],
    queryFn: () => keuanganApi.costPerPorsi(bulanIni.mulai, bulanIni.akhir),
    enabled: !!user && user.role !== 'ADMIN_BGN',
  })

  const cost = costData?.data.data

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Dashboard</h1>
      <p className="text-gray-500 mb-6">Selamat datang, {user?.nama ?? user?.email}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Stok Menipis"
          value={stokMenipis?.data.meta?.total ?? '-'}
          sub="bahan baku LOW_STOCK"
          warning={(stokMenipis?.data.meta?.total ?? 0) > 0}
        />
        <StatCard
          label="Stok Habis"
          value={stokHabis?.data.meta?.total ?? '-'}
          sub="bahan baku OUT_OF_STOCK"
          warning={(stokHabis?.data.meta?.total ?? 0) > 0}
        />
        {cost && (
          <>
            <StatCard
              label="Cost Per Porsi"
              value={`Rp ${cost.costPerPorsi.toLocaleString('id-ID')}`}
              sub={`Pagu: Rp ${cost.pagu.toLocaleString('id-ID')}`}
              warning={cost.melebihiPagu}
            />
            <StatCard
              label="Total Porsi Bulan Ini"
              value={cost.totalPorsi.toLocaleString('id-ID')}
              sub="porsi diproduksi"
            />
          </>
        )}
      </div>

      {(stokMenipis?.data.data.length ?? 0) > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4">
          <h2 className="font-semibold text-gray-700 mb-3">Bahan Baku Perlu Perhatian</h2>
          <div className="space-y-2">
            {stokMenipis?.data.data.map((b) => (
              <div key={b.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{b.nama}</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">{b.stokAkhir} {b.satuan}</span>
                  <StatusBadge status={b.statusStok} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
