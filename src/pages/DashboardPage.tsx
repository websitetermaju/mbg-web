import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { menuApi } from '@/api/endpoints/menu'
import { pengadaanApi } from '@/api/endpoints/pengadaan'
import { produksiApi } from '@/api/endpoints/produksi'
import { distribusiApi } from '@/api/endpoints/distribusi'
import { keuanganApi } from '@/api/endpoints/keuangan'
import { laporanApi } from '@/api/endpoints/laporan'
import { sekolahApi } from '@/api/endpoints/sekolah'

// Tanggal hari ini dalam format YYYY-MM-DD memakai waktu lokal (bukan UTC)
function tanggalHariIni(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// Sebagian nilai dari API bisa berupa string (mis. pagu) → paksa ke Number dulu
const fRupiah = (n: number | string) => 'Rp ' + Number(n).toLocaleString('id-ID')
const fAngka = (n: number | string) => Number(n).toLocaleString('id-ID')

type StatusLangkah = 'done' | 'active' | 'todo'

interface Langkah {
  n: number
  judul: string
  to: string
  // apakah langkah ini sudah tuntas berdasarkan data hari ini
  selesai: boolean
  // deskripsi singkat saat done / saat belum
  descDone: string
  descTodo: string
}

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  icon: string
  valueColor?: string
  borderColor?: string
}

