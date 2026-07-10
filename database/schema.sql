CREATE DATABASE IF NOT EXISTS studyplanner;
USE studyplanner;

-- USERS

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,

    username VARCHAR(100) NOT NULL UNIQUE,

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash VARCHAR(255) NOT NULL,

    study_streak INT DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
);

-- STUDY SESSIONS

CREATE TABLE study_sessions (

    session_id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    topic VARCHAR(255) NOT NULL,

    subject VARCHAR(255),

    description TEXT,

    study_date DATETIME NOT NULL,

    duration_minutes INT DEFAULT 60,

    completed BOOLEAN DEFAULT FALSE,

    last_revised DATETIME NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE

);

-- QUIZZES

CREATE TABLE quizzes (

    quiz_id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    session_id INT NOT NULL,

    question TEXT NOT NULL,

    option_a VARCHAR(255),

    option_b VARCHAR(255),

    option_c VARCHAR(255),

    option_d VARCHAR(255),

    correct_answer VARCHAR(255),

    explanation TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE,

    FOREIGN KEY (session_id)
    REFERENCES study_sessions(session_id)
    ON DELETE CASCADE

);

-- NOTIFICATIONS

CREATE TABLE notifications (

    notification_id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    message VARCHAR(255),

    notification_type VARCHAR(50),

    is_read BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE

);

-- INDEXES

CREATE INDEX idx_user_id
ON study_sessions(user_id);

CREATE INDEX idx_topic
ON study_sessions(topic);

CREATE INDEX idx_date
ON study_sessions(study_date);

CREATE INDEX idx_completed
ON study_sessions(completed);