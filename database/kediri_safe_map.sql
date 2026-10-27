-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.4.3 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL / DBeaver / Laragon Database Dump
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- --------------------------------------------------------
-- 1. Database Creation
-- --------------------------------------------------------
DROP DATABASE IF EXISTS `kediri_safe_map`;
CREATE DATABASE IF NOT EXISTS `kediri_safe_map` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `kediri_safe_map`;

-- --------------------------------------------------------
-- 2. Table: users
-- --------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `foto_face` mediumtext DEFAULT NULL,
  `face_verified` tinyint(1) DEFAULT 0,
  `face_token` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `users` (`id`, `nama`, `email`, `password`, `role`, `foto_face`, `face_verified`, `face_token`, `created_at`) VALUES
	(1, 'Administrator', 'admin@kediri.go.id', '0192023a7bbd73250516f069df18b500', 'admin', NULL, 1, 'FACE-ADMIN-VERIFIED', '2026-10-23 13:12:28'),
	(2, 'Budi Warga', 'budi@gmail.com', '6ad14ba9986e3615423dfca256d04e3f', 'user', NULL, 1, 'FACE-BUDI-VERIFIED', '2026-10-23 13:12:28');

-- --------------------------------------------------------
-- 3. Table: emergency_services
-- --------------------------------------------------------
DROP TABLE IF EXISTS `emergency_services`;
CREATE TABLE IF NOT EXISTS `emergency_services` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama` varchar(150) NOT NULL,
  `kategori` varchar(100) DEFAULT NULL,
  `nomor` varchar(50) NOT NULL,
  `alamat` text,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `deskripsi` text,
  `status` varchar(50) DEFAULT 'Aktif',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `emergency_services` (`id`, `nama`, `kategori`, `nomor`, `alamat`, `latitude`, `longitude`, `deskripsi`, `status`) VALUES
	(1, 'Ambulans / Medis', 'Medis', '119', 'Kota Kediri', NULL, NULL, 'Layanan gawat darurat medis', 'Aktif'),
	(2, 'Pemadam Kebakaran', 'Kebakaran', '113', 'Kota Kediri', NULL, NULL, 'Layanan pemadam kebakaran', 'Aktif'),
	(3, 'Polisi', 'Keamanan', '110', 'Kota Kediri', NULL, NULL, 'Layanan keamanan dan ketertiban', 'Aktif');

-- --------------------------------------------------------
-- 4. Table: facility_categories
-- --------------------------------------------------------
DROP TABLE IF EXISTS `facility_categories`;
CREATE TABLE IF NOT EXISTS `facility_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama_kategori` varchar(100) NOT NULL,
  `deskripsi` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `facility_categories` (`id`, `nama_kategori`, `deskripsi`) VALUES
	(1, 'Toilet Umum', 'Fasilitas toilet umum'),
	(2, 'Tempat Ibadah', 'Masjid, Gereja, Pura, Vihara'),
	(3, 'Puskesmas/Rumah Sakit', 'Fasilitas kesehatan'),
	(4, 'Apotek', 'Toko obat-obatan'),
	(5, 'ATM', 'Anjungan Tunai Mandiri');

-- --------------------------------------------------------
-- 5. Table: facilities
-- --------------------------------------------------------
DROP TABLE IF EXISTS `facilities`;
CREATE TABLE IF NOT EXISTS `facilities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int DEFAULT NULL,
  `nama` varchar(150) NOT NULL,
  `alamat` text,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `deskripsi` text,
  `foto` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Aktif',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `facilities_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `facility_categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `facilities` (`id`, `category_id`, `nama`, `alamat`, `latitude`, `longitude`, `deskripsi`, `foto`, `status`, `created_at`) VALUES
	(1, 1, 'Toilet Umum Alun-Alun', 'Alun-Alun Kediri', -7.81650000, 112.01180000, 'Toilet bersih', NULL, 'Aktif', '2026-10-23 13:12:28'),
	(2, 2, 'Masjid Agung Kediri', 'Jl. Dhoho No.1', -7.81700000, 112.01200000, 'Masjid besar', NULL, 'Aktif', '2026-10-23 13:12:28'),
	(3, 3, 'RSUD Gambiran', 'Jl. Kapten Tendean', -7.82760000, 112.01840000, 'Rumah sakit umum', NULL, 'Aktif', '2026-10-23 13:12:28'),
	(4, 4, 'Apotek K-24', 'Jl. Brawijaya', -7.81500000, 112.01500000, 'Apotek 24 jam', NULL, 'Aktif', '2026-10-23 13:12:28'),
	(5, 5, 'ATM BCA Simpang Lima', 'Simpang Lima Gumul', -7.75000000, 112.08300000, 'ATM 24 jam', NULL, 'Aktif', '2026-10-23 13:12:28');

