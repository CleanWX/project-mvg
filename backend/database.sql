-- =============================================
-- Labbutibas Diena - Booking System Database
-- Run this in phpMyAdmin to set up the DB
-- =============================================

CREATE DATABASE IF NOT EXISTS labbutibas_diena
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE labbutibas_diena;

-- =============================================
-- Table: admins
-- =============================================
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Default admin: username=admin, password=admin123
INSERT INTO admins (username, password_hash)
VALUES ('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- =============================================
-- Table: blocked_dates
-- =============================================
CREATE TABLE IF NOT EXISTS blocked_dates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  blocked_date DATE NOT NULL UNIQUE,
  reason VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =============================================
-- Table: bookings
-- =============================================
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_date DATE NOT NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL,
  additional_info TEXT DEFAULT NULL,
  status ENUM('pending', 'approved', 'declined') NOT NULL DEFAULT 'pending',
  is_archived TINYINT(1) NOT NULL DEFAULT 0,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Indexes for performance
CREATE INDEX idx_bookings_date   ON bookings (booking_date);
CREATE INDEX idx_bookings_status ON bookings (status);
CREATE INDEX idx_bookings_archive ON bookings (is_archived);
