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
  permintaanPembelianId: string | null
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
  totalBiaya: number
  costPerPorsi: number
  qcSelesai: boolean
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

// ─── Permintaan Pembelian ──────────────────────────────────────────
export type StatusPR = 'DRAFT' | 'APPROVED' | 'CONVERTED' | 'REJECTED'

export interface PRItem {
  id: string
  bahanBakuId: string
  bahanBaku?: { nama: string; satuan: string }
  jumlah: number
  keterangan: string | null
}

export interface PermintaanPembelian {
  id: string
  sppgId: string
  nomorPr: string
  tanggal: string
  catatan: string | null
  status: StatusPR
  alasanTolak: string | null
  createdById: string | null
  approvedById: string | null
  convertedPoId: string | null
  items: PRItem[]
  createdAt: string
  updatedAt: string
}

// ─── Invoice ───────────────────────────────────────────────────────
export type StatusInvoice = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE'
export type MetodeBayar = 'TRANSFER' | 'TUNAI' | 'CEK'

export interface Pembayaran {
  id: string
  invoiceId: string
  sppgId: string
  jumlah: number
  tanggalBayar: string
  metodeBayar: MetodeBayar
  buktiUrl: string | null
  catatan: string | null
  createdById: string | null
  createdAt: string
}

export interface Invoice {
  id: string
  sppgId: string
  pengadaanId: string
  pengadaan?: { nomorPo: string }
  supplierId: string | null
  supplier?: { nama: string } | null
  nomorInvoice: string
  tanggalTerbit: string
  tanggalJatuhTempo: string
  totalTagihan: number
  totalDibayar: number
  status: StatusInvoice
  catatan: string | null
  pembayaran: Pembayaran[]
  createdAt: string
  updatedAt: string
}

// ─── Stok Batch ───────────────────────────────────────────────────
export interface StokBatch {
  id: string
  sppgId: string
  bahanBakuId: string
  bahanBaku?: { nama: string; satuan: string }
  pengadaanId: string | null
  lokasiId: string | null
  lokasi?: { nama: string; tipe: string } | null
  jumlahMasuk: number
  jumlahTersisa: number
  tanggalMasuk: string
  tanggalKadaluarsa: string | null
  hargaSatuan: number
  catatan: string | null
  createdAt: string
}

// ─── Biaya Produksi ───────────────────────────────────────────────
export type KategoriBiaya = 'BAHAN_BAKU' | 'UPAH' | 'UTILITAS' | 'LAINNYA'

export interface BiayaProduksiItem {
  id: string
  produksiId: string
  sppgId: string
  kategori: KategoriBiaya
  deskripsi: string
  jumlah: number
  createdAt: string
}

export interface BiayaSummary {
  items: BiayaProduksiItem[]
  totalBiaya: number
  costPerPorsi: number
}

// ─── QC ───────────────────────────────────────────────────────────
// Jenis pemeriksaan QC: CHECKLIST = centang lulus/tidak;
// SUHU = input angka terukur (CCP) dibandingkan ke batas aman.
export type QcTipe = 'CHECKLIST' | 'SUHU'

export interface QcTemplateItem {
  id: string
  sppgId: string
  namaCheck: string
  tipe: QcTipe
  satuan: string | null
  batasMin: number | null
  batasMax: number | null
  urutan: number
  isActive: boolean
}

export interface QcHasil {
  id: string
  produksiId: string
  templateItemId: string
  templateItem?: QcTemplateItem
  passed: boolean
  nilai: number | null
  catatan: string | null
  checkedById: string | null
  checkedAt: string | null
}

// ─── Bank Sampel (retain sample 24 jam) ──────────────────────────
export type StatusSampel = 'DISIMPAN' | 'DIBUANG' | 'DIUJI'

export interface BankSampel {
  id: string
  produksiId: string
  sppgId: string
  namaMakanan: string
  waktuSimpan: string
  waktuKedaluwarsa: string
  lokasiSimpan: string | null
  suhuSimpan: number | null
  status: StatusSampel
  petugasId: string | null
  catatan: string | null
  createdAt: string
  updatedAt: string
}

// ─── Log suhu penyimpanan (rantai dingin) ────────────────────────
export interface LogSuhuGudang {
  id: string
  lokasiGudangId: string
  sppgId: string
  waktu: string
  suhu: number
  aman: boolean
  petugasId: string | null
  catatan: string | null
  createdAt: string
  updatedAt: string
}

// ─── Higiene & kesehatan pekerja ─────────────────────────────────
export interface PemeriksaanHigiene {
  id: string
  sppgId: string
  tanggal: string
  namaPekerja: string
  sehat: boolean
  tanganBersih: boolean
  kukuPendek: boolean
  apdLengkap: boolean
  tanpaPerhiasan: boolean
  lolos: boolean
  diperiksaOlehId: string | null
  catatan: string | null
  createdAt: string
  updatedAt: string
}

// ─── Cek mutu penerimaan bahan baku ──────────────────────────────
export interface CekMutuPenerimaan {
  id: string
  pengadaanId: string
  sppgId: string
  waktu: string
  kondisiFisikBaik: boolean
  kesegaranBaik: boolean
  kemasanBaik: boolean
  kedaluwarsaOk: boolean
  suhuTerima: number | null
  lolos: boolean
  diperiksaOlehId: string | null
  catatan: string | null
  createdAt: string
  updatedAt: string
}

// ─── Supplier ─────────────────────────────────────────────────────
export type JenisUsaha = 'PT' | 'CV' | 'KOPERASI' | 'UMKM' | 'PERORANGAN'
export type KategoriSupplier = 'BAHAN_SEGAR' | 'BAHAN_KERING' | 'BUMBU_REMPAH' | 'KEMASAN' | 'LAINNYA'
export type TerminBayar = 'COD' | 'NET_7' | 'NET_14' | 'NET_30'