-- --------------------------------------------------------
-- 6. Table: report_categories
-- --------------------------------------------------------
DROP TABLE IF EXISTS `report_categories`;
CREATE TABLE IF NOT EXISTS `report_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama_kategori` varchar(100) NOT NULL,
  `deskripsi` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `report_categories` (`id`, `nama_kategori`, `deskripsi`) VALUES
	(1, 'Jalan Rusak', 'Jalan berlubang atau rusak'),
	(2, 'Banjir', 'Genangan air tinggi'),
	(3, 'Pohon Tumbang', 'Pohon yang menutupi jalan'),
	(4, 'Lampu Jalan Rusak', 'Penerangan jalan mati'),
	(5, 'Sampah', 'Penumpukan sampah');

-- --------------------------------------------------------
-- 7. Table: reports
-- --------------------------------------------------------
DROP TABLE IF EXISTS `reports`;
CREATE TABLE IF NOT EXISTS `reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `judul` varchar(150) NOT NULL,
  `deskripsi` text,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Diterima',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `reports_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `report_categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `reports` (`id`, `user_id`, `category_id`, `judul`, `deskripsi`, `latitude`, `longitude`, `foto`, `status`, `created_at`, `updated_at`) VALUES
	(1, 2, 1, 'Jalan Berlubang di Dhoho', 'Lubang cukup dalam, membahayakan motor', -7.81600000, 112.01100000, NULL, 'Diproses', '2026-10-23 13:12:28', '2026-10-23 13:12:28'),
	(2, 2, 4, 'Lampu Jalan Mati', 'Lampu mati sejak 3 hari lalu', -7.81800000, 112.01300000, NULL, 'Diverifikasi', '2026-10-23 13:12:28', '2026-10-23 13:12:28');

-- --------------------------------------------------------
-- 8. Table: report_status_history
-- --------------------------------------------------------
DROP TABLE IF EXISTS `report_status_history`;
CREATE TABLE IF NOT EXISTS `report_status_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `report_id` int DEFAULT NULL,
  `changed_by` int DEFAULT NULL,
  `status` varchar(50) NOT NULL,
  `keterangan` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `report_id` (`report_id`),
  KEY `changed_by` (`changed_by`),
  CONSTRAINT `report_status_history_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `reports` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `report_status_history_ibfk_2` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `report_status_history` (`id`, `report_id`, `changed_by`, `status`, `keterangan`, `created_at`) VALUES
	(1, 1, 1, 'Diterima', 'Laporan masuk ke sistem', '2026-10-23 13:12:28'),
	(2, 1, 1, 'Diverifikasi', 'Laporan divalidasi oleh admin', '2026-10-23 13:12:28'),
	(3, 1, 1, 'Diproses', 'Diteruskan ke Dinas Pekerjaan Umum', '2026-10-23 13:12:28'),
	(4, 2, 1, 'Diterima', 'Laporan masuk ke sistem', '2026-10-23 13:12:28'),
	(5, 2, 1, 'Diverifikasi', 'Laporan divalidasi oleh admin', '2026-10-23 13:12:28');

-- --------------------------------------------------------
-- 9. Table: government_alerts (Notifikasi Bahaya Resmi BMKG, BPBD, & Pemda)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `government_alerts`;
CREATE TABLE IF NOT EXISTS `government_alerts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `source` varchar(100) NOT NULL,
  `category` varchar(50) NOT NULL,
  `level` enum('info','waspada','siaga','awas') DEFAULT 'siaga',
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `external_id` varchar(100) DEFAULT NULL,
  `action_label` varchar(100) DEFAULT NULL,
  `action_url` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `government_alerts` (`id`, `source`, `category`, `level`, `title`, `description`, `location`, `latitude`, `longitude`, `external_id`, `action_label`) VALUES
	(1, 'BPBD Kota Kediri', 'banjir', 'siaga', 'Pantauan Debit Air Sungai Brantas', 'Posko Siaga BPBD Kota Kediri memantau debit Sungai Brantas waspada di Jembatan Brawijaya & Semampir.', 'Sungai Brantas Kota Kediri', -7.81650000, 112.01180000, 'BPBD-KDR-001', 'Lihat Posko BPBD'),
	(2, 'BMKG RI', 'cuaca', 'waspada', 'Peringatan Dini Cuaca Kota Kediri', 'BMKG mendeteksi potensi hujan intensitas sedang hingga lebat disertai petir di wilayah Mojoroto dan sekitarnya.', 'Mojoroto, Kota Kediri', -7.81865900, 112.00340200, 'BMKG-KDR-W01', 'Cek Radar BMKG'),
	(3, 'Dinas Kesehatan / RSUD', 'medis', 'info', 'Kapasitas IGD RSUD Gambiran Kediri', 'Ruang IGD dan 4 unit ambulans gawat darurat beroperasi penuh 24 jam siap melayani rujukan warga.', 'RSUD Gambiran', -7.82760000, 112.01840000, 'DINKES-KDR-002', 'Navigasi ke RSUD');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;

