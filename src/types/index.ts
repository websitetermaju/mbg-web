export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
  meta?: { page: number; limit: number; total: number; totalPages: number }
}

export type Role =
  | 'ADMIN_BGN'
  | 'KEPALA_SPPG'
  | 'AHLI_GIZI'
  | 'PETUGAS_DAPUR'
  | 'KURIR'
  | 'BENDAHARA'

export interface UserPayload {
  sub: string
  email: string
  role: Role
  sppgId: string | null
}

export interface AuthResult {
  accessToken: string
  refreshToken: string
  user: { id: string; nama: string; email: string; role: Role; sppgId: string | null }
}

export type StatusMenu = 'DRAFT' | 'APPROVED' | 'IN_PRODUCTION' | 'COMPLETED' | 'REJECTED'
export type JenisPenerima = 'BALITA' | 'SD' | 'SMP_SMA' | 'IBU_HAMIL' | 'LANSIA'

export interface MenuHarian {
  id: string
  namaMenu: string
  tanggal: string
  jenisPenerima: JenisPenerima
  jumlahPorsi: number
  kalori: number
  protein: number
  karbohidrat: number
  lemak: number
  status: StatusMenu
  sppgId: string
  createdAt: string
}

export type StatusStok = 'NORMAL' | 'LOW_STOCK' | 'OUT_OF_STOCK'
export type KategoriBahan = 'PROTEIN' | 'KARBOHIDRAT' | 'SAYURAN' | 'BUMBU' | 'MINYAK' | 'LAINNYA'

export interface BahanBaku {
  id: string
  nama: string
  satuan: string
  kategori: KategoriBahan
  stokAwal: number
  stokMasuk: number
  stokKeluar: number
  stokAkhir: number
  stokMinimum: number
  statusStok: StatusStok
  hargaSatuan: number
  sppgId: string
}

export type StatusPengadaan = 'DRAFT' | 'APPROVED' | 'ORDERED' | 'RECEIVED' | 'CANCELLED'

export interface PengadaanItem {
  id: string
  bahanBakuId: string
  jumlah: number
  hargaSatuan: number
  subtotal: number
  jumlahDiterima: number
}

export interface Pengadaan {
  id: string
  nomorPo: string
  tanggal: string
  supplier: string
  status: StatusPengadaan
  totalNilai: number
  catatan: string | null
  items: PengadaanItem[]
  sppgId: string
}

export type StatusProduksi = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export interface Produksi {
  id: string
  menuId: string
  tanggal: string
  status: StatusProduksi
  porsiDiproduksi: number
  porsiGagal: number
  waktuMulai: string | null
  waktuSelesai: string | null
  catatan: string | null
  needReview: boolean
  sppgId: string
}

export type StatusDistribusi = 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED'

export interface Distribusi {
  id: string
  produksiId: string
  tanggal: string
  jumlahPorsi: number
  status: StatusDistribusi
  fotoBukti: string | null
  alasanGagal: string | null
  isLate: boolean
  keterangan: string | null
  sppgId: string
}

export type JenisTransaksi = 'PEMASUKAN' | 'PENGELUARAN'

export interface Keuangan {
  id: string
  tanggal: string
  jenisTransaksi: JenisTransaksi
  kategori: string
  jumlah: number
  keterangan: string | null
  referensi: string | null
  sppgId: string
}

export type StatusLaporan = 'DRAFT' | 'REVIEWED' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED'
export type JenisLaporan = 'HARIAN' | 'MINGGUAN' | 'BULANAN'

export interface Laporan {
  id: string
  judul: string
  jenis: JenisLaporan
  periodeMulai: string
  periodeAkhir: string
  status: StatusLaporan
  ringkasan: Record<string, unknown>
  catatanReview: string | null
  submittedAt: string | null
  sppgId: string
}

export type PrioritasNotifikasi = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface Notifikasi {
  id: string
  tipe: string
  judul: string
  pesan: string
  prioritas: PrioritasNotifikasi
  isRead: boolean
  sppgId: string | null
  createdAt: string
}
