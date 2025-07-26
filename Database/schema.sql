
CREATE DATABASE volunteermgnt;
USE volunteermgnt;


CREATE TABLE States (
    state_code CHAR(2) PRIMARY KEY,
    state_name VARCHAR(100) NOT NULL
);


CREATE TABLE UserCredentials (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,  
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE UserProfile (
    profile_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    full_name VARCHAR(50) NOT NULL,
    address1 VARCHAR(100) NOT NULL,
    address2 VARCHAR(100),
    city VARCHAR(100) NOT NULL,
    state_name VARCHAR(100) NOT NULL, 
    zipcode VARCHAR(9) NOT NULL,
    skills TEXT NOT NULL,
    preferences TEXT,
    availability TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES UserCredentials(user_id) ON DELETE CASCADE
);


CREATE TABLE EventDetails (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    event_name VARCHAR(100) NOT NULL,
    event_description TEXT NOT NULL,
    event_location TEXT NOT NULL,
    required_skills TEXT NOT NULL,
    urgency ENUM('Low', 'Medium', 'High') NOT NULL,
    event_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE VolunteerHistory (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    participation_status ENUM('interested', 'registered', 'completed') NOT NULL DEFAULT 'interested',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES UserCredentials(user_id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES EventDetails(event_id) ON DELETE CASCADE
);
