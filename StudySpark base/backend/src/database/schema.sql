CREATE DATABASE IF NOT EXISTS studyspark;

USE studyspark;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  avatar_id VARCHAR(50) DEFAULT 'blob',
  email_verified BOOLEAN NOT NULL DEFAULT TRUE,
  verification_token VARCHAR(128),
  verification_expires_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS study_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  subject VARCHAR(100) NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  study_time TIME,
  duration INT,
  status VARCHAR(50) DEFAULT 'planned',
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_study_sessions_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS completed_topics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  subject VARCHAR(100) NOT NULL,
  topic VARCHAR(150) NOT NULL,
  notes TEXT,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_completed_topics_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS materials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  topic_id INT,
  title VARCHAR(150) NOT NULL,
  material_type VARCHAR(50) NOT NULL,
  content LONGTEXT,
  file_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_materials_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_materials_topic
    FOREIGN KEY (topic_id) REFERENCES completed_topics(id)
    ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS quiz_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  topic_id INT,
  study_session_id INT,
  material_id INT,
  topic_title VARCHAR(150),
  questions JSON,
  user_answers JSON,
  score DECIMAL(5,2) NOT NULL,
  revision_recommendation VARCHAR(100),
  next_revision_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_quiz_results_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_quiz_results_topic
    FOREIGN KEY (topic_id) REFERENCES completed_topics(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_quiz_results_study_session
    FOREIGN KEY (study_session_id) REFERENCES study_sessions(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_quiz_results_material
    FOREIGN KEY (material_id) REFERENCES materials(id)
    ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  priority VARCHAR(50) DEFAULT 'normal',
  scheduled_for DATETIME,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);
