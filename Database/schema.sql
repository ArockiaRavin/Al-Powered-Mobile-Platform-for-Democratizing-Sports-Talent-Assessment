-- =====================================================
-- Democratizing Sports Talent Assessment
-- Database Schema
-- =====================================================

CREATE DATABASE IF NOT EXISTS sports_talent_assessment;

USE sports_talent_assessment;

-- Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('player','coach','admin') DEFAULT 'player',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Players Table
CREATE TABLE players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    age INT,
    gender VARCHAR(20),
    sport VARCHAR(100),
    height DECIMAL(5,2),
    weight DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Assessments Table
CREATE TABLE assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    speed_score DECIMAL(5,2),
    agility_score DECIMAL(5,2),
    stamina_score DECIMAL(5,2),
    flexibility_score DECIMAL(5,2),
    overall_score DECIMAL(5,2),
    assessment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id)
);

-- Videos Table
CREATE TABLE videos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    video_path VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id)
);
