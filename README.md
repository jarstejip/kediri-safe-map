# 🗺️ Kediri Safe Map - Peta Aman & Tanggap Darurat Kota Kediri

Sistem Informasi Geografis (GIS) dan Peta Tanggap Darurat Pintar untuk Kota Kediri berbasis web, terintegrasi dengan Live API Pemerintah (BMKG & BPBD), Layanan Siaga 112, Pelaporan Kejadian Warga Real-time, dan Autentikasi Biometrik Face Recognition Anti-Fraud.

---

## ✨ Fitur Utama

1. **Peta Interaktif Fasilitas Darurat & Kesehatan**:
   - Peta berbasis Leaflet & Mapbox Enterprise dengan navigasi rute turn-by-turn.
   - Database lokasi IGD/RSUD, Apotek 24 Jam, Kantor Polisi, Damkar, Posko BPBD, dan Fasilitas Umum Kota Kediri.
   - Deteksi GPS Presisi Tinggi realtime dengan arah mata angin & kompas.

2. **Integrasi Notifikasi Darurat Resmi Pemerintah**:
   - **BMKG Real-time Auto Gempa**: Terhubung langsung ke satelit BMKG pusat dengan data magnitudo, kedalaman, dan peta guncangan (shakemap).
   - **Peringatan Cuaca Ekstrem Kediri**: Data cuaca langsung BMKG Jawa Timur (hujan lebat, angin kencang, banjir Sungai Brantas).
   - **Koneksi API BPBD Kota Kediri & BNPB**: Konfigurasi API Key & custom endpoint siaga bencana.

3. **Layanan Siaga 112 & Tombol SOS**:
   - Tombol Panggilan Cepat Darurat ke 112, Polres, dan Damkar.
   - Fitur kirim titik koordinat GPS darurat instan via WhatsApp ke kontak siaga / keluarga.

4. **Sistem Pengaduan Warga & Tracking Status (4-Stage Stepper)**:
   - Pelaporan jalan rusak, banjir, pohon tumbang, lampu mati, dll.
   - Pelacakan transparan: `Diterima` ➔ `Diverifikasi` ➔ `Diproses` ➔ `Selesai`.
   - Terkoneksi ke MySQL Laragon (`reports` & `report_status_history`).

5. **Face Recognition & Biometric Liveness Anti-Fraud**:
   - Pendaftaran akun wajib scan wajah biometrik langsung dari webcam/kamera smartphone.
   - Mencegah akun bot, pendaftar fiktif, atau laporan palsu.
   - Foto wajah otomatis menjadi identitas akun terverifikasi.

---

## 🛠️ Tech Stack & Database

- **Frontend**: HTML5, Vanilla CSS3 (Custom Design System, Glassmorphism, Responsive), Vanilla JavaScript ES6+.
- **Peta & GIS**: Leaflet.js, OpenStreetMap, Mapbox GL.
- **Backend**: PHP REST API (`api/db.php`, `api/alerts.php`, `api/reports.php`, `api/register.php`).
- **Database**: MySQL 8.x / MariaDB (Laragon / DBeaver) -> `database/kediri_safe_map.sql`.

---

## 🚀 Panduan Menjalankan Proyek

### 1. Database Setup (Laragon / DBeaver)
1. Buka **Laragon**, pastikan service **MySQL** sudah berjalan (*Start All*).
2. Buka **DBeaver** atau terminal MySQL:
   - Host: `127.0.0.1` / `localhost`
   - Port: `3306`
   - User: `root`
   - Password: *(kosong)*
3. Import file database:
   ```bash
   mysql -u root < database/kediri_safe_map.sql
   ```

### 2. Konfigurasi Environment
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```

### 3. Menjalankan Server Lokal
Jalankan file batch:
```bash
start-server.bat
```
Atau via terminal:
```bash
python -m http.server 8080
```
Buka browser di: **`http://localhost:8080`**

---

## 📄 Lisensi
Hak Cipta &copy; 2026 Kediri Safe Map. Dikembangkan untuk keamanan dan ketangguhan warga Kota Kediri.
