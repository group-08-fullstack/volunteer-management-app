CREATE DATABASE volunteermgnt;
USE volunteermgnt;


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


CREATE TABLE Notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    message VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    receiver VARCHAR(255) NOT NULL,
    read TINYINT NOT NULL DEFAULT 0
);


CREATE TABLE Skills (
    skills_id INT AUTO_INCREMENT PRIMARY KEY,
    skill_name VARCHAR(100) NOT NULL UNIQUE,
    skill_description VARCHAR(255)
);


CREATE TABLE Required_Skills (
    required_skills_id INT AUTO_INCREMENT,
    event_id INT NOT NULL,
    skills_id INT NOT NULL,
    PRIMARY KEY (required_skills_id),
    FOREIGN KEY (event_id) REFERENCES EventDetails(event_id) ON DELETE CASCADE,
    FOREIGN KEY (skills_id) REFERENCES Skills(skills_id) ON DELETE CASCADE
);


CREATE TABLE Volunteer_Skills (
    volunteer_skills_id INT AUTO_INCREMENT,
    volunteer_id INT NOT NULL,
    skill_id INT NOT NULL,
    PRIMARY KEY (volunteer_skills_id),
    FOREIGN KEY (volunteer_id) REFERENCES UserCredentials(user_id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES Skills(skills_id) ON DELETE CASCADE
);


CREATE TABLE Volunteer_Availability (
    availability_id INT AUTO_INCREMENT,
    volunteer_id INT NOT NULL,
    date_available DATE NOT NULL,
    PRIMARY KEY (availability_id),
    FOREIGN KEY (volunteer_id) REFERENCES UserCredentials(user_id) ON DELETE CASCADE
);


CREATE TABLE VolunteerHistory (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    event_name VARCHAR(100) NOT NULL,
    event_description TEXT NOT NULL,
    event_location VARCHAR(255) NOT NULL,
    required_skills TEXT NOT NULL,
    urgency ENUM('Low', 'Medium', 'High') NOT NULL,
    event_date DATE NOT NULL,
    participation_status JSON NOT NULL
);


