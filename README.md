# RunTrack — Running Tracker

RunTrack adalah proyek web sederhana untuk pencatatan dan pemantauan aktivitas lari.

## Role Under Test
Runner/User

## Fitur
1. Login
2. Register
3. Forgot Password
4. Dashboard statistik
5. Record Run
6. Running History
7. Edit/Delete Run (CRUD)
8. Search & Filter

## Business Rules
- Password minimal 8 karakter.
- Email harus valid.
- Email tidak boleh didaftarkan dua kali.
- Jarak dan durasi harus lebih dari 0.
- Pace dihitung otomatis dari durasi ÷ jarak.
- User hanya dapat melihat dan mengubah aktivitas miliknya sendiri.
- Aktivitas dapat dihapus setelah konfirmasi.
- Search/filter hanya memengaruhi tampilan riwayat, bukan menghapus data.

## Cara Menjalankan
Buka `index.html` menggunakan browser modern. Tidak membutuhkan server/database karena versi demo ini menggunakan localStorage browser.

## Akun Demo
Belum ada akun bawaan. Register terlebih dahulu.