export interface Supplier {
  id: string
  sppgId: string
  nama: string
  jenisUsaha: JenisUsaha
  npwp: string | null
  namaPic: string
  telepon: string
  email: string | null
  alamat: string | null
  kota: string | null
  namaBank: string | null
  noRekening: string | null
  atasNama: string | null
  terminBayar: TerminBayar
  kategori: KategoriSupplier
  minOrder: number | null
  leadTime: number | null
  catatan: string | null
  isActive: boolean
  createdAt: string
}

// ─── Resep ────────────────────────────────────────────────────────
export interface ResepItem {
  id: string
  resepId: string
  bahanBakuId: string
  bahanBaku?: { nama: string; satuan: string }
  jumlahPerPorsi: number
  catatan: string | null
}

export interface Resep {
  id: string
  sppgId: string
  nama: string
  jenisPenerima: JenisPenerima
  deskripsi: string | null
  isActive: boolean
  items: ResepItem[]
  createdAt: string
}

export interface KebutuhanBahan {
  bahanBakuId: string
  nama: string
  satuan: string
  jumlahPerPorsi: number
  kebutuhan: number
  stokTersedia: number
  cukup: boolean
}

export interface PreviewKebutuhan {
  jumlahPorsi: number
  items: KebutuhanBahan[]
  semuaCukup: boolean
}

// ─── Lokasi Gudang ────────────────────────────────────────────────
export type TipeLokasiGudang = 'KERING' | 'DINGIN' | 'BEKU'

export interface LokasiGudang {
  id: string
  sppgId: string
  nama: string
  tipe: TipeLokasiGudang
  keterangan: string | null
  isActive: boolean
  createdAt: string
}

// ─── Stock Opname ──────────────────────────────────────────────────────
export type StatusOpname = 'DRAFT' | 'FINALIZED'

export interface StockOpnameItem {
  id: string
  opnameId: string
  bahanBakuId: string
  bahanBaku?: { nama: string; satuan: string }
  stokSistem: number
  jumlahFisik: number | null
  selisih?: number | null
  catatan: string | null
}

export interface StockOpname {
  id: string
  sppgId: string
  tanggal: string
  catatan: string | null
  status: StatusOpname
  finalizedAt: string | null
  items: StockOpnameItem[]
  createdAt: string
}

// ─── SOP ──────────────────────────────────────────────────────────
export type StatusSopStep = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'

export interface SopTemplateStep {
  id: string
  sppgId: string
  namaTahap: string
  deskripsi: string | null
  urutan: number
  estimasiMenit: number | null
  isActive: boolean
}

export interface SopProduksiStep {
  id: string
  produksiId: string
  templateStepId: string
  templateStep?: SopTemplateStep
  status: StatusSopStep
  waktuMulai: string | null
  waktuSelesai: string | null
  catatan: string | null
  checkedById: string | null
}

// ─── SPPG ──────────────────────────────────────────────────────────
export type SppgStatus = 'AKTIF' | 'NONAKTIF'

export interface Sppg {
  id: string
  kode: string
  nama: string
  alamat: string
  penanggungJawab: string
  noTelp: string | null
  wilayah: string
  provinsi: string
  status: SppgStatus
  slhsNomor: string | null
  slhsBerlakuSampai: string | null
  createdAt: string
  updatedAt: string
}

// ─── User ──────────────────────────────────────────────────────────
export interface UserData {
  id: string
  nama: string
  email: string
  role: Role
  sppgId: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ─── Penerima ──────────────────────────────────────────────────────
export type JenisKelamin = 'L' | 'P'
export type JenjangPendidikan = 'TK' | 'SD' | 'SMP' | 'SMA'
export type StatusPenerima = 'AKTIF' | 'NONAKTIF'

export interface Penerima {
  id: string
  nik: string
  nama: string
  tanggalLahir: string
  jenisKelamin: JenisKelamin
  alamat: string
  institusi: string
  jenjang: JenjangPendidikan
  kelas: string | null
  status: StatusPenerima
  sppgId: string
  createdAt: string
  updatedAt: string
}

// ─── Sekolah ───────────────────────────────────────────────────────
export type KategoriSekolah = 'TK_PAUD' | 'SD_MI' | 'SMP_MTS' | 'SMA_MA_SMK' | 'POSYANDU'
export type StatusSekolah = 'AKTIF' | 'NONAKTIF'

export interface Sekolah {
  id: string
  nama: string
  alamat: string
  kabupatenKota: string
  kategori: KategoriSekolah
  jumlahPenerima: number
  noTelp: string | null
  status: StatusSekolah
  sppgId: string
  createdAt: string
  updatedAt: string
}

export type JenisRabHari = 'HARIAN' | 'B3'

export interface RabPenerima {
  id: string
  kategori: string
  jumlahPorsi: number
  hargaPerPorsi: number
  subtotal: number
}

export interface RabBahan {
  id: string
  ctg: string | null
  item: string
  qty: number
  satuan: string
  hargaSatuan: number
  totalHs: number
  urutan: number
}

export interface RabHari {
  id: string
  namaHari: string
  jenis: JenisRabHari
  menu: string | null
  totalBahanBaku: number
  sisaAnggaran: number
  urutan: number
  penerima: RabPenerima[]
  bahan: RabBahan[]
}

export interface RabMingguan {
  id: string
  label: string
  totalAnggaran: number
  penggunaanAnggaran: number
  sisaAnggaran: number
  sumberFile: string
  importedAt: string
  hari?: RabHari[]
}
