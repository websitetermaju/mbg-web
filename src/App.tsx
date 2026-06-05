import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from '@/pages/LoginPage'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Layout } from '@/components/Layout'
import { DashboardPage } from '@/pages/DashboardPage'
import { MenuListPage } from '@/pages/menu/MenuListPage'
import { MenuFormPage } from '@/pages/menu/MenuFormPage'
import { BahanBakuListPage } from '@/pages/bahan-baku/BahanBakuListPage'
import { BahanBakuFormPage } from '@/pages/bahan-baku/BahanBakuFormPage'
import { PengadaanListPage } from '@/pages/pengadaan/PengadaanListPage'
import { PengadaanFormPage } from '@/pages/pengadaan/PengadaanFormPage'
import { PengadaanDetailPage } from '@/pages/pengadaan/PengadaanDetailPage'
import { BahanBakuDetailPage } from '@/pages/bahan-baku/BahanBakuDetailPage'
import { ProduksiListPage } from '@/pages/produksi/ProduksiListPage'
import { ProduksiFormPage } from '@/pages/produksi/ProduksiFormPage'
import { ProduksiDetailPage } from '@/pages/produksi/ProduksiDetailPage'
import { DistribusiListPage } from '@/pages/distribusi/DistribusiListPage'
import { DistribusiFormPage } from '@/pages/distribusi/DistribusiFormPage'
import { KeuanganListPage } from '@/pages/keuangan/KeuanganListPage'
import { KeuanganFormPage } from '@/pages/keuangan/KeuanganFormPage'
import { LaporanListPage } from '@/pages/laporan/LaporanListPage'
import { LaporanFormPage } from '@/pages/laporan/LaporanFormPage'
import { NotifikasiPage } from '@/pages/notifikasi/NotifikasiPage'
import { PRListPage } from '@/pages/permintaan-pembelian/PRListPage'
import { PRFormPage } from '@/pages/permintaan-pembelian/PRFormPage'
import { PRDetailPage } from '@/pages/permintaan-pembelian/PRDetailPage'
import { InvoiceListPage } from '@/pages/invoice/InvoiceListPage'
import { InvoiceDetailPage } from '@/pages/invoice/InvoiceDetailPage'
import { SupplierListPage } from '@/pages/supplier/SupplierListPage'
import { SupplierFormPage } from '@/pages/supplier/SupplierFormPage'
import { ResepListPage } from '@/pages/resep/ResepListPage'
import { ResepFormPage } from '@/pages/resep/ResepFormPage'
import { ResepDetailPage } from '@/pages/resep/ResepDetailPage'
import { LokasiGudangPage } from '@/pages/lokasi-gudang/LokasiGudangPage'
import { StockOpnamePage } from '@/pages/stock-opname/StockOpnamePage'
import { StockOpnameDetailPage } from '@/pages/stock-opname/StockOpnameDetailPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="menu" element={<MenuListPage />} />
          <Route path="menu/baru" element={<MenuFormPage />} />
          <Route path="menu/:id/edit" element={<MenuFormPage />} />
          <Route path="bahan-baku" element={<BahanBakuListPage />} />
          <Route path="bahan-baku/baru" element={<BahanBakuFormPage />} />
          <Route path="bahan-baku/:id/edit" element={<BahanBakuFormPage />} />
          <Route path="bahan-baku/:id" element={<BahanBakuDetailPage />} />
          <Route path="pengadaan" element={<PengadaanListPage />} />
          <Route path="pengadaan/baru" element={<PengadaanFormPage />} />
          <Route path="pengadaan/:id" element={<PengadaanDetailPage />} />
          <Route path="permintaan-pembelian" element={<PRListPage />} />
          <Route path="permintaan-pembelian/baru" element={<PRFormPage />} />
          <Route path="permintaan-pembelian/:id" element={<PRDetailPage />} />
          <Route path="invoice" element={<InvoiceListPage />} />
          <Route path="invoice/:id" element={<InvoiceDetailPage />} />
          <Route path="supplier" element={<SupplierListPage />} />
          <Route path="supplier/baru" element={<SupplierFormPage />} />
          <Route path="supplier/:id/edit" element={<SupplierFormPage />} />
          <Route path="resep" element={<ResepListPage />} />
          <Route path="resep/baru" element={<ResepFormPage />} />
          <Route path="resep/:id" element={<ResepDetailPage />} />
          <Route path="lokasi-gudang" element={<LokasiGudangPage />} />
          <Route path="stock-opname" element={<StockOpnamePage />} />
          <Route path="stock-opname/:id" element={<StockOpnameDetailPage />} />
          <Route path="produksi" element={<ProduksiListPage />} />
          <Route path="produksi/baru" element={<ProduksiFormPage />} />
          <Route path="produksi/:id" element={<ProduksiDetailPage />} />
          <Route path="distribusi" element={<DistribusiListPage />} />
          <Route path="distribusi/baru" element={<DistribusiFormPage />} />
          <Route path="distribusi/:id" element={<DistribusiListPage />} />
          <Route path="keuangan" element={<KeuanganListPage />} />
          <Route path="keuangan/baru" element={<KeuanganFormPage />} />
          <Route path="laporan" element={<LaporanListPage />} />
          <Route path="laporan/baru" element={<LaporanFormPage />} />
          <Route path="notifikasi" element={<NotifikasiPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}