function StatCard({ label, value, sub, icon, valueColor, borderColor }: StatCardProps) {
  return (
    <div
      className={`relative bg-white rounded-xl p-5 shadow-sm border border-bgn-100 overflow-hidden ${
        borderColor ?? 'border-l-4 border-bgn-200'
      }`}
    >
      <span className="absolute top-3 right-4 text-2xl opacity-20 select-none">{icon}</span>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${valueColor ?? 'text-gray-800'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const hariIni = tanggalHariIni()
  const awalBulan = `${hariIni.slice(0, 7)}-01`

  // Hanya peran ber-SPPG yang punya data operasional; ADMIN_BGN tidak.
  const aktif = !!user && user.role !== 'ADMIN_BGN'

  const { data: menuRes } = useQuery({
    queryKey: ['beranda', 'menu', hariIni],
    queryFn: () => menuApi.list({ limit: 50 }),
    enabled: aktif,
  })
  const { data: pengadaanRes } = useQuery({
    queryKey: ['beranda', 'pengadaan'],
    queryFn: () => pengadaanApi.list({ limit: 50 }),
    enabled: aktif,
  })
  const { data: produksiRes } = useQuery({
    // Backend menolak query param `tanggal` (forbidNonWhitelisted) → filter di klien
    queryKey: ['beranda', 'produksi'],
    queryFn: () => produksiApi.list({ limit: 50 }),
    enabled: aktif,
  })
  const { data: distribusiRes } = useQuery({
    queryKey: ['beranda', 'distribusi', hariIni],
    queryFn: () => distribusiApi.list({ limit: 50 }),
    enabled: aktif,
  })
  const { data: laporanRes } = useQuery({
    queryKey: ['beranda', 'laporan'],
    queryFn: () => laporanApi.list({ jenis: 'HARIAN', limit: 20 }),
    enabled: aktif,
  })
  const { data: sekolahRes } = useQuery({
    queryKey: ['beranda', 'sekolah'],
    queryFn: () => sekolahApi.list({ status: 'AKTIF', limit: 1 }),
    enabled: aktif,
  })
  const { data: costRes } = useQuery({
    queryKey: ['beranda', 'cost', awalBulan, hariIni],
    queryFn: () => keuanganApi.costPerPorsi(awalBulan, hariIni),
    enabled: aktif,
  })

  // ---- turunkan data hari ini ----
  const menuHariIni = (menuRes?.data.data ?? []).filter((m) => m.tanggal?.slice(0, 10) === hariIni)
  const pengadaan = pengadaanRes?.data.data ?? []
  const produksiHariIni = (produksiRes?.data.data ?? []).filter(
    (p) => p.tanggal?.slice(0, 10) === hariIni,
  )
  const distribusiHariIni = (distribusiRes?.data.data ?? []).filter(
    (d) => d.tanggal?.slice(0, 10) === hariIni,
  )
  const laporanHariIni = (laporanRes?.data.data ?? []).filter(
    (l) => l.periodeMulai?.slice(0, 10) === hariIni,
  )
  const cost = costRes?.data.data

  // ---- aturan "selesai" tiap langkah (konservatif; perlu divalidasi ke data live) ----
  const menuSiap = menuHariIni.some((m) =>
    ['APPROVED', 'IN_PRODUCTION', 'COMPLETED'].includes(m.status),
  )
  const adaPoTerkirim = pengadaan.some((p) => ['ORDERED', 'RECEIVED'].includes(p.status))
  const adaBahanDiterima = pengadaan.some((p) => p.status === 'RECEIVED')
  const produksiSelesai =
    produksiHariIni.length > 0 && produksiHariIni.every((p) => p.status === 'COMPLETED')
  const distribusiSelesai =
    distribusiHariIni.length > 0 && distribusiHariIni.every((d) => d.status === 'DELIVERED')
  const biayaTercatat = (cost?.totalPorsi ?? 0) > 0
  const laporanTerkirim = laporanHariIni.some((l) =>
    ['SUBMITTED', 'ACCEPTED'].includes(l.status),
  )

  const langkahMentah: Langkah[] = [
    { n: 1, judul: 'Menu hari ini', to: '/menu', selesai: menuSiap, descDone: 'Menu & porsi sudah disusun dan disetujui', descTodo: 'Susun menu & porsi, lalu minta persetujuan ahli gizi' },
    { n: 2, judul: 'Pengadaan bahan', to: '/pengadaan', selesai: adaPoTerkirim, descDone: 'Pesanan pembelian sudah terkirim ke supplier', descTodo: 'Setujui permintaan beli dan pesan bahan ke supplier' },
    { n: 3, judul: 'Stok & bahan', to: '/bahan-baku', selesai: adaBahanDiterima, descDone: 'Bahan sudah diterima & disimpan', descTodo: 'Terima bahan dari supplier dan catat ke stok' },
    { n: 4, judul: 'Produksi (masak + QC)', to: '/produksi', selesai: produksiSelesai, descDone: 'Produksi selesai & cek mutu lengkap', descTodo: 'Mulai produksi, catat hasil masak dan cek mutu (QC)' },
    { n: 5, judul: 'Distribusi ke sekolah', to: '/distribusi', selesai: distribusiSelesai, descDone: 'Semua porsi terkirim ke sekolah', descTodo: 'Antar makanan ke sekolah dan unggah foto bukti' },
    { n: 6, judul: 'Catat biaya', to: '/keuangan', selesai: biayaTercatat, descDone: 'Biaya hari ini sudah tercatat', descTodo: 'Catat pengeluaran & pemasukan hari ini' },
    { n: 7, judul: 'Kirim laporan ke BGN', to: '/laporan', selesai: laporanTerkirim, descDone: 'Laporan harian sudah dikirim ke BGN', descTodo: 'Buat laporan harian dan kirim ke BGN' },
  ]

  // Alur berurutan: langkah aktif = langkah pertama yang belum selesai
  const idxAktif = langkahMentah.findIndex((l) => !l.selesai)
  const status = (i: number): StatusLangkah =>
    idxAktif === -1 ? 'done' : i < idxAktif ? 'done' : i === idxAktif ? 'active' : 'todo'
  const jumlahSelesai = idxAktif === -1 ? langkahMentah.length : idxAktif

  // ---- nilai stat ----
  const porsiHariIni = menuHariIni.reduce((a, m) => a + (m.jumlahPorsi ?? 0), 0)
  const sekolahDilayani = sekolahRes?.data.meta?.total ?? 0

  const badgeStyle: Record<StatusLangkah, string> = {
    done: 'bg-bgn-green-100 text-bgn-green-700',
    active: 'bg-bgn-700 text-white',
    todo: 'bg-gray-100 text-gray-400',
  }
  const badgeIcon: Record<StatusLangkah, string> = { done: '✓', active: '▶', todo: '○' }

  return (
    <div>
      {/* Sapaan */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-bgn-900">
          Selamat datang, {user?.nama ?? user?.email} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Ini yang perlu diselesaikan hari ini. Ikuti urutannya dari atas.
        </p>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Porsi hari ini" value={fAngka(porsiHariIni)} sub="dari menu yang disusun" icon="🍱" borderColor="border-l-4 border-bgn-400" />
        <StatCard label="Sekolah dilayani" value={fAngka(sekolahDilayani)} sub="penerima aktif" icon="🏫" borderColor="border-l-4 border-bgn-200" />
        <StatCard
          label="Biaya per porsi"
          value={cost ? fRupiah(cost.costPerPorsi) : 'Rp 0'}
          sub={cost ? `Pagu: ${fRupiah(cost.pagu)}` : 'Pagu: Rp 15.000'}
          icon="💰"
          borderColor={cost?.melebihiPagu ? 'border-l-4 border-red-400' : 'border-l-4 border-bgn-green-400'}
          valueColor={cost?.melebihiPagu ? 'text-red-600' : 'text-bgn-green-600'}
        />
        <StatCard
          label="Laporan BGN"
          value={laporanTerkirim ? 'Terkirim' : 'Belum'}
          sub="laporan harian"
          icon="📄"
          borderColor={laporanTerkirim ? 'border-l-4 border-bgn-green-400' : 'border-l-4 border-bgn-gold-400'}
          valueColor={laporanTerkirim ? 'text-bgn-green-600' : 'text-bgn-gold-600'}
        />
      </div>

      {/* Langkah hari ini */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-bgn-900">Langkah hari ini</h2>
        <span className="text-sm text-gray-500">{jumlahSelesai} dari 7 selesai</span>
      </div>

      <div className="bg-white rounded-xl border border-bgn-100 shadow-sm overflow-hidden">
        {langkahMentah.map((l, i) => {
          const st = status(i)
          return (
            <div
              key={l.n}
              className={`flex items-center gap-4 px-5 py-4 border-b border-bgn-50 last:border-b-0 ${
                st === 'active' ? 'bg-bgn-50' : ''
              }`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${badgeStyle[st]}`}>
                {badgeIcon[st]}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold ${st === 'todo' ? 'text-gray-500 font-medium' : 'text-bgn-900'}`}>
                  {l.n} · {l.judul}
                </p>
                <p className={`text-sm ${st === 'active' ? 'text-bgn-700' : 'text-gray-400'}`}>
                  {st === 'done' ? l.descDone : l.descTodo}
                </p>
              </div>
              {st === 'active' ? (
                <button
                  onClick={() => navigate(l.to)}
                  className="shrink-0 bg-bgn-700 hover:bg-bgn-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Lanjutkan →
                </button>
              ) : st === 'done' ? (
                <span className="shrink-0 text-xs font-semibold px-3 py-1 rounded-full bg-bgn-green-100 text-bgn-green-700">
                  Selesai
                </span>
              ) : (
                <span className="shrink-0 text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-400">
                  Belum
                </span>
              )}
            </div>
          )
        })}
      </div>

      {!aktif && (
        <p className="text-sm text-gray-400 mt-4">
          Anda masuk sebagai pengawas BGN — panduan langkah harian hanya tersedia untuk staf SPPG.
        </p>
      )}
    </div>
  )
}
