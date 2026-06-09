# CLAUDE.md — Frontend SPPG (mbg-web)

## Tentang proyek
Ini adalah frontend untuk aplikasi SPPG (Satuan Pelayanan Pemenuhan Gizi)
pada program Makan Bergizi Gratis (MBG). Penggunanya staf dapur:
Kepala SPPG, Ahli Gizi, dan Akuntan — **bukan orang teknis**.
Maka UI harus sederhana, jelas, dan berbahasa Indonesia.

Tujuan utama aplikasi: memandu operasional harian (langkah 1–7) dan
menghasilkan laporan pertanggungjawaban ke BGN.

## Stack
- React + Vite + TypeScript
- Seluruh teks UI dalam Bahasa Indonesia, sentence case, kalimat pendek & jelas
- Untuk data fetching, pakai yang sederhana (mis. fetch atau React Query).
  Konfirmasi dulu sebelum menambah library besar.

## Backend (folder terpisah, jangan diakses dari sini)
- API NestJS berjalan terpisah di `http://localhost:3000`
- Daftar lengkap endpoint ada di `DAFTAR-MODUL.md`
- Auth: JWT. Alur: `POST /auth/login` → simpan accessToken →
  kirim header `Authorization: Bearer <token>` di setiap request.
  Gunakan `POST /auth/refresh` untuk memperpanjang sesi.
- Base URL diambil dari env `VITE_API_URL` (default `http://localhost:3000`).
  Jangan hardcode URL di banyak tempat.

## Acuan desain
- Tiru struktur & gaya dari file `sppg-app.html` (prototipe yang sudah disetujui).
- Sidebar dua kelompok:
  - **Operasional harian:** 1 Menu, 2 Pengadaan, 3 Stok, 4 Produksi,
    5 Distribusi, 6 Keuangan, 7 Laporan
  - **Setup:** Profil SPPG, Sekolah, Supplier, Gudang, Resep, Pengguna
- Halaman **Beranda** = pemandu langkah harian (checklist 1–7 beserta statusnya).
- Menu menyesuaikan peran yang login:
  - Kepala SPPG: semua menu
  - Ahli Gizi: Beranda, Menu, Resep, Produksi, Stok (lihat), Laporan
  - Akuntan: Beranda, Pengadaan, Stok, Keuangan, Laporan, Supplier

## Aturan kerja (PENTING — proyek setengah jadi, jangan sampai rusak)
- Kerjakan SATU layar/fitur per giliran. Jangan buat semua modul sekaligus.
- JANGAN menghapus atau menimpa file yang sudah ada tanpa bertanya dulu.
- Sebelum mengubah struktur folder atau konfigurasi yang sudah ada,
  jelaskan dulu dan minta persetujuan.
- Setelah tiap perubahan, jelaskan singkat apa yang diubah dan kenapa.
- Kalau ragu soal endpoint atau bentuk data, TANYA — jangan menebak.

## Urutan pengerjaan
1. Setup proyek + shell (sidebar, topbar, routing) + halaman login (`POST /auth/login`)
2. Beranda (checklist harian)
3. Layar harian satu per satu: Menu → Pengadaan → Stok → Produksi →
   Distribusi → Keuangan → Laporan
4. Layar setup (pola sama, tinggal ganti data)
