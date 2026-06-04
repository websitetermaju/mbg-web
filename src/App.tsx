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
          <Route path="pengadaan" element={<PengadaanListPage />} />
          <Route path="pengadaan/baru" element={<PengadaanFormPage />} />
          <Route path="pengadaan/:id" element={<PengadaanDetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}
