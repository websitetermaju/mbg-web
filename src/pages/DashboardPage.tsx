import { useQuery } from '@tanstack/react-query'
import { bahanBakuApi } from '@/api/endpoints/bahan-baku'
import { keuanganApi } from '@/api/endpoints/keuangan'
import { useAuthStore } from '@/store/auth.store'
import { StatusBadge } from '@/components/StatusBadge'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  borderColor: string
  icon: string
  valueColor?: string
}

function StatCard({ label, value, sub, borderColor, icon, valueColor }: StatCardProps) {
  return (
    <div className={`relative bg-white rounded-xl p-5 shadow-md border border-bgn-100 overflow-hidden ${borderColor}`}>
      <span className="absolute top-3 right-4 text-2xl opacity-20 select-none">{icon}</span>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${valueColor ?? 'text-gray-800'}`}>{value}</p>
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
  const stokMenipisCount = stokMenipis?.data.meta?.total ?? 0
  const stokHabisCount = stokHabis?.data.meta?.total ?? 0

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-bgn-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Selamat datang, {user?.nama ?? user?.email}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Stok Menipis"
          value={stokMenipisCount}
          sub="bahan baku LOW_STOCK"
          borderColor="border-l-4 border-bgn-gold-400"
          icon="⚠️"
          valueColor={stokMenipisCount > 0 ? 'text-bgn-gold-600' : 'text-gray-800'}
        />
        <StatCard
          label="Stok Habis"
          value={stokHabisCount}
          sub="bahan baku OUT_OF_STOCK"
          borderColor="border-l-4 border-red-400"
          icon="🚫"
          valueColor={stokHabisCount > 0 ? 'text-red-600' : 'text-gray-800'}
        />
        {cost ? (
          <>
            <StatCard
              label="Cost Per Porsi"
              value={`Rp ${cost.costPerPorsi.toLocaleString('id-ID')}`}
              sub={`Pagu: Rp ${cost.pagu.toLocaleString('id-ID')}`}
              borderColor={cost.melebihiPagu ? 'border-l-4 border-red-400' : 'border-l-4 border-bgn-green-400'}
              icon="💰"
              valueColor={cost.melebihiPagu ? 'text-red-600' : 'text-bgn-green-600'}
            />
            <StatCard
              label="Total Porsi Bulan Ini"
              value={cost.totalPorsi.toLocaleString('id-ID')}
              sub="porsi diproduksi"
              borderColor="border-l-4 border-bgn-200"
              icon="🍱"
            />
          </>
        ) : (
          <>
            <StatCard label="Cost Per Porsi" value="Rp 0" sub="Pagu: Rp 15.000" borderColor="border-l-4 border-bgn-green-400" icon="💰" />
            <StatCard label="Total Porsi Bulan Ini" value={0} sub="porsi diproduksi" borderColor="border-l-4 border-bgn-200" icon="🍱" />
          </>
        )}
      </div>

      {stokMenipisCount > 0 && (
        <div className="bg-white rounded-xl shadow-md border border-bgn-100 p-5 mb-4">
          <h2 className="font-semibold text-bgn-900 mb-3">Bahan Baku Perlu Perhatian</h2>
          <div className="space-y-2">
            {stokMenipis?.data.data.map((b) => (
              <div key={b.id} className="flex items-center justify-between text-sm py-1 border-b border-bgn-50 last:border-0">
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
