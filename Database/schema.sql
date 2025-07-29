-- Create the database
CREATE DATABASE volunteermgnt;
USE volunteermgnt;

-- User credentials
CREATE TABLE UserCredentials (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'volunteer') NOT NULL DEFAULT 'volunteer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Volunteer profile
CREATE TABLE userprofile (
    volunteer_id INT NOT NULL AUTO_INCREMENT,
    full_name VARCHAR(50) NOT NULL,
    address1 VARCHAR(100) NOT NULL,
    address2 VARCHAR(100),
    city VARCHAR(100) NOT NULL,
    state_name VARCHAR(100) NOT NULL,
    zipcode VARCHAR(9) NOT NULL,
    preferences TEXT,
    date_of_birth DATE NOT NULL,
    phone_number VARCHAR(10),
    PRIMARY KEY (volunteer_id)
);

-- Event details
CREATE TABLE eventdetails (
  event_id INT NOT NULL AUTO_INCREMENT,
  event_name VARCHAR(100) NOT NULL,
  required_skills TEXT NOT NULL,
  address VARCHAR(45) NOT NULL,
  state VARCHAR(45) NOT NULL,
  city VARCHAR(45) NOT NULL,
  zipcode VARCHAR(45) NOT NULL,
  urgency ENUM('Low', 'Medium', 'High') NOT NULL,
  location_name TEXT NOT NULL,
  event_duration INT NOT NULL,
  event_description TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  event_status ENUM('Pending', 'Finalized', 'Completed') DEFAULT 'Pending',
  volunteers_needed INT NOT NULL,
  PRIMARY KEY (event_id)
);


-- Notifications
CREATE TABLE notifications (
    notification_id INT NOT NULL AUTO_INCREMENT,
    message TINYTEXT NOT NULL,
    event_date DATE NOT NULL,
    receiver TINYTEXT NOT NULL,
    `read` TINYINT NOT NULL,
    PRIMARY KEY (notification_id),
    UNIQUE KEY notification_id_UNIQUE (notification_id)
);

-- Skills
CREATE TABLE skills (
    skills_id INT NOT NULL AUTO_INCREMENT,
    skill_name VARCHAR(45) NOT NULL,
    skill_description VARCHAR(45),
    PRIMARY KEY (skills_id, skill_name)
);

-- Required skills for events
CREATE TABLE required_skills (
    required_skills_id INT NOT NULL AUTO_INCREMENT,
    event_id INT NOT NULL,
    skills_id INT NOT NULL,
    PRIMARY KEY (required_skills_id, event_id, skills_id)
);

-- Volunteer availability
CREATE TABLE volunteer_availability (
    availability_id INT NOT NULL AUTO_INCREMENT,
    volunteer_id INT NOT NULL,
    date_available DATE NOT NULL,
    PRIMARY KEY (availability_id, volunteer_id)
);

-- Volunteer skills
CREATE TABLE volunteer_skills (
    volunteer_skills_id INT NOT NULL AUTO_INCREMENT,
    volunteer_id INT NOT NULL,
    skill_id INT NOT NULL,
    PRIMARY KEY (volunteer_skills_id, volunteer_id, skill_id)
);

-- Volunteer history
CREATE TABLE volunteerhistory (
    event_id INT NOT NULL,
    volunteer_id INT NOT NULL,
    email TINYTEXT NOT NULL,
    event_name TINYTEXT NOT NULL,
    participation_status JSON NOT NULL,
    PRIMARY KEY (event_id, volunteer_id)
);






