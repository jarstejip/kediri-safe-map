# Kediri Safe Map - Android Application (Android Studio Project)

Proyek Android resmi untuk **Kediri Safe Map** (Satu Peta Satu Informasi Tanggap Darurat Kota Kediri).
Dibuat menggunakan WebView Native teroptimasi dengan dukungan penuh:
- 🗺️ **GPS Geolocation Presisi Real-time** (Leaflet Maps)
- 📸 **Akses Kamera & Upload Foto Kejadian** (Lapor Bencana)
- 🔄 **Swipe to Refresh (Tarik ke Bawah untuk Memuat Ulang)**
- 📞 **Integrasi Langsung Panggilan Darurat Siaga 112 & Polsek**
- 💬 **Integrasi WhatsApp SOS (`wa.me`)**
- 🛡️ **Offline Fallback Screen dengan tombol "Coba Lagi"**
- ↩️ **Navigasi Cerdas (Double Back to Exit)**

---

## 🚀 Panduan Membuka di Android Studio & Membuat APK

### Langkah 1: Buka Proyek di Android Studio
1. Buka aplikasi **Android Studio**.
2. Pilih menu **File** > **Open...**
3. Arahkan ke folder: `c:\kediri-safe-map\android-app`
4. Klik **OK** dan tunggu proses sinkronisasi Gradle selesai (Gradle Sync).

---

### Langkah 2: Build / Generate File APK
1. Di bilah menu atas Android Studio, klik **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
2. Tunggu proses kompilasi selesai (sekitar 1-2 menit).
3. Setelah selesai, notifikasi pop-up akan muncul di pojok kanan bawah:
   > *"APK(s) generated successfully."*
4. Klik link **"locate"** pada notifikasi tersebut. File APK Anda (`app-debug.apk`) sudah siap!
   *(Lokasi file: `android-app/app/build/outputs/apk/debug/app-debug.apk`)*.

---

### Langkah 3: Unggah ke Mediafire
1. Buka browser dan kunjungi **[mediafire.com](https://www.mediafire.com)**.
2. Login atau buat akun Mediafire gratis.
3. Klik tombol **Upload** (atau seret file `app-debug.apk` ke Mediafire).
4. Setelah proses upload selesai, klik tombol **Copy Link** (Tautan Unduhan).
   *(Contoh tautan: `https://www.mediafire.com/file/.../KediriSafeMap.apk/file`)*.

---

### Langkah 4: Pasang Link Download di Web Kediri Safe Map
Ganti link unduhan di file `index.html` (bagian kartu "Unduh Aplikasi Android") dengan tautan Mediafire Anda!

