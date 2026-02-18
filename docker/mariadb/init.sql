-- Sauroraa Agency Database Schema
-- MariaDB 11

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Users
CREATE TABLE IF NOT EXISTS `users` (
  `id` CHAR(36) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `role` ENUM('admin', 'manager', 'promoter') NOT NULL DEFAULT 'manager',
  `avatar_url` VARCHAR(500) NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `two_factor_secret` VARCHAR(255) NULL,
  `two_factor_enabled` BOOLEAN NOT NULL DEFAULT FALSE,
  `last_login_at` DATETIME NULL,
  `last_login_ip` VARCHAR(45) NULL,
  `refresh_token_hash` VARCHAR(255) NULL,
  `password_reset_token` VARCHAR(255) NULL,
  `password_reset_expires` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Genres
CREATE TABLE IF NOT EXISTS `genres` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_genres_name` (`name`),
  UNIQUE KEY `uk_genres_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Artists
CREATE TABLE IF NOT EXISTS `artists` (
  `id` CHAR(36) NOT NULL,
  `slug` VARCHAR(150) NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `real_name` VARCHAR(200) NULL,
  `bio_short` VARCHAR(500) NULL,
  `bio_full` TEXT NULL,
  `country` VARCHAR(3) NOT NULL DEFAULT 'BEL',
  `city` VARCHAR(100) NULL,
  `availability` ENUM('available', 'limited', 'unavailable') NOT NULL DEFAULT 'available',
  `popularity_score` INT NOT NULL DEFAULT 0,
  `is_confidential` BOOLEAN NOT NULL DEFAULT FALSE,
  `is_curated` BOOLEAN NOT NULL DEFAULT FALSE,
  `profile_image_url` VARCHAR(500) NULL,
  `cover_image_url` VARCHAR(500) NULL,
  `spotify_url` VARCHAR(500) NULL,
  `soundcloud_url` VARCHAR(500) NULL,
  `instagram_url` VARCHAR(500) NULL,
  `facebook_url` VARCHAR(500) NULL,
  `website_url` VARCHAR(500) NULL,
  `monthly_listeners` INT NULL,
  `base_fee_min` DECIMAL(10,2) NULL,
  `base_fee_max` DECIMAL(10,2) NULL,
  `manager_id` CHAR(36) NULL,
  `meta_title` VARCHAR(200) NULL,
  `meta_description` VARCHAR(500) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_artists_slug` (`slug`),
  KEY `idx_artists_country` (`country`),
  KEY `idx_artists_availability` (`availability`),
  KEY `idx_artists_popularity` (`popularity_score`),
  KEY `idx_artists_manager` (`manager_id`),
  CONSTRAINT `fk_artists_manager` FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Artist Genres (join table)
CREATE TABLE IF NOT EXISTS `artist_genres` (
  `artist_id` CHAR(36) NOT NULL,
  `genre_id` INT NOT NULL,
  PRIMARY KEY (`artist_id`, `genre_id`),
  CONSTRAINT `fk_ag_artist` FOREIGN KEY (`artist_id`) REFERENCES `artists` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ag_genre` FOREIGN KEY (`genre_id`) REFERENCES `genres` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Artist Media
CREATE TABLE IF NOT EXISTS `artist_media` (
  `id` CHAR(36) NOT NULL,
  `artist_id` CHAR(36) NOT NULL,
  `type` ENUM('image', 'video', 'audio') NOT NULL,
  `url` VARCHAR(500) NOT NULL,
  `thumbnail_url` VARCHAR(500) NULL,
  `title` VARCHAR(200) NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_media_artist` (`artist_id`),
  CONSTRAINT `fk_media_artist` FOREIGN KEY (`artist_id`) REFERENCES `artists` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Presskits
CREATE TABLE IF NOT EXISTS `presskits` (
  `id` CHAR(36) NOT NULL,
  `artist_id` CHAR(36) NOT NULL,
  `created_by` CHAR(36) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `template` VARCHAR(50) NOT NULL DEFAULT 'default',
  `sections` JSON NOT NULL,
  `is_event_ready` BOOLEAN NOT NULL DEFAULT FALSE,
  `event_name` VARCHAR(200) NULL,
  `event_date` DATE NULL,
  `event_venue` VARCHAR(200) NULL,
  `event_city` VARCHAR(100) NULL,
  `event_promoter` VARCHAR(200) NULL,
  `status` ENUM('draft', 'active', 'expired', 'revoked') NOT NULL DEFAULT 'draft',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_presskits_artist` (`artist_id`),
  KEY `idx_presskits_status` (`status`),
  CONSTRAINT `fk_presskits_artist` FOREIGN KEY (`artist_id`) REFERENCES `artists` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_presskits_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Presskit Links
CREATE TABLE IF NOT EXISTS `presskit_links` (
  `id` CHAR(36) NOT NULL,
  `presskit_id` CHAR(36) NOT NULL,
  `token` VARCHAR(2000) NOT NULL,
  `recipient_email` VARCHAR(255) NULL,
  `recipient_name` VARCHAR(200) NULL,
  `expires_at` DATETIME NULL,
  `max_views` INT NULL,
  `current_views` INT NOT NULL DEFAULT 0,
  `allow_download` BOOLEAN NOT NULL DEFAULT TRUE,
  `watermark_text` VARCHAR(200) NULL,
  `is_revoked` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pl_presskit` (`presskit_id`),
  CONSTRAINT `fk_pl_presskit` FOREIGN KEY (`presskit_id`) REFERENCES `presskits` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Presskit Access Logs
CREATE TABLE IF NOT EXISTS `presskit_access_logs` (
  `id` CHAR(36) NOT NULL,
  `presskit_link_id` CHAR(36) NOT NULL,
  `ip_address` VARCHAR(45) NOT NULL,
  `user_agent` TEXT NULL,
  `action` ENUM('view', 'download', 'section_view') NOT NULL,
  `section_id` VARCHAR(100) NULL,
  `duration_seconds` INT NULL,
  `country` VARCHAR(3) NULL,
  `city` VARCHAR(100) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pal_link` (`presskit_link_id`),
  KEY `idx_pal_created` (`created_at`),
  CONSTRAINT `fk_pal_link` FOREIGN KEY (`presskit_link_id`) REFERENCES `presskit_links` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bookings
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` CHAR(36) NOT NULL,
  `reference_code` VARCHAR(20) NOT NULL,
  `artist_id` CHAR(36) NOT NULL,
  `status` ENUM('new', 'reviewing', 'scored', 'quoted', 'negotiating', 'confirmed', 'declined', 'cancelled') NOT NULL DEFAULT 'new',
  `score` INT NULL,
  `score_breakdown` JSON NULL,
  `requester_name` VARCHAR(200) NOT NULL,
  `requester_email` VARCHAR(255) NOT NULL,
  `requester_phone` VARCHAR(50) NULL,
  `requester_company` VARCHAR(200) NULL,
  `event_name` VARCHAR(200) NOT NULL,
  `event_date` DATE NOT NULL,
  `event_date_flexible` BOOLEAN NOT NULL DEFAULT FALSE,
  `event_venue` VARCHAR(200) NULL,
  `event_city` VARCHAR(100) NOT NULL,
  `event_country` VARCHAR(3) NOT NULL,
  `event_type` ENUM('festival', 'club', 'private', 'corporate', 'other') NOT NULL,
  `expected_attendance` INT NULL,
  `budget_min` DECIMAL(10,2) NULL,
  `budget_max` DECIMAL(10,2) NULL,
  `budget_currency` VARCHAR(3) NOT NULL DEFAULT 'EUR',
  `message` TEXT NULL,
  `technical_requirements` TEXT NULL,
  `accommodation_needed` BOOLEAN NOT NULL DEFAULT FALSE,
  `travel_needed` BOOLEAN NOT NULL DEFAULT FALSE,
  `quoted_amount` DECIMAL(10,2) NULL,
  `quote_pdf_url` VARCHAR(500) NULL,
  `quote_sent_at` DATETIME NULL,
  `digital_signature` TEXT NULL,
  `signed_at` DATETIME NULL,
  `assigned_to` CHAR(36) NULL,
  `source_ip` VARCHAR(45) NULL,
  `source_country` VARCHAR(3) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_bookings_ref` (`reference_code`),
  KEY `idx_bookings_artist` (`artist_id`),
  KEY `idx_bookings_status` (`status`),
  KEY `idx_bookings_date` (`event_date`),
  KEY `idx_bookings_assigned` (`assigned_to`),
  CONSTRAINT `fk_bookings_artist` FOREIGN KEY (`artist_id`) REFERENCES `artists` (`id`),
  CONSTRAINT `fk_bookings_assigned` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Booking Status History
CREATE TABLE IF NOT EXISTS `booking_status_history` (
  `id` CHAR(36) NOT NULL,
  `booking_id` CHAR(36) NOT NULL,
  `from_status` VARCHAR(50) NULL,
  `to_status` VARCHAR(50) NOT NULL,
  `changed_by` CHAR(36) NULL,
  `note` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_bsh_booking` (`booking_id`),
  CONSTRAINT `fk_bsh_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bsh_user` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Booking Comments
CREATE TABLE IF NOT EXISTS `booking_comments` (
  `id` CHAR(36) NOT NULL,
  `booking_id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `content` TEXT NOT NULL,
  `is_internal` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_bc_booking` (`booking_id`),
  CONSTRAINT `fk_bc_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bc_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Invitations
CREATE TABLE IF NOT EXISTS `invitations` (
  `id` CHAR(36) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'manager', 'promoter') NOT NULL DEFAULT 'manager',
  `token` VARCHAR(255) NOT NULL,
  `invited_by` CHAR(36) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `accepted_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_invitations_token` (`token`),
  KEY `idx_invitations_email` (`email`),
  CONSTRAINT `fk_invitations_user` FOREIGN KEY (`invited_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Files
CREATE TABLE IF NOT EXISTS `files` (
  `id` CHAR(36) NOT NULL,
  `original_name` VARCHAR(500) NOT NULL,
  `mime_type` VARCHAR(100) NOT NULL,
  `size_bytes` BIGINT NOT NULL,
  `bucket` VARCHAR(100) NOT NULL,
  `object_key` VARCHAR(500) NOT NULL,
  `uploaded_by` CHAR(36) NULL,
  `entity_type` VARCHAR(50) NULL,
  `entity_id` CHAR(36) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_files_entity` (`entity_type`, `entity_id`),
  CONSTRAINT `fk_files_user` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Analytics Events
CREATE TABLE IF NOT EXISTS `analytics_events` (
  `id` CHAR(36) NOT NULL,
  `event_type` VARCHAR(100) NOT NULL,
  `entity_type` VARCHAR(50) NULL,
  `entity_id` CHAR(36) NULL,
  `user_id` CHAR(36) NULL,
  `session_id` VARCHAR(100) NULL,
  `ip_address` VARCHAR(45) NULL,
  `country` VARCHAR(3) NULL,
  `city` VARCHAR(100) NULL,
  `user_agent` TEXT NULL,
  `referrer` VARCHAR(500) NULL,
  `metadata` JSON NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ae_type` (`event_type`),
  KEY `idx_ae_entity` (`entity_type`, `entity_id`),
  KEY `idx_ae_created` (`created_at`),
  KEY `idx_ae_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit Logs
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NULL,
  `action` VARCHAR(100) NOT NULL,
  `entity_type` VARCHAR(50) NOT NULL,
  `entity_id` CHAR(36) NULL,
  `old_values` JSON NULL,
  `new_values` JSON NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_al_action` (`action`),
  KEY `idx_al_entity` (`entity_type`, `entity_id`),
  KEY `idx_al_user` (`user_id`),
  KEY `idx_al_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed: Genres
INSERT INTO `genres` (`name`, `slug`) VALUES
  ('Techno', 'techno'),
  ('House', 'house'),
  ('Minimal', 'minimal'),
  ('Deep House', 'deep-house'),
  ('Tech House', 'tech-house'),
  ('Melodic Techno', 'melodic-techno'),
  ('Hard Techno', 'hard-techno'),
  ('Afro House', 'afro-house'),
  ('Progressive House', 'progressive-house'),
  ('Drum & Bass', 'drum-and-bass'),
  ('Trance', 'trance'),
  ('Ambient', 'ambient'),
  ('Electronica', 'electronica'),
  ('Indie Dance', 'indie-dance'),
  ('Disco', 'disco');
